const system_prompt = require("../core/ai/prompt/system_prompt");
const { parseResumeToJson, generateResumeEmbeddings } = require("../core/core");
const getSemesterPlan = require("../controller/rag-resume");

const callAgentController = async (req, res) => {
  const initialMessage = req.body.message;
  try {
    const llmResponse = await getSemesterPlan(initialMessage);
    res.send(llmResponse);
  } catch (error) {
    console.error("Error starting conversation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = callAgentController;
