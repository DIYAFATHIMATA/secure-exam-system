const CheatingLog = require("../models/CheatingLog");
const Result = require("../models/Result");

const counterMap = {
  "tab-switch": "antiCheatSummary.tabSwitches",
  "fullscreen-exit": "antiCheatSummary.fullscreenExits",
  "copy-paste": "antiCheatSummary.copyPasteAttempts",
  "right-click": "antiCheatSummary.rightClicks",
  "face-away": "antiCheatSummary.faceAwayDetections",
};

const trackEvent = async (req, res) => {
  const { examId, eventType, details } = req.body;

  if (!examId || !eventType) {
    return res.status(400).json({ message: "examId and eventType are required" });
  }

  await CheatingLog.create({
    student: req.user._id,
    exam: examId,
    eventType,
    details,
  });

  const updateKey = counterMap[eventType];
  if (updateKey) {
    await Result.findOneAndUpdate(
      { student: req.user._id, exam: examId },
      { $inc: { [updateKey]: 1 } },
      { upsert: false }
    );
  }

  return res.status(201).json({ message: "Anti-cheat event tracked" });
};

module.exports = { trackEvent };
