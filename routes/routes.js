const express = require("express");
const {
  getProfessors,
  getProfessorIndDetails,
} = require("../controller/professor-controller");
const resumeViewController = require("../controller/review-controller");
const callAgentController = require("../controller/call-agent-controller");
const scrapeSpringCourses = require("../controller/spring-courses-controller");
const courseInformationController = require("../controller/course-information-controller");
const scrapeProfessorController = require("../controller/professor/controller/scrape-professor-controller");
const getAllNeuCourses = require("../controller/courses/utils/scrape-course-name");
const saveCoursesController = require("../controller/courses/saveAllCoursesController");
const fetchResumeMatchController = require("../controller/courses/fetchResumeMatch");
const {
  signup,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
} = require("../controller/auth/auth-controller");
const verifyToken = require("../middleware/verifyToken");
const getCourseRecommendationById = require("../controller/courses/fetchRecommendationById");

const router = express.Router();

// add to resend the verification codes later on
router.get("/api/auth/check-auth", verifyToken, checkAuth);
router.post("/api/auth/signup", signup);
router.post("/api/auth/login", login);
router.post("/api/auth/logout", logout);
router.post("/api/auth/verify-email", verifyEmail);
router.post("/api/auth/forgot-password", forgotPassword);
router.post("/api/auth/reset-password/:token", resetPassword);

router.get("/professors", getProfessors);
router.get("/professor", getProfessorIndDetails);
router.post("/save-courses", saveCoursesController);
router.get("/resume-view", resumeViewController);
router.post("/subject-bot", callAgentController);
router.post("/fetch-courses-recommendation", fetchResumeMatchController);
router.post("/spring2025", scrapeSpringCourses);
router.post("/course-information", courseInformationController);
router.get("/prof-scraper", scrapeProfessorController);
router.get("/get-subjects", getAllNeuCourses);
router.get("/fetch-courses-recommendation/:id", getCourseRecommendationById);
module.exports = router;
