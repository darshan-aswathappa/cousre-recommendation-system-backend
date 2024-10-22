const puppeteer = require("puppeteer");
const {
  collectionExists,
  getCourseFromCollection,
  storeCourseInCollection,
} = require("../database/helpers/course");

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

const initializeScrapper = (collegeName, courseName) => {
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      const urlCoe = `https://catalog.northeastern.edu/course-descriptions/${courseName}/`;
      const urlKhoury = `https://catalog.northeastern.edu/graduate/computer-information-science/computer-science/#coursestext`;

      // Navigate to the appropriate URL based on the college name
      switch (collegeName) {
        case "coe":
          await page.goto(urlCoe);
          break;
        case "khoury":
          await page.goto(urlKhoury);
          break;
        default:
          await browser.close();
          return reject("Invalid college name.");
      }

      const courses = await page.evaluate(() => {
        const courseElements = document.querySelectorAll(".courseblock");

        return Array.from(courseElements).map((course) => {
          const courseTitle = course
            .querySelector("p strong")
            .textContent.trim();
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
            : "None";

          const corequisiteElement = Array.from(
            course.querySelectorAll("p.courseblockextra strong")
          ).find((strong) => strong.textContent.includes("Corequisite"));
          const corequisites = corequisiteElement
            ? corequisiteElement.parentElement.textContent
                .replace("Corequisite(s): ", "")
                .trim()
            : "None";

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
            prerequisites,
            corequisites,
          };
        });
      });

      await browser.close();
      resolve(courses);
    } catch (error) {
      reject(`Failed to scrape course data: ${error}`);
    }
  });
};

// const scrapeCourses = async (subjects, college) => {
//   const extractedCourses = await getCourseNames();
//   var finalRes = [];
//   const courses = subjects.split(",");

//   // ----------------- handle error later ---------------------------
//   courses.map((e) => {
//     if (college == "coe" && !extractedCourses.includes(e.toUpperCase())) {
//       throw "Invalid course";
//     }
//   });

//   const results = await Promise.all(
//     courses.map((course) => initializeScrapper(college, course))
//   );

//   results.forEach((result, index) => {
//     finalRes.push(result);
//   });

//   return finalRes;
// };

const scrapeCourses = async (subjects, college) => {
  const extractedCourses = await getCourseNames();
  const courses = subjects.split(",");
  const finalRes = [];

  courses.map((e) => {
    if (college === "coe" && !extractedCourses.includes(e.toUpperCase())) {
      throw "Invalid course";
    }
  });

  for (const course of courses) {
    const collectionExistsForCourse = await collectionExists(course);

    if (collectionExistsForCourse) {
      const courseData = await getCourseFromCollection(course);
      finalRes.push(...courseData);
    } else {
      try {
        const scrapedCourses = await initializeScrapper(college, course);
        await storeCourseInCollection(course, scrapedCourses);
        finalRes.push(...scrapedCourses);
      } catch (error) {
        console.error(`Error scraping course ${course}:`, error);
      }
    }
  }

  return finalRes;
};

module.exports = scrapeCourses;
