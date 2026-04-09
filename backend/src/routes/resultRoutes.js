const express = require("express");
const {
	getAllResults,
	getMyResults,
	getExamResults,
	getStudentResultsById,
	submitResult,
} = require("../controllers/resultController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, authorize("student"), submitResult);
router.get("/", protect, authorize("admin"), getAllResults);
router.get("/me", protect, authorize("student"), getMyResults);
router.get("/student/:id", protect, getStudentResultsById);
router.get("/exam/:examId", protect, authorize("admin"), getExamResults);

module.exports = router;
