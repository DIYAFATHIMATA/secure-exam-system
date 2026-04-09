const express = require("express");
const { trackEvent } = require("../controllers/antiCheatController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/track", protect, authorize("student"), trackEvent);

module.exports = router;
