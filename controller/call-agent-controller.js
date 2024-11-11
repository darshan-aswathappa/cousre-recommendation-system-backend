const callAgent = require("../controller/rag-resume");
const client = require("../database/core");
const system_prompt = require("../core/ai/prompt/system_prompt");
const jsonExtractor = require("../core/ai/helper/json_extractor");
const { parseResumeToJson, generateResumeEmbeddings } = require("../core/core");

const callAgentController = async (req, res) => {
  const initialMessage = req.body.message;
  const threadId = Date.now().toString();

  const message = `
  courses: ${initialMessage} 
  system template with data and rules: ${system_prompt}`;

  try {
    const resumeData = await parseResumeToJson("./darshan.pdf");
    const response = await callAgent(client, message, resumeData, threadId);
    // const extractJson = await jsonExtractor(response);
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

module.exports = callAgentController;
