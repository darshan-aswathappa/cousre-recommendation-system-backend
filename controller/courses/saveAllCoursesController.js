const axios = require("axios");
const cheerio = require("cheerio");
const storeCourseInCollection = require("../../database/helpers/course");

const subjectCodes = ["CSYE", "TELE", "DAMG", "INFO", "DS"];

const saveCoursesController = async (req, res) => {
  try {
    const response = await scrapeCourses();
    res.status(200).send(response);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

const fetchCourses = async (subjectCode) => {
  try {
    const url = `https://catalog.northeastern.edu/course-descriptions/${subjectCode.toLowerCase()}/`;
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);

    return $(".courseblock")
      .map((_, course) => {
        const courseTitle = $(course).find("p strong").first().text().trim();
        const courseDescription = $(course).find(".cb_desc").text().trim();
        const parts = courseTitle.split(".");
        const courseCode = parts[0].trim();
        const subject = parts.slice(1, -1).join(".").trim();
        const credits = parts[parts.length - 1]
          .trim()
          .replace("Hours", "")
          .replace("(", "")
          .replace(")", "")
          .trim();
        const prerequisiteText = $(course)
          .find("p.courseblockextra strong:contains('Prerequisite')")
          .parent()
          .text()
          .replace("Prerequisite(s): ", "")
          .trim();
        const prerequisites = prerequisiteText || "None";
        const corequisiteText = $(course)
          .find("p.courseblockextra strong:contains('Corequisite')")
          .parent()
          .text()
          .replace("Corequisite(s): ", "")
          .trim();
        const corequisites = corequisiteText || "None";

        const coursePart = courseCode.trim().split(/\s+/);
        const electiveName = coursePart[0];
        const electiveNumber = coursePart[1];

        return {
          name: electiveName,
          number: electiveNumber,
          subjectName: subject,
          credits,
          description: courseDescription,
          prerequisites,
          corequisites,
        };
      })
      .get();
  } catch (error) {
    console.error(`Skipping ${subjectCode} due to error:`, error.message);
    return [];
  }
};

const scrapeCourses = async () => {
  const allCourses = [];

  for (const subjectCode of subjectCodes) {
    console.log("Running for subject code: " + subjectCode);
    const courses = await fetchCourses(subjectCode);
    allCourses.push(...courses);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  const filteredCourses = allCourses.filter((course) => {
    const excludeKeywords = [
      "directed study",
      "elective",
      "project",
      "thesis",
      "special topics",
      "technical writing",
    ];
    const containsKeywords = excludeKeywords.some((keyword) =>
      course.subjectName.toLowerCase().includes(keyword.toLowerCase())
    );
    return !containsKeywords && course.credits > 0;
  });

  if (filteredCourses.length) {
    const savedCourses = await storeCourseInCollection(filteredCourses);
    return savedCourses.map(
      ({ _id, embedding, embedding_text, ...rest }) => rest
    );
  }

  return [];
};

module.exports = saveCoursesController;
