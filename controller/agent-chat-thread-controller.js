const client = require("../database/core");
const callAgent = require("./rag-resume");

const callAgentThreadController = async (req, res) => {
  const { threadId } = req.params;
  const { message } = req.body;
  try {
    const response = await callAgent(client, message, threadId);
    res.json({ response });
  } catch (error) {
    console.error("Error in chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = callAgentThreadController;
