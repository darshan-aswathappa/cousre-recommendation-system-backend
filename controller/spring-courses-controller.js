const puppeteer = require("puppeteer");
const generateEmbedding = require("../core/ai/helper/embeddings");
const client = require("../database/core");
const scrapeProfessorPage = require("./professor/utils/scrape-professor");
const { getProfessorInd } = require("./professor-controller");

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

        return {
          courseName,
          instructor,
          time,
          syllabus: syllabusLink,
        };
      });

      return acc.concat(coursesFromTable);
    }, []);

    return allCourses;
  });

  await browser.close();

  const professorUrls = {
    "Yu Chen-Hsiang": "yu-jones",
    "Knowlton Deborah": "knowlton-debbie",
    "Jones Jr James": "jones-jr-james",
    "Montrond Manuel": "montrond-manny",
  };

  const coursesWithMetadata = await Promise.all(
    courses.map(async (course) => {
      const professorMetadata = await getProfessorInd(course.instructor);

      let res;
      const professorUrl = professorUrls[course.instructor];
      if (professorUrl) {
        res = await scrapeProfessorPage(professorUrl);
      } else {
        res = await scrapeProfessorPage(course.instructor.replace(" ", "-"));
      }
      const embeddedText = `${course.courseName} is offered by ${
        course.instructor
      } at time ${course.time} and the syllabus link is available at ${
        course.syllabus
      }. More information about the professor is available from metadata : ${JSON.stringify(
        professorMetadata
      )}. And more personal information about the professor is available at : ${JSON.stringify(
        res
      )}`;
      return {
        ...course,
        embedding_text: embeddedText,
      };
    })
  );

  return coursesWithMetadata;
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
