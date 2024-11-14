const puppeteer = require("puppeteer");
const generateEmbedding = require("../core/ai/helper/embeddings");
const client = require("../database/core");
const scrapeProfessorPage = require("./professor/utils/scrape-professor");
const { getProfessorInd } = require("./professor-controller");
const parseTextFromPdf = require("./professor/utils/parse-pdf-course");

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
        const courseNumber = columns[0].innerText.split("-")[0];
        const courseName = columns[0].innerText.split("-")[1];
        const instructor = columns[2].innerText.trim().replace(",", "");
        const time = columns[3].innerText.trim();
        const syllabusLink = columns[4].querySelector("a")
          ? columns[4].querySelector("a").href
          : null;

        return {
          courseNumber,
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
      const syllabusData = await parseTextFromPdf(course.syllabus);

      const embeddedText = `${course.courseNumber} - ${
        course.courseName
      } is offered by ${course.instructor} at time ${
        course.time
      } and the syllabus link is available at ${
        course.syllabus
      }. More information about the professor is available from metadata : ${JSON.stringify(
        professorMetadata
      )}. And more personal information about the professor is available at : ${JSON.stringify(
        res
      )}. Professor syllabus content and grading information can be found at : ${JSON.stringify(
        syllabusData
      )}`;
      return {
        ...course,
        syllabusData,
        embedding_text: embeddedText,
      };
    })
  );

  return coursesWithMetadata;
};

const tokenizeText = (text, maxTokens) => {
  const words = text.split(" ");
  const chunks = [];
  for (let i = 0; i < words.length; i += maxTokens) {
    chunks.push(words.slice(i, i + maxTokens).join(" "));
  }
  return chunks;
};

const getChunkedEmbeddings = async (text, maxTokens = 500) => {
  const textChunks = tokenizeText(text, maxTokens);

  const chunkEmbeddings = await Promise.all(
    textChunks.map((chunk) => generateEmbedding(chunk))
  );

  const aggregatedEmbedding = chunkEmbeddings[0].map(
    (_, i) =>
      chunkEmbeddings.reduce((sum, embedding) => sum + embedding[i], 0) /
      chunkEmbeddings.length
  );

  return aggregatedEmbedding;
};

const scrapeSpringCourses = async (req, res) => {
  const allCourses = await scrapeCourses();

  await Promise.all(
    allCourses.map(async (course) => {
      const courseEmbedding = await getChunkedEmbeddings(course.embedding_text);
      course.embedding = courseEmbedding;
    })
  );

  await collection.insertMany(allCourses);
  res.send("saved 2025 courses to database");
};

module.exports = scrapeSpringCourses;
