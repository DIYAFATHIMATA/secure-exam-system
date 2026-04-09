const Result = require("../models/Result");
const { submitExam } = require("./examController");

const getAllResults = async (req, res) => {
  const results = await Result.find({})
    .populate("studentId", "name email")
    .populate("examId", "title")
    .sort({ createdAt: -1 });

  return res.json(results);
};

const getMyResults = async (req, res) => {
  const results = await Result.find({
    $or: [
      { studentId: req.user._id },
      { student: req.user._id },
    ],
  })
    .populate("exam", "title durationMinutes")
    .populate("examId", "title durationMinutes")
    .sort({ createdAt: -1 });

  return res.json(results);
};

const getExamResults = async (req, res) => {
  const results = await Result.find({ exam: req.params.examId })
    .populate("student", "name email")
    .sort({ score: -1 });

  return res.json(results);
};

const getStudentResultsById = async (req, res) => {
  if (req.user.role === "student" && String(req.user._id) !== String(req.params.id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const results = await Result.find({
    $or: [
      { studentId: req.params.id },
      { student: req.params.id },
    ],
  })
    .populate("examId", "title")
    .populate("exam", "title")
    .sort({ createdAt: -1 });

  return res.json(results);
};

module.exports = {
  getAllResults,
  getMyResults,
  getExamResults,
  getStudentResultsById,
  submitResult: submitExam,
};
