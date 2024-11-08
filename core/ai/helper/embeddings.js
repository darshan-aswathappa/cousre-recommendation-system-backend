const aiClient = require("../init");

const generateEmbedding = async (text) => {
  const response = await aiClient.embeddings.create({
    input: text,
    model: "text-embedding-ada-002",
  });
  return response.data[0].embedding;
};

module.exports = generateEmbedding;
