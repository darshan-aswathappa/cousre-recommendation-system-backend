const ppxResume = async (courseData, resumeData) => {
  const bodyData = {
    model: "llama-3.1-sonar-small-128k-online",
    // top_p: 1,
    // temperature: 1,
    // presence_penalty: 0.5,
    // frequency_penalty: 0.8,
    messages: [
      {
        role: "system",
        content:
          "You are an AI resume reviewer helping a user to create an academic plan based on their resume and provided course list. The user needs a 4-semester plan with 2 subjects per semester. Make sure to follow prerequisite requirements for each subject and provide detailed reasoning for each selection. And only pick subjects from the list of subjects provided. Additionally, suggest entry-level job roles after graduation based on the person's academic plan, experience, and projects. Provide all the information in a single JSON response without any text explanation outside the JSON.Be detailed in your explanations.",
      },
      {
        role: "user",
        content: `

          The required course data: ${JSON.stringify(courseData)}
          The required resume data: ${JSON.stringify(resumeData)}

          Prompt:

          You have a resume of a person that includes fields such as education,
          experience, and projects. This individual is now interested in selecting
          courses from a provided JSON list. Your task is to help pick courses that
          align with their resume. In addition, create a JSON object that suggests
          entry-level job roles after graduation with the recommended courses.

          Requirements: 4-Semester Plan: Create a 4-semester plan where the person
          must pick 2 subjects (8 credits) in each semester.

          The semesters are divided into Fall, Spring, Fall, and Spring. Ensure that
          when selecting subjects, you consider pre-requisites and corequisites,
          picking subjects that follow the completion of necessary prerequisites to
          avoid clashes. Reasoning for Course Selection: For each recommended
          subject, provide detailed reasoning on why it aligns with the person's
          resume, including specific references to their experiences, projects, and
          education.

          Provide expanded reasoning for each suggested role based on the recommended courses,
          work experience, and projects.

          Output: JSON object with the format provided below. No text based response allowed.
          Return everything in a single JSON object with the semester names as keys. No text 
          should is allowed outside the JSON response. Both course recommendation and job role
          replication will be in JSON format only without any text in the response.

          JSON Format:

          {
          "semester_1": [
            {"subject": "String", "courseId": "String", "credits": "Number", "reasoning" : "String"},
          ],
          "semester_2": [
            {"subject": "String", "courseId": "String", "credits": "Number", "reasoning" : "String"},
          ],
          "semester_3": [
            {"subject": "String", "courseId": "String", "credits": "Number", "reasoning" : "String"},
          ],
          "semester_4": [
            {"subject": "String", "courseId": "String", "credits": "Number", "reasoning" : "String"},
          ],
          "Job Roles": [
            {
              "role": "String",
              "reasoning": "String"
            }
          ]
        }
        `,
      },
    ],
  };

  const options = {
    method: "POST",
    headers: {
      Authorization:
        "Bearer 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",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyData),
  };

  try {
    const response = await fetch(
      "https://api.perplexity.ai/chat/completions",
      options
    );
    const responseData = await response.json();
    console.log(responseData);
    const content = responseData.choices[0].message.content;
    console.log(content);

    const parsedContent = JSON.parse(
      content.replace("```json", "").replace("```", "")
    );
    return parsedContent;
    return null;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports = ppxResume;
