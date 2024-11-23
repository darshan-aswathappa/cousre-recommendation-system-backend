const client = require("../../database/core");
const { ObjectId } = require("mongodb");

const getCourseRecommendationById = async (req, res) => {
  const db = client.db("courses");
  const collection = db.collection("all");
  try {
    const id = req.params.id;
    const response = await collection.findOne(
      { _id: new ObjectId(id) },
      { projection: { _id: 0, __v: 0, embedding: 0 } }
    );
    res.send(response);
  } catch (error) {
    console.error("Error starting conversation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = getCourseRecommendationById;
