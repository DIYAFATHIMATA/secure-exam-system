const Exam = require("../models/Exam");
const User = require("../models/User");

const ensureSampleExam = async () => {
  const existing = await Exam.findOne({
    isPublished: true,
    "questions.0": { $exists: true },
  }).select("_id title");

  if (existing) {
    return { created: false, title: existing.title };
  }

  const admin = await User.findOne({ role: "admin" }).select("_id");
  if (!admin) {
    return { created: false, reason: "admin-missing" };
  }

  const now = new Date();
  const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const endTime = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  const exam = await Exam.create({
    title: "General Aptitude Mock Test",
    description: "Auto-generated sample exam for first-time setup.",
    durationMinutes: 20,
    startTime,
    endTime,
    isPublished: true,
    createdBy: admin._id,
    questions: [
      {
        questionText: "Which data structure follows FIFO order?",
        options: ["Stack", "Queue", "Tree", "Graph"],
        correctOption: 1,
        points: 1,
      },
      {
        questionText: "What does HTTP stand for?",
        options: [
          "HyperText Transfer Protocol",
          "HighText Transfer Program",
          "Hyperlink Text Transfer Program",
          "Hyper Transfer Text Process",
        ],
        correctOption: 0,
        points: 1,
      },
    ],
  });

  return { created: true, title: exam.title };
};

module.exports = { ensureSampleExam };
