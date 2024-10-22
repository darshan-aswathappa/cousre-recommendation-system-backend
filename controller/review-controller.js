const { parseResumeToJson, resumeReviewClient } = require("../core/core");
const ppxResume = require("../core/perplexity_core");
const scrapeCourses = require("./course-controller");

const resumeReviewController = async (req, res, next) => {
  const collegeName = req.query.collegeName;
  const courseName = req.query.courseName;

  try {
    const data = await scrapeCourses(courseName, collegeName);
    const parsedData = await parseResumeToJson("./darshan.pdf");
    // const combined = { course: data, resume: parsedData };
    // console.log(combined);
    // const review = await ppxResume(data, parsedData);
    const gpt = await resumeReviewClient(data, parsedData);
    res.send({
      courses: data,
      resume: parsedData,
      review: JSON.parse(gpt),
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

module.exports = resumeReviewController;
