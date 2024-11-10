const fs = require("fs");
const pdfParse = require("pdf-parse");
const { zodResponseFormat } = require("openai/helpers/zod");
const z = require("zod");
const aiClient = require("./ai/init");

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

const parseResumeToJson = async (resumePath) => {
  console.log("called resume parser");
  try {
    const dataBuffer = fs.readFileSync(resumePath);
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

module.exports = { parseResumeToJson };
