const puppeteer = require("puppeteer");
const generateEmbedding = require("../core/ai/helper/embeddings");
const client = require("../database/core");

const db = client.db("syllabus");
const collection = db.collection("spring2025");

const scrapeCourses = async () => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  const url = "http://newton.northeastern.edu/spring2025/";

  await page.goto(url, { waitUntil: "domcontentloaded" });

  const iframeHandle = await page.waitForSelector("iframe");
  const iframeSrc = await iframeHandle.evaluate((iframe) => iframe.src);

  const iframePage = await browser.newPage();
  await iframePage.goto(iframeSrc, { waitUntil: "networkidle0" });

  console.log("Inside iframe, scraping course data...");

  const courses = await iframePage.evaluate(() => {
    const tableSelectors = [
      "#msisboston",
      "#csyeboston",
      "#damgboston",
      "#teleboston",
    ];

    const allCourses = tableSelectors.reduce((acc, selector) => {
      const courseRows = Array.from(
        document.querySelectorAll(`${selector} table tbody tr`)
      );
      const coursesFromTable = courseRows.map((row) => {
        const columns = row.querySelectorAll("td");
        const courseName = columns[0].innerText.split("-")[0];
        const instructor = columns[2].innerText.trim().replace(",", "");
        const time = columns[3].innerText.trim();
        const syllabusLink = columns[4].querySelector("a")
          ? columns[4].querySelector("a").href
          : null;
        const embeddedText = `${courseName} is offered by ${instructor} at time ${time} and the syllabus link is available at ${syllabusLink}`;
        return {
          courseName,
          instructor,
          time,
          syllabus: syllabusLink,
          embedding_text: embeddedText,
        };
      });

      return acc.concat(coursesFromTable);
    }, []);

    return allCourses;
  });

  await browser.close();

  return courses;
};

const scrapeSpringCourses = async (req, res) => {
  const allCourses = await scrapeCourses();
  await Promise.all(
    allCourses.map(async (course) => {
      const embeddings = await generateEmbedding(course.embedding_text);
      course.embedding = embeddings;
    })
  );
  await collection.insertMany(allCourses);
  res.send("saved 2025 courses to database");
};

module.exports = scrapeSpringCourses;
