const aiClient = require("../init");

const jsonExtractor = async (data) => {
  console.log("called JSON extractor tool");
  if (!JSON.parse(data)) {
    const completion = await aiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a personal assistant whose job is to remove all unwanted text apart from JSON from the provided data and reply with a JSON that is compatible with javascript JSON parse functionality.",
        },
        {
          role: "user",
          content: `${data} extract only the JSON from the provided data.`,
        },
      ],
    });
    return completion.choices[0].message.content;
  }

  return data;
};

module.exports = jsonExtractor;
