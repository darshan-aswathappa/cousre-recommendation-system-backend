const express = require("express");
const scrapeCourses = require("../controller/course-controller");
const getProfessor = require("../controller/professor-controller");
const getProfessorDetails = require("../controller/professor-details-controller");

const router = express.Router();

router.post("/course", scrapeCourses);
router.get("/professor", getProfessor);
router.get("/professor-details", getProfessorDetails);

module.exports = router;
