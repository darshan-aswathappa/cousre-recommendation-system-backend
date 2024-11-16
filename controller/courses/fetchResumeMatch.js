const callFetchAgent = require("./callFetchAgentController");
const { parseResumeToJson } = require("../../core/core");
const system_prompt = require("../../core/ai/prompt/system_prompt");
const client = require("../../database/core");

const fetchResumeMatchController = async (req, res) => {
  const initialMessage = req.body.message;
  const thread = req.query.threadId;
  const threadId = Date.now().toString();

  const message = `
  courses: ${initialMessage} 
  system template with data and rules: ${system_prompt}`;

  try {
    const resumeData = await parseResumeToJson("./darshan.pdf");
    const response = await callFetchAgent(client, message, resumeData, thread);
    const serialized_response = response
      .replace("```json", "")
      .replace("```", "");
    res.json({
      threadId,
      res: JSON.parse(serialized_response),
    });
  } catch (error) {
    console.error("Error starting conversation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = fetchResumeMatchController;
