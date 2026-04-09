const Result = require("../models/Result");

const getMyResults = async (req, res) => {
  const results = await Result.find({ student: req.user._id })
    .populate("exam", "title durationMinutes")
    .sort({ createdAt: -1 });

  return res.json(results);
};

const getExamResults = async (req, res) => {
  const results = await Result.find({ exam: req.params.examId })
    .populate("student", "name email")
    .sort({ score: -1 });

  return res.json(results);
};

module.exports = { getMyResults, getExamResults };
