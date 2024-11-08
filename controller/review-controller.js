const { parseResumeToJson, resumeReviewClient } = require("../core/core");
const scrapeCourses = require("./course-controller");

const resumeReviewController = async (req, res) => {
  const collegeName = req.query.collegeName;
  const courseName = req.query.courseName;

  try {
    const courses = await scrapeCourses(courseName, collegeName);
    const parsedData = await parseResumeToJson("./nisu.pdf");

    res.send({
      courses,
      resume: parsedData,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

module.exports = resumeReviewController;
