const express = require("express");
const getProfessor = require("../controller/professor-controller");
const resumeReviewController = require("../controller/review-controller");
const callAgentController = require("../controller/call-agent-controller");
const callAgentThreadController = require("../controller/agent-chat-thread-controller");

const router = express.Router();

router.get("/professor", getProfessor);
router.post("/resume", resumeReviewController);
router.post("/rag-review", callAgentController);
router.post("/rag-review/:threadId", callAgentThreadController);

module.exports = router;
