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
  getAllUsers,
  getUser,
  deleteUser,
} = require("../controller/auth/auth-controller");
const verifyToken = require("../middleware/verifyToken");
const getCourseRecommendationById = require("../controller/courses/fetchRecommendationById");
const multer = require("multer");
const uploadParseResumeController = require("../controller/upload-resume-controller");
const deleteResumeDataController = require("../controller/delete-resume-data-controller");

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// add to resend the verification codes later on
router.get("/api/auth/check-auth", verifyToken, checkAuth);
router.post("/api/auth/signup", signup);
router.post("/api/auth/login", login);
router.post("/api/auth/logout", logout);
router.post("/api/auth/verify-email", verifyEmail);
router.post("/api/auth/forgot-password", forgotPassword);
router.post("/api/auth/reset-password/:token", resetPassword);
router.get("/api/auth/getAllUsers", getAllUsers);
router.delete("/api/auth/deleteUser/:userId", deleteUser);
router.put("/reupload-resume/:userId", deleteResumeDataController);
router.get("/api/auth/get-user/:userId", getUser);

router.get("/professors", getProfessors);
router.get("/professor", getProfessorIndDetails);
router.post("/save-courses", saveCoursesController);
router.get("/resume-view/:userId", resumeViewController);
router.post("/subject-bot", callAgentController);
router.post("/fetch-courses-recommendation", fetchResumeMatchController);
router.post("/spring2025", scrapeSpringCourses);
router.post("/course-information", courseInformationController);
router.get("/prof-scraper", scrapeProfessorController);
router.get("/get-subjects", getAllNeuCourses);
router.get(
  "/fetch-courses-recommendation/:userId/:resumeDataId",
  getCourseRecommendationById
);
router.post(
  "/upload-parse-resume/:userId",
  upload.single("resume"),
  uploadParseResumeController
);

module.exports = router;
