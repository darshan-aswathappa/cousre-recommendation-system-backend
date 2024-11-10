const jsonExtractor = require("../core/ai/helper/json_extractor");
const system_prompt = require("../core/ai/prompt/system_prompt");
const client = require("../database/core");
const callAgent = require("./rag-resume");

const callAgentThreadController = async (req, res) => {
  const message = req.body.message;
  const threadId = Date.now().toString();

  const promptedMessage = `This is a chat thread and this is a continuation of the previous message, keeping that in mind update the 4 semester plan, do not change any other details other than what is described. 
    
    user query: from the JSON you have provided ${message} 

    Ensure that all rules are followed from the rule template provided here ${system_prompt}. Provide JSON array object only and NO text at all.`;

  try {
    const response = await callAgent(client, promptedMessage, threadId);
    res.json({
      threadId,
      res: response,
    });
  } catch (error) {
    console.error("Error in chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = callAgentThreadController;
