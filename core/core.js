const fs = require("fs");
const pdfParse = require("pdf-parse");
const { zodResponseFormat } = require("openai/helpers/zod");
const z = require("zod");
const aiClient = require("./ai/init");
const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const generateEmbedding = require("./ai/helper/embeddings");

const resumeJsonResponse = z.object({
  email: z.string(),
  location: z.string(),
  skills: z.string() || null,
  education:
    z.array(
      z.object({
        college: z.string(),
        degree: z.string(),
        location: z.string(),
      })
    ) || null,
  experience:
    z.array(
      z.object({
        company: z.string(),
        role: z.string(),
        location: z.string(),
        workDescription: z.string(),
        startDate: z.string(),
        endDate: z.string(),
      })
    ) || null,
  projects:
    z.array(
      z.object({
        projectName: z.string(),
        projectDescription: z.string(),
      })
    ) || null,
});

const parseResumeToJson = async (dataBuffer) => {
  console.log("called resume parser");
  try {
    const pdfData = await pdfParse(dataBuffer);
    const responseData = await passTextToOpenAI(pdfData.text);
    const jsonData = JSON.parse(responseData);
    const email = jsonData.email;
    const skills = jsonData.skills;
    const location = jsonData.location;
    const education = jsonData.education;
    const experience = jsonData.experience;
    const projects = jsonData.projects;
    return { location, email, skills, education, experience, projects };
  } catch (error) {
    return {};
  }
};

const passTextToOpenAI = async (text) => {
  const completion = await aiClient.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a personal assistant whose job is to extract text data from a pdf file and build a JSON out of it.",
      },
      {
        role: "user",
        content: `using the text ${text} build a parsed json structure as JSON and not as a string or text. Do follow a structure where you extract the
        location, email, skills, education, experience, projects. if any of the following is not available then leave that
        particular object empty in the JSON. If you cannot figure out any fields do not worry and continue with other fields, keep the unknown field blank.`,
      },
    ],
    response_format: zodResponseFormat(resumeJsonResponse, "resume_fields"),
  });

  return completion.choices[0].message.content;
};

const generateResumeEmbeddings = async (resumePath) => {
  try {
    const loader = new PDFLoader(resumePath);
    const docs = await loader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const chunkedDocs = await textSplitter.splitDocuments(docs);
    const validChunks = chunkedDocs.filter(
      (doc) => doc.pageContent && doc.pageContent.trim().length > 0
    );
    const chunkedTexts = validChunks.map((doc) => doc.pageContent);
    const pdfEmbedding = await generateEmbedding(chunkedTexts);
    return pdfEmbedding;
  } catch (error) {
    console.error(error);
    throw new Error("PDF docs chunking failed !");
  }
};

module.exports = { parseResumeToJson, generateResumeEmbeddings };
