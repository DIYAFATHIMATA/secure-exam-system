const express = require("express");
const {
	registerUser,
	loginUser,
	getMe,
	getStudents,
} = require("../controllers/authController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.get("/students", protect, authorize("admin"), getStudents);

module.exports = router;
