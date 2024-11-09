const callAgent = require("../controller/rag-resume");
const client = require("../database/core");
const callAgentThreadController = require("../controller/agent-chat-thread-controller");
const system_prompt = require("../core/ai/prompt/system_prompt");

const callAgentController = async (req, res) => {
  const initialMessage = req.body.message;
  const threadId = Date.now().toString();

  const message = `Using the provided resume and course data, create a recommended 4-semester plan that fulfills 32 credits and aligns with the skills and experience listed in my resume. Recommend subjects from ${initialMessage} ONLY. Ensure that all rules are followed from the rule templated provided here ${system_prompt}. Provide JSON array object only and NO text at all.`;

  try {
    const response = await callAgent(client, message, threadId);

    res.json({
      threadId,
      res: JSON.parse(response),
    });
  } catch (error) {
    console.error("Error starting conversation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = callAgentController;
