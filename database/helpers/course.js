const client = require("../core");
const CourseModel = require("../model/course_model");

const db = client.db("courses");

const collectionExists = async (courseName) => {
  const collections = await db.listCollections().toArray();
  return collections.some((collection) => collection.name === courseName);
};

const getCourseFromCollection = async (courseName) => {
  const collection = db.collection(courseName);
  return await collection.find({}, { projection: { _id: 0 } }).toArray();
};

const storeCourseInCollection = async (courseName, courseData) => {
  const collection = db.collection(courseName);
  await collection.insertMany(courseData);
};

module.exports = {
  collectionExists,
  getCourseFromCollection,
  storeCourseInCollection,
};
