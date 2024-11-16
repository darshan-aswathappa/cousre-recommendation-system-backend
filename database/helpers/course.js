const client = require("../core");
const generateEmbedding = require("../../core/ai/helper/embeddings");

const db = client.db("courses");
const collection = db.collection("all");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const storeCourseInCollection = async (courseData) => {
  const insertedCourses = [];

  for (const element of courseData) {
    const summary = `${element.name || ""} ${element.number || ""} - ${
      element.subjectName || ""
    }. ${element.description || ""} Prerequisites: ${
      element.prerequisites || "None"
    }. Corequisites: ${element.corequisites || "None"}. Credits: ${
      element.credits || "N/A"
    }.`;

    try {
      console.log(`Generating embeddings for ${element.subjectName}!`);

      const embedding = await generateEmbedding(summary);
      element.embedding_text = summary;
      element.embedding = embedding;

      const result = await collection.insertOne(element);
      if (result.insertedId) {
        insertedCourses.push(element);
      }
    } catch (error) {
      if (error.message.includes("Rate limit")) {
        console.warn("Rate limit reached. Waiting 1 second before retrying.");
        await delay(1000);
      } else {
        console.error(`Error storing course: ${element.name}`, error);
      }
    }

    await delay(100);
  }

  return insertedCourses.length > 0 ? insertedCourses : courseData;
};

module.exports = storeCourseInCollection;
