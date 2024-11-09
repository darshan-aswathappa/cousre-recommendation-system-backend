const { MongoDBAtlasVectorSearch } = require("@langchain/mongodb");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { ChatAnthropic } = require("@langchain/anthropic");
const { tool } = require("@langchain/core/tools");
const { parseResumeToJson } = require("../core/core");
const { z } = require("zod");
const { ToolNode } = require("@langchain/langgraph/prebuilt");
const {
  ChatPromptTemplate,
  MessagesPlaceholder,
} = require("@langchain/core/prompts");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
const { StateGraph, Annotation } = require("@langchain/langgraph");
const { MongoDBSaver } = require("@langchain/langgraph-checkpoint-mongodb");
const generateEmbedding = require("../core/ai/helper/embeddings");
const system_prompt = require("../core/ai/prompt/system_prompt");

const callAgent = async (client, query, thread_id) => {
  const dbName = "courses";
  const db = client.db(dbName);
  const collection = db.collection("all");

  const GraphState = Annotation.Root({
    messages: Annotation({
      reducer: (x, y) => x.concat(y),
    }),
  });

  const courseLookupTool = tool(
    async ({ query, n = 10 }) => {
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
        query: z.string().describe("The search query"),
        n: z
          .number()
          .optional()
          .default(8)
          .describe("Number of results to return"),
      }),
    }
  );

  const parseJsonTool = tool(
    async ({ filePath }) => {
      console.log("resume parse tool was called!");

      const parsedData = await parseResumeToJson(filePath);
      return parsedData;
    },
    {
      name: "json_parser",
      description:
        "Parses a JSON file to extract structured data for further processing",
      schema: z.object({
        filePath: z.string().describe("The path to the JSON file"),
      }),
    }
  );

  const tools = [parseJsonTool, courseLookupTool];
  const toolNode = new ToolNode(tools);

  const model = new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: "claude-3-5-sonnet-20241022",
    temperature: 0,
  }).bindTools(tools);

  async function callModel(state) {
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", system_prompt],
      new MessagesPlaceholder("messages"),
    ]);

    const parsedData = state.context?.parsedData;

    const formattedPrompt = await prompt.formatMessages({
      resume_data: JSON.stringify(parsedData),
      time: new Date().toISOString(),
      tool_names: tools.map((tool) => tool.name).join(","),
      messages: state.messages,
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
    .addNode("parse_json", async (state) => {
      const parsedData = await parseJsonTool.invoke({
        filePath: "./darshan.pdf",
      });
      state.context = { ...state.context, parsedData };
      return {
        messages: [
          new HumanMessage(`Resume parsed data: ${JSON.stringify(parsedData)}`),
        ],
      };
    })
    .addNode("agent", callModel)
    .addNode("tools", toolNode)
    .addEdge("__start__", "parse_json")
    .addEdge("parse_json", "agent")
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

module.exports = callAgent;
