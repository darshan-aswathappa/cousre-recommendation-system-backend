const { z } = require("zod");
const aiClient = require("../../core/ai/init");
const claudeAiClient = require("../../core/ai/anthropicAi");

// const callFetchAgent = async (client, query, parsedData) => {
//   const dbName = "courses";
//   const db = client.db(dbName);
//   const collection = db.collection("all");

//   const courseNames = query.split(",").map((course) => course.trim());

//   const courseDocs = await collection
//     .find({
//       name: { $in: courseNames },
//     })
//     .toArray();

//   const ratedCourses = [];

//   for (const doc of courseDocs) {
//     const { embedding, embedding_text, ...courseDetails } = doc;
// const prompt = `
// Rate the relevance of the course "${doc.name} ${doc.number} - ${
//   doc.subjectName
// } with description ${doc.description} which as a pre-requisite of ${
//   doc.prerequisites
// } and core-requisite of ${
//   doc.corequisites
// }" based on the following resume data: ${JSON.stringify(
//   parsedData
// )}. The rating should be from 0 to 100, based on how well the course aligns with the resume.

// When evaluating the relevance of a course to the user's resume, consider the following criteria to determine a score between 0-100. The score should reflect how well the course aligns with the user's educational background, professional experience, skills, and career goals as outlined in their resume:

// Score Ranges and Their Meaning:
// * 0-25: No match at all (irrelevant):
//   - The course has no alignment with the user's resume.
//   - The skills, knowledge, or outcomes of the course do not contribute to the user's goals or career trajectory.
//   - Example Indicators:
//       - The user's resume focuses on software engineering, but the course is about biomedical research.
//       - No overlap between the user's prior experience or skills and the course description or objectives.
// * 25-50: Weak Match (Slight Relevance):
//   - There is a minimal overlap between the course content and the user's resume.
//   - The course may touch on skills or topics the user is familiar with, but it is not central to their expertise or goals.
//   - Example Indicators:
//       - The user's resume lists basic programming experience, and the course is an introductory programming course (not advancing existing skills).
//       - The course could add value but is not critical for the user's aspirations.
// * 50-75: Moderate Match (Relevant):
//   - The course content is moderately aligned with the user's experience, skills, or career objectives.
//   - It enhances or builds on existing knowledge but may lack direct application or full synergy with the user's goals.
//   - Example Indicators:
//       - The user has experience in web development, and the course offers front-end frameworks that the user has not yet mastered.
//       - The course content bridges gaps in the user's knowledge or provides moderate career advancement potential.
// * 75-100: Strong Match (Highly Relevant):
//   - The course is a perfect match for the user's background, skillset, and career aspirations.
//   - It directly builds on the user's existing expertise or aligns perfectly with their desired growth area.
//   - Example Indicators:
//       - The user's resume shows experience in full-stack development, and the course covers advanced full-stack frameworks or cutting-edge technologies in the same field.
//       - The course content provides immediate and significant value, enabling the user to achieve their professional goals faster.

// * Evaluation Criteria for Relevance
//   - Skills Alignment (30% weight):

//     * Does the course directly align with the skills mentioned in the resume?
//     * Does it enhance or refine skills already possessed by the user?
//     * Does it introduce new skills critical to the user's field of interest or expertise?

//   - Career Goals Alignment (30% weight):
//     * Does the course content contribute directly to achieving the user's stated career objectives?
//     * Does it provide immediate and significant value toward the user's professional growth?

//   - Learning Gaps (20% weight):
//     * Does the course address key knowledge or skill gaps that would enhance the user's career potential?
//     * Is it an essential stepping stone to mastering advanced concepts relevant to the user's field?

//   - Industry/Domain Relevance (20% weight):
//     * Is the course directly related to the industries or domains mentioned in the resume?
//     * Does it focus on technologies, methodologies, or concepts central to the user's field?

// * Dynamic Scoring Instructions for AI
//   - When assigning a score:
//     1. Analyze the Resume: Review the user's past experiences, skills, and stated career objectives. Identify key themes (e.g., areas of expertise, industries, technologies).
//     2. Compare to the Course: Match these resume themes with the course description, objectives, and learning outcomes.
//     3. Consider Relevance:
//       - Skills Alignment: Does the course enhance or refine the user's existing skills?
//       - Career Goals: Does the course align with the user's stated aspirations?
//       - Learning Gap: Will the course fill critical gaps in the user's knowledge or skills?
//     4. Assign a Score: Dynamically select a score (0-100) based on the relevance criteria above.

// * Example Scenarios
//     1. Resume Focus: Data Science with Python
//       - Course: Advanced Machine Learning
//       - Score: >=80 and <=90 (Highly Relevant, builds directly on the user's expertise).

//     2. Resume Focus: Software Engineering
//       - Course: Principles of Robotics
//       - Score: >= 40 and <= 50 (Slightly Relevant, shares some conceptual overlap but is not central to the user's goals).

//     3. Resume Focus: Software Engineering
//       - Course: Quantum Computing
//       - Score: >= 50 and <= 70 (Moderately Relevant, provides tools that could be applied to quantum computing).

//     4. Resume Focus: Software Engineering
//       - Courses: Marketing
//       - Score: 0

//     5. Resume Focus: Software Engineering
//       - Course: Web Design and Web Development
//       - Score: >=90

// Ensure as much accuracy as possible, do not hesitate to rank a course lower, make user-centric recommendations by dynamically checking each course against the resume.

// Now consider the following TypeScript Interface for the JSON schema: (i will be parsing using JSON parse, so give me a strict JSON)

//       interface ResponseItem {
//       ranking: number,
//       fullDetailedReasoning: string
//     }
// `;

//     const modelResponse = await claudeAiClient.messages.create({
//       model: "claude-3-5-sonnet-20241022",
//       max_tokens: 8024,
//       messages: [{ role: "user", content: prompt }],
//     });

//     const parsedResponse = JSON.parse(modelResponse.content[0].text);
//     const rating = parseInt(parsedResponse.ranking, 10);
//     ratedCourses.push({
//       ...courseDetails,
//       rank: rating,
//       pickReason: parsedResponse.fullDetailedReasoning,
//       hasPreReq: doc.prerequisites != "None",
//       hasCoreReq: doc.corequisites != "None",
//     });
//   }

//   return ratedCourses;
// };

const processBatch = async (client, courses, parsedData) => {
  const dbName = "courses";
  const db = client.db(dbName);
  const collection = db.collection("all");

  // Fetch course documents for the batch
  const courseDocs = await collection
    .find({
      name: { $in: courses },
    })
    .toArray();

  const ratedCourses = [];

  for (const doc of courseDocs) {
    const { embedding, embedding_text, ...courseDetails } = doc;
    const prompt = `
    Rate the relevance of the course "${doc.name} ${doc.number} - ${
      doc.subjectName
    } with description ${doc.description} which as a pre-requisite of ${
      doc.prerequisites
    } and core-requisite of ${
      doc.corequisites
    }" based on the following resume data: ${JSON.stringify(
      parsedData
    )}. The rating should be from 0 to 100, based on how well the course aligns with the resume.

    When evaluating the relevance of a course to the user's resume, consider the following criteria to determine a score between 0-100. The score should reflect how well the course aligns with the user's educational background, professional experience, skills, and career goals as outlined in their resume:

    Score Ranges and Their Meaning:
    * 0-25: No match at all (irrelevant):
      - The course has no alignment with the user's resume.
      - The skills, knowledge, or outcomes of the course do not contribute to the user's goals or career trajectory.
      - Example Indicators:
          - The user's resume focuses on software engineering, but the course is about biomedical research.
          - No overlap between the user's prior experience or skills and the course description or objectives.
    * 25-50: Weak Match (Slight Relevance):
      - There is a minimal overlap between the course content and the user's resume.
      - The course may touch on skills or topics the user is familiar with, but it is not central to their expertise or goals.
      - Example Indicators:
          - The user's resume lists basic programming experience, and the course is an introductory programming course (not advancing existing skills).
          - The course could add value but is not critical for the user's aspirations.
    * 50-75: Moderate Match (Relevant):
      - The course content is moderately aligned with the user's experience, skills, or career objectives.
      - It enhances or builds on existing knowledge but may lack direct application or full synergy with the user's goals.
      - Example Indicators:
          - The user has experience in web development, and the course offers front-end frameworks that the user has not yet mastered.
          - The course content bridges gaps in the user's knowledge or provides moderate career advancement potential.
    * 75-100: Strong Match (Highly Relevant):
      - The course is a perfect match for the user's background, skillset, and career aspirations.
      - It directly builds on the user's existing expertise or aligns perfectly with their desired growth area.
      - Example Indicators:
          - The user's resume shows experience in full-stack development, and the course covers advanced full-stack frameworks or cutting-edge technologies in the same field.
          - The course content provides immediate and significant value, enabling the user to achieve their professional goals faster.

    * Evaluation Criteria for Relevance
      - Skills Alignment (30% weight):

        * Does the course directly align with the skills mentioned in the resume?
        * Does it enhance or refine skills already possessed by the user?
        * Does it introduce new skills critical to the user's field of interest or expertise?

      - Career Goals Alignment (30% weight):
        * Does the course content contribute directly to achieving the user's stated career objectives?
        * Does it provide immediate and significant value toward the user's professional growth?

      - Learning Gaps (20% weight):
        * Does the course address key knowledge or skill gaps that would enhance the user's career potential?
        * Is it an essential stepping stone to mastering advanced concepts relevant to the user's field?

      - Industry/Domain Relevance (20% weight):
        * Is the course directly related to the industries or domains mentioned in the resume?
        * Does it focus on technologies, methodologies, or concepts central to the user's field?

    * Dynamic Scoring Instructions for AI
      - When assigning a score:
        1. Analyze the Resume: Review the user's past experiences, skills, and stated career objectives. Identify key themes (e.g., areas of expertise, industries, technologies).
        2. Compare to the Course: Match these resume themes with the course description, objectives, and learning outcomes.
        3. Consider Relevance:
          - Skills Alignment: Does the course enhance or refine the user's existing skills?
          - Career Goals: Does the course align with the user's stated aspirations?
          - Learning Gap: Will the course fill critical gaps in the user's knowledge or skills?
        4. Assign a Score: Dynamically select a score (0-100) based on the relevance criteria above.

    * Example Scenarios
        1. Resume Focus: Data Science with Python
          - Course: Advanced Machine Learning
          - Score: >=80 and <=90 (Highly Relevant, builds directly on the user's expertise).

        2. Resume Focus: Software Engineering
          - Course: Principles of Robotics
          - Score: >= 40 and <= 50 (Slightly Relevant, shares some conceptual overlap but is not central to the user's goals).

        3. Resume Focus: Software Engineering
          - Course: Quantum Computing
          - Score: >= 50 and <= 70 (Moderately Relevant, provides tools that could be applied to quantum computing).

        4. Resume Focus: Software Engineering
          - Courses: Marketing
          - Score: 0

        5. Resume Focus: Software Engineering
          - Course: Web Design and Web Development
          - Score: >=90

    Ensure as much accuracy as possible, do not hesitate to rank a course lower, make user-centric recommendations by dynamically checking each course against the resume.

    Now consider the following TypeScript Interface for the JSON schema: (i will be parsing using JSON parse, so give me a strict JSON)

          interface ResponseItem {
          ranking: number,
          fullDetailedReasoning: string
        }
    `;

    const modelResponse = await claudeAiClient.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 8024, // Adjust as needed
      messages: [{ role: "user", content: prompt }],
    });

    const parsedResponse = JSON.parse(modelResponse.content[0].text);
    const rating = parseInt(parsedResponse.ranking, 10);

    ratedCourses.push({
      ...courseDetails,
      rank: rating,
      pickReason: parsedResponse.fullDetailedReasoning,
      hasPreReq: doc.prerequisites != "None",
      hasCoreReq: doc.corequisites != "None",
    });
  }

  return ratedCourses;
};

const callFetchAgent = async (client, query, parsedData) => {
  const courseNames = query.split(",").map((course) => course.trim());
  const batchSize = 5;

  const courseBatches = [];

  for (let i = 0; i < courseNames.length; i += batchSize) {
    courseBatches.push(courseNames.slice(i, i + batchSize));
  }

  const allRatedCourses = [];

  for (const batch of courseBatches) {
    const ratedCourses = await processBatch(client, batch, parsedData);
    allRatedCourses.push(...ratedCourses);
  }

  return allRatedCourses;
};

module.exports = callFetchAgent;
