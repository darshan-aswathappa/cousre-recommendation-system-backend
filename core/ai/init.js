const OpenAI = require("openai");

const aiClient = new OpenAI({
  apiKey: process.env.OPEN_API_TOKEN,
});

module.exports = aiClient;
