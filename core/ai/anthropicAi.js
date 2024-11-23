const { default: Anthropic } = require("@anthropic-ai/sdk/index");

const claudeAiClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

module.exports = claudeAiClient;
