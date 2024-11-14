const axios = require("axios");
const cheerio = require("cheerio");

async function scrapeProfessorPage(professorName) {
  const url = `https://coe.northeastern.edu/people/${professorName}`;

  try {
    const response = await axios.get(url, {
      httpsAgent: new require("https").Agent({ rejectUnauthorized: false }),
    });
    if (response.status === 404) {
      return "";
    }
    const $ = cheerio.load(response.data);
    const mainContent = $("main").text();
    return mainContent;
  } catch (error) {
    console.error("Error fetching data for: ", professorName);
  }
}

module.exports = scrapeProfessorPage;
