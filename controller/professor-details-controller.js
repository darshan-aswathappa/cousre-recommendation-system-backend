const puppeteer = require("puppeteer");

const getProfessorDetails = async (course, courseId) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
  );

  await page.setExtraHTTPHeaders({
    Accept: "text/plain, */*; q=0.01",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Accept-Language": "en-US,en-IN;q=0.9,en-UM;q=0.8,en;q=0.7",
    Connection: "keep-alive",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    Origin: "https://www.coursicle.com",
    Referer: `https://www.coursicle.com/neu/courses/${course}/${courseId}/`,
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "X-Requested-With": "XMLHttpRequest",
    "sec-ch-ua":
      '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
  });

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
