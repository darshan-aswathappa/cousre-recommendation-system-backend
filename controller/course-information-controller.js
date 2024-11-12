const client = require("../database/core");
const { getProfessorInd } = require("../controller/professor-controller");
const { MongoDBAtlasVectorSearch } = require("@langchain/mongodb");
const { OpenAIEmbeddings, ChatOpenAI } = require("@langchain/openai");
const { z } = require("zod");
const { tool } = require("@langchain/core/tools");
const { parseResumeToJson } = require("../core/core");
const {
  RunnablePassthrough,
  RunnableSequence,
} = require("@langchain/core/runnables");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { log } = require("winston");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const formatConvHistory = require("../core/ai/helper/formatConversationHistory");

const courseInformationController = async (req, res) => {
  const llmResponse = await courseInformation(req.body.message);
  res.send(llmResponse);
};

const chat_history = [];

const courseInformation = async (query) => {
  const dbName = "syllabus";
  const db = client.db(dbName);
  const collection = db.collection("spring2025");

  let result;

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

    const answerTemplate = `You are a helpful data processor for Spring 2025 courses, that will look through the the provided questions related to the courses and professor, based on the context provided and the conversation history. Try to find answer in the context, If the answer is not given in the context, find the answer in conversation history if possible. If you really do not know the answer, say "I'm sorry, i don't know the answer to that." Don't try to make up answers always try to be helpful and speak as if you were chatting to a friend.
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
      conv_history: formatConvHistory(chat_history),
    });

    chat_history.push(query);
    chat_history.push(result);
  } catch (error) {
    result = error;
  }

  return result;
};

module.exports = courseInformationController;
