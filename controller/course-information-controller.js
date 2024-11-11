const client = require("../database/core");
const { getProfessorInd } = require("../controller/professor-controller");
const generateEmbedding = require("../core/ai/helper/embeddings");
const { MongoDBAtlasVectorSearch } = require("@langchain/mongodb");
const { OpenAIEmbeddings, ChatOpenAI } = require("@langchain/openai");
const { z } = require("zod");
const { tool } = require("@langchain/core/tools");
const { parseResumeToJson } = require("../core/core");
const { ToolNode } = require("@langchain/langgraph/prebuilt");
const {
  ChatPromptTemplate,
  MessagesPlaceholder,
} = require("@langchain/core/prompts");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
const { StateGraph, Annotation } = require("@langchain/langgraph");
const { MongoDBSaver } = require("@langchain/langgraph-checkpoint-mongodb");

const courseInformationController = async (req, res) => {};

const courseInformation = async (query, thread_id) => {
  const dbName = "syllabus";
  const db = client.db(dbName);
  const collection = db.collection("spring2025");
};

module.exports = courseInformationController;
