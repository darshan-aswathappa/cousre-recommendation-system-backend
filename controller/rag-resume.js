const client = require("../database/core");
const { MongoDBAtlasVectorSearch } = require("@langchain/mongodb");
const { OpenAIEmbeddings, ChatOpenAI } = require("@langchain/openai");
const {
  RunnablePassthrough,
  RunnableSequence,
} = require("@langchain/core/runnables");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const {
  HumanMessage,
  AIMessage,
  SystemMessage,
} = require("@langchain/core/messages");
const system_prompt = require("../core/ai/prompt/system_prompt");
const { parseResumeToJson } = require("../core/core");
const formatConvHistory = require("../core/ai/helper/formatConversationHistory");

let result;
let resumeData;
const chat_history = [];

const getSemesterPlan = async (query) => {
  const dbName = "courses";
  const db = client.db(dbName);
  const collection = db.collection("all");

  try {
    const llm = new ChatOpenAI({
      apiKey: process.env.OPEN_API_TOKEN,
      model: "gpt-4o-mini",
      temperature: 0,
    });

    const embeddings = new OpenAIEmbeddings({
      apiKey: process.env.OPEN_API_TOKEN,
    });

    const dbConfig = {
      collection: collection,
      indexName: "vector_index",
      textKey: "embedding_text",
      embeddingKey: "embedding",
    };

    const vectorStore = new MongoDBAtlasVectorSearch(embeddings, dbConfig);

    const retriever = vectorStore.asRetriever();

    const standAloneQuestionTemplate = `Given some conversation history (if any) and a question, convert it to a standalone question.
    conversation history: {conv_history}
    question: {question}
    standalone question:`;

    const standAloneQuestionPrompt = ChatPromptTemplate.fromTemplate(
      standAloneQuestionTemplate
    );

    const answerTemplate = `You are a helpful course assistant for northeastern university graduate courses, that will look through the provided questions related to the course recommendation, and based on the context provided and the conversation history. Try to find answer in the context, If the answer is not given in the context, find the answer in conversation history if possible. If you really do not know the answer, say "I'm sorry, i don't know the answer to that." Don't try to make up answers always try to be helpful and speak as if you were chatting to a friend.

    context: {context}
    conversation history: {conv_history}
    question: {question}
    answer: 
    `;

    const answerPrompt = ChatPromptTemplate.fromTemplate(answerTemplate);

    function combineDocuments(docs) {
      return docs.map((doc) => doc.pageContent).join("\n\n");
    }

    const standAloneQuestionChain = standAloneQuestionPrompt
      .pipe(llm)
      .pipe(new StringOutputParser());

    const retrieverChain = RunnableSequence.from([
      (prevResult) => prevResult.standalone_question,
      retriever,
      combineDocuments,
    ]);

    const answerChain = answerPrompt.pipe(llm).pipe(new StringOutputParser());

    const chain = RunnableSequence.from([
      {
        standalone_question: standAloneQuestionChain,
        original_input: new RunnablePassthrough(),
      },
      {
        context: retrieverChain,
        question: ({ original_input }) => original_input.question,
        conv_history: ({ original_input }) => original_input.conv_history,
      },
      answerChain,
    ]);

    result = await chain.invoke({
      question: query,
      conv_history: chat_history,
      resume_data: resumeData,
      system_template: system_prompt,
    });

    chat_history.push(new HumanMessage(query));
    chat_history.push(new AIMessage(result));
  } catch (error) {
    console.log(error);
    result = error;
  }

  return result;
};

module.exports = getSemesterPlan;
