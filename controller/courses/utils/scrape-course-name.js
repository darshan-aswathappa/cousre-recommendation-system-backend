const axios = require("axios");
const cheerio = require("cheerio");

const getAllNeuCourses = (req, res) => {
  // Define the URL
  const url = "https://www.coursicle.com/neu/courses/";

  // Set up the Axios request with the provided headers
  axios
    .get(url, {
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,/;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
        "Cache-Control": "max-age=0",
        Connection: "keep-alive",
        Cookie:
          "_ga=GA1.1.1905980110.1730166990; __utmc=129009694; _ga_SRFRW1PCBK=GS1.1.1731627452.2.0.1731627452.60.0.0; __utma=129009694.1905980110.1730166990.1730167289.1731627452.3; __utmz=129009694.1731627452.3.3.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); __utmt=1; __utmb=129009694.1.10.1731627452",
        Referer: "https://www.google.com/",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        "sec-ch-ua":
          '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
      },
    })
    .then((response) => {
      // Load the HTML into Cheerio
      const $ = cheerio.load(response.data);

      // Extract the subject names
      const subjectNames = [];
      $("#tileContainer .tileElement .tileElementText.subjectName").each(
        (i, element) => {
          subjectNames.push($(element).text());
        }
      );

      // Print the subject names
      res.send(subjectNames);
    })
    .catch((error) => {
      console.error("Error fetching the page:", error);
    });
};

module.exports = getAllNeuCourses;
