const client = require("../core");
const generateEmbedding = require("../../core/ai/helper/embeddings");

const db = client.db("courses");
const collection = db.collection("all");

const storeCourseInCollection = async (courseData) => {
  const insertedCourses = [];

  await Promise.all(
    courseData.map(async (element) => {
      const summary = `${element.name || ""} ${element.number || ""} - ${
        element.subject || ""
      }. ${element.description || ""} Prerequisites: ${
        element.prerequisites || "None"
      }. Corequisites: ${element.corequisites || "None"}. Credits: ${
        element.credits || "N/A"
      }.`;

      const existingCourse = await collection.findOne({
        name: element.name,
        number: element.number,
      });

      if (!existingCourse) {
        const embedding = await generateEmbedding(summary);
        element.embedding_text = summary;
        element.embedding = embedding;

        const result = await collection.insertOne(element);
        if (result.insertedId) {
          insertedCourses.push(element);
        }
      }
    })
  );
  return insertedCourses.length > 0 ? insertedCourses : courseData;
};

module.exports = storeCourseInCollection;
