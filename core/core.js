const OpenAI = require("openai");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const { zodResponseFormat } = require("openai/helpers/zod");
const z = require("zod");

const resumeJsonResponse = z.object({
  name: z.string(),
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

const openai = new OpenAI({
  apiKey: process.env.OPEN_API_TOKEN,
});

const parseResumeToJson = async (resumePath) => {
  try {
    const dataBuffer = fs.readFileSync(resumePath);
    const pdfData = await pdfParse(dataBuffer);
    const responseData = await passTextToOpenAI(pdfData.text);
    const jsonData = JSON.parse(responseData);
    const education = jsonData.education;
    const experience = jsonData.experience;
    const projects = jsonData.projects;
    return { education, experience, projects };
  } catch (error) {
    throw error;
  }
};

const passTextToOpenAI = async (text) => {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You extract text data into JSON data.",
      },
      {
        role: "user",
        content: `using the text ${text} build a parsed json structure as JSON and not as a string or text.`,
      },
    ],
    response_format: zodResponseFormat(resumeJsonResponse, "event"),
  });

  return completion.choices[0].message.content;
};

module.exports = parseResumeToJson;
