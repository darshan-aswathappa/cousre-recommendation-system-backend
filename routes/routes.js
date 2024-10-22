const express = require("express");
const getProfessor = require("../controller/professor-controller");
const getProfessorDetails = require("../controller/professor-details-controller");
const resumeReviewController = require("../controller/review-controller");

const router = express.Router();

router.get("/professor", getProfessor);
router.post("/resume-review", resumeReviewController);

module.exports = router;
