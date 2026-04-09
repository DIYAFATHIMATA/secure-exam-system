const express = require("express");
const {
  createExam,
  addQuestion,
  getExams,
  getExamById,
  startExam,
  saveAnswers,
  submitExam,
} = require("../controllers/examController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getExams);
router.get("/:id", protect, getExamById);
router.post("/", protect, authorize("admin"), createExam);
router.post("/:id/questions", protect, authorize("admin"), addQuestion);
router.post("/:id/start", protect, authorize("student"), startExam);
router.post("/:id/answers", protect, authorize("student"), saveAnswers);
router.post("/:id/submit", protect, authorize("student"), submitExam);

module.exports = router;
