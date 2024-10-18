const parseResumeToJson = require("../core/core");
const scrapeCourses = require("./course-controller");

const resumeReviewController = async (req, res, next) => {
  const collegeName = req.query.collegeName;
  const courseName = req.query.courseName;

  try {
    const data = await scrapeCourses(courseName, collegeName);
    const parsedData = await parseResumeToJson("./nisu.pdf");
    res.send({ course: data, resume: parsedData });
  } catch (error) {
    res.send(error);
  }
};

module.exports = resumeReviewController;
