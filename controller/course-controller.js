const puppeteer = require("puppeteer");
const getCoreJsonPrompt = require("../core/core");

const extractTextInParentheses = (text) => {
  const match = text.match(/\(([^)]+)\)/);
  return match ? match[1] : null;
};

const getCourseNames = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const urlCoe = `https://catalog.northeastern.edu/course-descriptions`;
  await page.goto(urlCoe);
  const courseTexts = await page.evaluate(() => {
    const ulElement = document.querySelector(
      ".nav.levelone#\\/course-descriptions\\/"
    );
    if (ulElement) {
      const anchorTags = ulElement.querySelectorAll("a");
      return Array.from(anchorTags).map((a) => a.textContent.trim());
    } else {
      return [];
    }
  });

  const extractedCourses = courseTexts
    .map((course) => extractTextInParentheses(course))
    .filter(Boolean);

  await browser.close();

  return extractedCourses;
};

const initializeScrapper = async (collegeName, courseName) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const urlCoe = `https://catalog.northeastern.edu/course-descriptions/${courseName}/`;
  const urlKhoury = `https://catalog.northeastern.edu/graduate/computer-information-science/computer-science/#coursestext`;

  switch (collegeName) {
    case "coe":
      await page.goto(urlCoe);
      break;
    case "khoury":
      await page.goto(urlKhoury);
      break;
  }

  const courses = await page.evaluate(() => {
    const courseElements = document.querySelectorAll(".courseblock");

    return Array.from(courseElements).map((course) => {
      const courseTitle = course.querySelector("p strong").textContent.trim();
      const courseDescription = course
        .querySelector(".cb_desc")
        .textContent.trim();
      const parts = courseTitle.split(".");
      const courseCode = parts[0].trim();
      const subject = parts.slice(1, -1).join(".").trim();
      const credits = parts[parts.length - 1].trim();

      const prerequisiteElement = Array.from(
        course.querySelectorAll("p.courseblockextra strong")
      ).find((strong) => strong.textContent.includes("Prerequisite"));
      const prerequisites = prerequisiteElement
        ? prerequisiteElement.parentElement.textContent
            .replace("Prerequisite(s): ", "")
            .trim()
        : null;

      const corequisiteElement = Array.from(
        course.querySelectorAll("p.courseblockextra strong")
      ).find((strong) => strong.textContent.includes("Corequisite"));
      const corequisites = corequisiteElement
        ? corequisiteElement.parentElement.textContent
            .replace("Corequisite(s): ", "")
            .trim()
        : null;

      const cleanedCredits = credits
        .replace("Hours", "")
        .replace("(", "")
        .replace(")", "")
        .trim();

      const coursePart = courseCode.trim().split(/\s+/);
      const electiveName = coursePart[0];
      const electiveNumber = coursePart[1];

      return {
        name: electiveName,
        number: electiveNumber,
        subject,
        credits: cleanedCredits,
        description: courseDescription,
        prerequisites: prerequisites || "None",
        corequisites: corequisites || "None",
      };
    });
  });

  await browser.close();

  return courses;
};

const scrapeCourses = async (req, res, next) => {
  const courseName = req.query.courseName;
  const collegeName = req.query.collegeName;
  const extractedCourses = await getCourseNames();
  let electiveName;
  let electiveNumber;

  if (
    courseName == "coe" &&
    !extractedCourses.includes(courseName.toUpperCase())
  ) {
    return res.status(400).send({ error: "Invalid course name." });
  }

  const body = await initializeScrapper(collegeName, courseName);

  res.send({ body });
};

module.exports = scrapeCourses;
