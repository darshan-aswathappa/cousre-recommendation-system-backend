const express = require("express");
const {
  getProfessors,
  getProfessorIndDetails,
} = require("../controller/professor-controller");
const resumeReviewController = require("../controller/review-controller");
const callAgentController = require("../controller/call-agent-controller");
const callAgentThreadController = require("../controller/agent-chat-thread-controller");
const scrapeSpringCourses = require("../controller/spring-courses-controller");
const courseInformationController = require("../controller/course-information-controller");
const scrapeProfessorController = require("../controller/professor/controller/scrape-professor-controller");

const router = express.Router();

router.get("/professors", getProfessors);
router.get("/professor", getProfessorIndDetails);
router.post("/resume", resumeReviewController);
router.post("/rag-review", callAgentController);
router.post("/rag-review/:threadId", callAgentThreadController);
router.post("/spring2025", scrapeSpringCourses);
router.post("/course-information", courseInformationController);
router.get("/prof-scraper", scrapeProfessorController);

module.exports = router;
