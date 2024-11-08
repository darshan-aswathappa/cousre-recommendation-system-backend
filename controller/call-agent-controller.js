const callAgent = require("../controller/rag-resume");
const client = require("../database/core");

const callAgentController = async (req, res) => {
  const initialMessage = req.body.message;
  const threadId = Date.now().toString();
  try {
    const response = await callAgent(client, initialMessage, threadId);
    const serialized_response = JSON.parse(
      response.replace("```json", "").replace("```", "")
    );
    res.json({
      threadId,
      serialized_response,
    });
  } catch (error) {
    console.error("Error starting conversation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = callAgentController;
