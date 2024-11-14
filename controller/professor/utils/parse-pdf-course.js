const axios = require("axios");
const pdfParse = require("pdf-parse");

const parseTextFromPdf = async (pdfLink) => {
  try {
    const response = await axios.get(pdfLink, { responseType: "arraybuffer" });
    const pdfData = await pdfParse(response.data);
    return pdfData.text.trim();
  } catch (error) {
    return "No data about the syllabus";
  }
};

module.exports = parseTextFromPdf;
