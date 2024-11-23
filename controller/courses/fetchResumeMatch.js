const callFetchAgent = require("./callFetchAgentController");
const { parseResumeToJson } = require("../../core/core");
const system_prompt = require("../../core/ai/prompt/system_prompt");
const client = require("../../database/core");
const testData = require("../../asset/dummy_data.json");

const fetchResumeMatchController = async (req, res) => {
  const initialMessage = req.body.message;
  let response;
  try {
    if (process.env.NODE_ENV == "production") {
      const resumeData = await parseResumeToJson("./darshan.pdf");
      response = await callFetchAgent(client, initialMessage, resumeData);
    }
    response = testData;
    console.log("Displaying mock data.");
    setTimeout(() => {
      res.send(response);
    }, 5000);
  } catch (error) {
    console.error("Error starting conversation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = fetchResumeMatchController;
