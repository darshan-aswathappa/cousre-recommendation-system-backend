const callFetchAgent = require("./callFetchAgentController");
const { parseResumeToJson } = require("../../core/core");
const client = require("../../database/core");
const testData = require("../../asset/dummy_data.json");
const User = require("../../database/model/user.model");
const { ObjectId } = require("mongodb");

const fastProd = true;

const fetchResumeMatchController = async (req, res) => {
  const initialMessage = req.body.message;
  const userId = req.body.userId;

  if (fastProd) {
    setTimeout(() => {
      res.send(testData);
    }, 60000);
  }

  try {
    const user = await User.findOne({ _id: new ObjectId(userId) });
    let prodResponse;
    if (user.resumeData === null || user.userResumeParsedDetails === null) {
      console.log("Building resume recommendation");
      prodResponse = await callFetchAgent(
        client,
        initialMessage,
        user.userResumeParsedDetails
      );
      user.resumeData = prodResponse;
      user.selectedCourses = initialMessage;
      await user.save();
      console.log("Saved Resume data");
    } else {
      console.log("Resume recommendation already exists");
      prodResponse = user.resumeData;
    }
    console.log("Displaying production data.");
    res.send(prodResponse);
  } catch (error) {
    console.error("Error starting conversation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = fetchResumeMatchController;
