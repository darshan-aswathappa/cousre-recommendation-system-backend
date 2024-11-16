const { MongoDBAtlasVectorSearch } = require("@langchain/mongodb");
const { OpenAIEmbeddings, ChatOpenAI } = require("@langchain/openai");
const { z } = require("zod");
const { tool } = require("@langchain/core/tools");
const { ToolNode } = require("@langchain/langgraph/prebuilt");
const {
  ChatPromptTemplate,
  MessagesPlaceholder,
} = require("@langchain/core/prompts");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
const { StateGraph, Annotation } = require("@langchain/langgraph");
const { MongoDBSaver } = require("@langchain/langgraph-checkpoint-mongodb");
const { StructuredOutputParser } = require("langchain/output_parsers");
const generateEmbedding = require("../../core/ai/helper/embeddings");
const system_prompt = require("../../core/ai/prompt/system_prompt");

const callFetchAgent = async (client, query, parsedData, thread_id) => {
  const dbName = "courses";
  const db = client.db(dbName);
  const collection = db.collection("all");

  const CourseSchema = z.object({
    courseName: z.string().describe("Full name of the course"),
    courseNumber: z.string().describe("Course number"),
    courseDescription: z
      .string()
      .describe("Fully detailed description of the course being picked."),
    reasoning: z
      .string()
      .describe(
        "Fully Detailed reasoning as to why the course was picked and how it aligns with the users resume, what data in the users resume made you feel this was a right choice. Be very particular and highlight the exact points in the resume that made you think this course is a good fit for the user. Also point and mention the experiences or projects that helped you pick this course."
      ),
    credits: z.number().describe("Total credits for the picked course"),
    prerequisites: z
      .string()
      .describe("Detailed information about the course prerequisites if any"),
    corequisites: z
      .string()
      .describe("Detailed information about the course corequisites if any"),
  });

  const SemesterSchema = z.array(CourseSchema);

  const CoursePlanSchema = z.object({
    semester_1: SemesterSchema,
    semester_2: SemesterSchema,
    semester_3: SemesterSchema,
    semester_4: SemesterSchema,
  });

  const outputParser = StructuredOutputParser.fromZodSchema(CoursePlanSchema);

  const GraphState = Annotation.Root({
    messages: Annotation({
      reducer: (x, y) => x.concat(y),
    }),
  });

  const courseLookupTool = tool(
    async ({ query, n }) => {
      console.log("course lookup tool was called");

      const dbConfig = {
        collection: collection,
        indexName: "vector_index",
        textKey: "embedding_text",
        embeddingKey: "embedding",
      };

      const embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPEN_API_TOKEN,
      });

      const vectorStore = new MongoDBAtlasVectorSearch(embeddings, dbConfig);
      const queryEmbedding = await generateEmbedding(query);
      const result = await vectorStore.similaritySearchVectorWithScore(
        queryEmbedding,
        n
      );
      return JSON.stringify(result);
    },
    {
      name: "course_lookup",
      description:
        "Gathers course related information for a user's resume based on the parsed JSON data.",
      schema: z.object({
        query: z
          .string()
          .describe(
            "The search query, the search query will have the courses from which the user would like the subjects to be picked from."
          ),
        n: z.number().describe("Number of results to return"),
      }),
    }
  );

  const tools = [courseLookupTool];
  const toolNode = new ToolNode(tools);

  const model = new ChatOpenAI({
    apiKey: process.env.OPEN_API_TOKEN,
    model: "gpt-4o-mini",
    temperature: 0,
  }).bindTools(tools);

  async function callModel(state) {
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", system_prompt],
      new MessagesPlaceholder("messages"),
    ]);

    const formattedPrompt = await prompt.formatMessages({
      resume_data: parsedData,
      time: new Date().toISOString(),
      tool_names: tools.map((tool) => tool.name).join(","),
      messages: state.messages,
      format_instructions: outputParser.getFormatInstructions(),
      courses: query,
    });

    const result = await model.invoke(formattedPrompt);

    return { messages: [result] };
  }

  function shouldContinue(state) {
    const messages = state.messages;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.tool_calls?.length) {
      return "tools";
    }
    return "__end__";
  }

  const workflow = new StateGraph(GraphState)
    .addNode("agent", callModel)
    .addNode("tools", toolNode)
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");

  const checkpoint = new MongoDBSaver({ client, dbName });

  const app = workflow.compile({ checkpoint });

  const finalState = await app.invoke(
    {
      messages: [new HumanMessage(query)],
    },
    { recursionLimit: 15, configurable: { thread_id: thread_id } }
  );

  return finalState.messages[finalState.messages.length - 1].content;
};

module.exports = callFetchAgent;
