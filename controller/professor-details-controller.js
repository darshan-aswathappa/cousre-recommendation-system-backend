const puppeteer = require("puppeteer");

const getProfessorDetails = async (req, res, next) => {
  const course = req.query.course;
  const courseId = req.query.courseId;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  console.log("Here");
  const url = `https://www.coursicle.com/neu/courses/${course}/${courseId}/`;
  await page.goto(url);

  const professorNames = await page.evaluate(() => {
    const professorLinks = document.querySelectorAll(
      ".subItemContent a.professorLink"
    );

    return Array.from(professorLinks).map((link) => link.textContent.trim());
  });

  await browser.close();

  res.send({ professorNames });
};

module.exports = getProfessorDetails;
