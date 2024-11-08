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

const reviewJsonResponse = z.object({
  semester_1: z.array(
    z.object({
      subject: z.string(),
      courseId: z.string(),
      credits: z.string(),
      reasoning: z.string(),
    })
  ),
  semester_2: z.array(
    z.object({
      subject: z.string(),
      courseId: z.string(),
      credits: z.string(),
      reasoning: z.string(),
    })
  ),
  semester_3: z.array(
    z.object({
      subject: z.string(),
      courseId: z.string(),
      credits: z.string(),
      reasoning: z.string(),
    })
  ),
  semester_4: z.array(
    z.object({
      subject: z.string(),
      courseId: z.string(),
      credits: z.string(),
      reasoning: z.string(),
    })
  ),
  job_roles: z.array(
    z.object({
      role: z.string(),
      reasoning: z.string(),
      relevantCourseIds: z.array(z.string()),
    }),
    z.object({
      role: z.string(),
      reasoning: z.string(),
      relevantCourseIds: z.array(z.string()),
    }),
    z.object({
      role: z.string(),
      reasoning: z.string(),
      relevantCourseIds: z.array(z.string()),
    }),
    z.object({
      role: z.string(),
      reasoning: z.string(),
      relevantCourseIds: z.array(z.string()),
    })
  ),
});

const resumeReviewClient = async (courseData, resumeData) => {
  const completion = await aiClient.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an AI resume reviewer helping a user to create an academic plan based on their resume and provided course list. The user needs a 4-semester plan with 8 credits per semester. Make sure to follow prerequisite requirements for each subject and provide detailed reasoning for each selection. And only pick subjects from the list of subjects provided. Additionally, suggest entry-level job roles after graduation based on the person's academic plan, experience, and projects. Provide all the information in a single JSON response without any text explanation outside the JSON.Be detailed in your explanations.",
      },
      {
        role: "user",
        content: `
        The required course data: ${JSON.stringify(courseData)}
        The required resume data: ${JSON.stringify(resumeData)}
        
        You have a resume data of a person in the form of JSON ${resumeData} that includes fields such as education,
        experience, and projects. This individual is now interested in selecting
        courses from a these available courses ${courseData}. Your task is to help pick courses that
        align with their resume, skills, education, previous experiences and projects if any. In addition, create a JSON object that suggests
        entry-level detailed and very specific to courses recommended job roles after graduation with the recommended courses.

        Go through the entire courses JSON and then create a 4-semester plan where the person must and should pick a 
        compulsory 8 credits in each semester (8 credits is required to maintain student status). The course work must be dynamic, 
        subjects must be spread out and all subjects should not be picked from one discipline (For example if i have courses offered from 
        two disciplines CSYE and INFO, then make sure equal courses are recommended from each discipline).   

        The semesters are divided into Fall, Spring, Fall, and Spring. Ensure that
        when selecting subjects, you consider pre-requisites and corequisites,
        picking subjects that follow the completion of necessary prerequisites to
        avoid clashes. Reasoning for Course Selection: For each recommended
        subject, provide detailed reasoning on why it aligns with the person's
        resume, including specific references to their experiences, projects, and
        education.

        Provide expanded reasoning for each suggested role based on the recommended courses,
        work experience, and projects.

        JSON object with the format provided below. No text based response allowed.
        Return everything in a single JSON object with the semester names as keys. No text 
        should is allowed outside the JSON response. Both course recommendation and job role
        replication will be in JSON format only without any text in the response.

        `,
      },
    ],
    response_format: zodResponseFormat(reviewJsonResponse, "resume_review"),
  });

  return completion.choices[0].message.content;
};

module.exports = { parseResumeToJson, resumeReviewClient };
