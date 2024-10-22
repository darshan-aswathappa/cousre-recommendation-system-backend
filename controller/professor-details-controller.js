const puppeteer = require("puppeteer");

const getProfessorDetails = async (course, courseId) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );
  const url = `https://www.coursicle.com/neu/courses/${course}/${courseId}/`;
  await page.goto(url, { waitUntil: "networkidle2" });

  const professorNames = await page.evaluate(() => {
    const professorLinks = document.querySelectorAll(
      ".subItemContent a.professorLink"
    );

    return Array.from(professorLinks).map((link) => link.textContent.trim());
  });

  await browser.close();
  return professorNames;
};

module.exports = getProfessorDetails;
