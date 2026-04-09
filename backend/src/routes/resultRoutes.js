const express = require("express");
const { getMyResults, getExamResults } = require("../controllers/resultController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", protect, authorize("student"), getMyResults);
router.get("/exam/:examId", protect, authorize("admin"), getExamResults);

module.exports = router;
