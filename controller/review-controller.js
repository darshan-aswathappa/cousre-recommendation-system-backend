const { parseResumeToJson, resumeReviewClient } = require("../core/core");
const scrapeCourses = require("./course-controller");

const resumeViewController = async (req, res) => {
  try {
    const parsedData = await parseResumeToJson("./nisu.pdf");
    res.send({
      resume: parsedData,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

module.exports = resumeViewController;
