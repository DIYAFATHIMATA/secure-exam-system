const Exam = require("../models/Exam");
const User = require("../models/User");

const SAMPLE_EXAMS = [
  {
    title: "General Aptitude Mock Test",
    description: "Auto-generated sample exam for first-time setup.",
    durationMinutes: 20,
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
      {
        questionText: "Which one is a prime number?",
        options: ["21", "29", "51", "57"],
        correctOption: 1,
        points: 1,
      },
    ],
  },
  {
    title: "Computer Science Fundamentals",
    description: "Basics of operating systems, networks, and DBMS.",
    durationMinutes: 25,
    questions: [
      {
        questionText: "Which layer handles routing in the OSI model?",
        options: ["Transport", "Session", "Network", "Data Link"],
        correctOption: 2,
        points: 1,
      },
      {
        questionText: "What is the primary key used for?",
        options: [
          "To store large files",
          "To uniquely identify a row",
          "To encrypt data",
          "To back up tables",
        ],
        correctOption: 1,
        points: 1,
      },
      {
        questionText: "Which scheduling algorithm can cause starvation?",
        options: ["Round Robin", "FCFS", "Priority Scheduling", "FIFO"],
        correctOption: 2,
        points: 1,
      },
    ],
  },
  {
    title: "Quantitative Reasoning Test",
    description: "Arithmetic, percentages, and ratio-based questions.",
    durationMinutes: 20,
    questions: [
      {
        questionText: "If 20% of x is 50, what is x?",
        options: ["200", "220", "250", "300"],
        correctOption: 2,
        points: 1,
      },
      {
        questionText: "A train moves at 60 km/h. Distance in 2.5 hours?",
        options: ["120 km", "130 km", "150 km", "180 km"],
        correctOption: 2,
        points: 1,
      },
      {
        questionText: "Simplify the ratio 48:64",
        options: ["2:3", "3:4", "4:5", "5:6"],
        correctOption: 1,
        points: 1,
      },
    ],
  },
];

const ensureSampleExams = async () => {
  const existingTitles = await Exam.find({
    title: { $in: SAMPLE_EXAMS.map((exam) => exam.title) },
  }).distinct("title");

  const admin = await User.findOne({ role: "admin" }).select("_id");
  if (!admin) {
    return { created: false, reason: "admin-missing" };
  }

  const now = new Date();
  const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const endTime = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  const toCreate = SAMPLE_EXAMS.filter((exam) => !existingTitles.includes(exam.title)).map(
    (exam) => ({
      ...exam,
      startTime,
      endTime,
      isPublished: true,
      createdBy: admin._id,
    })
  );

  if (toCreate.length === 0) {
    return { created: false, createdCount: 0 };
  }

  await Exam.insertMany(toCreate);
  return {
    created: true,
    createdCount: toCreate.length,
    titles: toCreate.map((exam) => exam.title),
  };
};

module.exports = { ensureSampleExams };
