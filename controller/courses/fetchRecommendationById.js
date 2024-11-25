const client = require("../../database/core");
const { ObjectId } = require("mongodb");

const getResumeDataById = async (req, res) => {
  const db = client.db("test");
  const collection = db.collection("users");

  try {
    const userId = req.params.userId;
    const resumeDataId = req.params.resumeDataId;

    const user = await collection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.resumeData || user.resumeData.length === 0) {
      return res.status(404).json({ error: "Resume data not found" });
    }

    const resumeObject = user.resumeData.find(
      (item) => item._id && item._id.equals(new ObjectId(resumeDataId))
    );

    if (!resumeObject) {
      return res.status(404).json({ error: "Resume object not found" });
    }

    res.send(resumeObject);
  } catch (error) {
    console.error("Error retrieving resume data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = getResumeDataById;
