const Exam = require("../models/Exam");
const Result = require("../models/Result");
const { ensureSampleExams } = require("../utils/seedExam");

const isExamWindowEnforced = () => process.env.ENFORCE_EXAM_WINDOW === "true";

const sanitizeExamForStudent = (examDoc) => {
  const exam = examDoc.toObject();
  exam.questions = exam.questions.map((q) => ({
    _id: q._id,
    questionText: q.questionText,
    options: q.options,
    points: q.points,
  }));
  return exam;
};

const normalizeAnswersAgainstExam = (answers, examQuestions) => {
  let score = 0;

  const normalizedAnswers = answers
    .map((answer) => {
      const question = examQuestions.id(answer.questionId);
      if (!question) {
        return null;
      }

      const isCorrect = Number(answer.selectedOption) === Number(question.correctOption);
      if (isCorrect) {
        score += question.points || 1;
      }

      return {
        questionId: question._id,
        selectedOption: Number(answer.selectedOption),
        isCorrect,
      };
    })
    .filter(Boolean);

  return { normalizedAnswers, score };
};

const createExam = async (req, res) => {
  const { title, description, durationMinutes, startTime, endTime, isPublished } = req.body;

  if (!title || !durationMinutes || !startTime || !endTime) {
    return res.status(400).json({ message: "Missing required exam fields" });
  }

  const exam = await Exam.create({
    title,
    description,
    durationMinutes,
    startTime,
    endTime,
    isPublished: Boolean(isPublished),
    createdBy: req.user._id,
  });

  return res.status(201).json(exam);
};

const addQuestion = async (req, res) => {
  const { questionText, options, correctOption, points } = req.body;
  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    return res.status(404).json({ message: "Exam not found" });
  }

  if (!questionText || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ message: "Invalid question payload" });
  }

  exam.questions.push({
    questionText,
    options,
    correctOption,
    points,
  });

  await exam.save();
  return res.status(201).json(exam);
};

const getExams = async (req, res) => {
  const now = new Date();
  let query = {};

  if (req.user.role === "student") {
    query = { isPublished: true };
    if (isExamWindowEnforced()) {
      query.startTime = { $lte: now };
      query.endTime = { $gte: now };
    }
  }

  let exams = await Exam.find(query).sort({ startTime: 1 });

  if (req.user.role === "student" && exams.length === 0) {
    await ensureSampleExams();
    exams = await Exam.find(query).sort({ startTime: 1 });
  }

  return res.json(exams);
};

const getExamById = async (req, res) => {
  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    return res.status(404).json({ message: "Exam not found" });
  }

  if (req.user.role === "student") {
    return res.json(sanitizeExamForStudent(exam));
  }

  return res.json(exam);
};

const startExam = async (req, res) => {
  let exam = await Exam.findById(req.params.id);

  if (!exam || !exam.isPublished) {
    await ensureSampleExams();

    const fallbackExam = await Exam.findOne({
      isPublished: true,
      "questions.0": { $exists: true },
    })
      .select("_id")
      .sort({ startTime: 1 });

    if (fallbackExam) {
      return res.status(404).json({
        message: "Exam unavailable",
        fallbackExamId: fallbackExam._id,
      });
    }

    return res.status(404).json({ message: "Exam unavailable" });
  }

  const now = new Date();
  if (isExamWindowEnforced() && (now < exam.startTime || now > exam.endTime)) {
    return res.status(400).json({ message: "Exam is not active" });
  }

  const existingResult = await Result.findOne({ student: req.user._id, exam: exam._id });
  if (existingResult && existingResult.submittedAt) {
    return res.status(400).json({ message: "Exam already submitted" });
  }

  if (!existingResult) {
    await Result.create({
      student: req.user._id,
      exam: exam._id,
      startedAt: now,
    });
  }

  return res.json({ message: "Exam session started" });
};

const saveAnswers = async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam || !exam.isPublished) {
    return res.status(404).json({ message: "Exam unavailable" });
  }

  const now = new Date();
  if (isExamWindowEnforced() && (now < exam.startTime || now > exam.endTime)) {
    return res.status(400).json({ message: "Exam is not active" });
  }

  const { answers } = req.body;
  if (!Array.isArray(answers)) {
    return res.status(400).json({ message: "Answers must be an array" });
  }

  const existingResult = await Result.findOne({ student: req.user._id, exam: exam._id });
  if (existingResult?.submittedAt) {
    return res.status(400).json({ message: "Exam already submitted" });
  }

  const { normalizedAnswers } = normalizeAnswersAgainstExam(answers, exam.questions);

  const result = await Result.findOneAndUpdate(
    { student: req.user._id, exam: exam._id },
    {
      student: req.user._id,
      exam: exam._id,
      answers: normalizedAnswers,
      startedAt: existingResult?.startedAt || now,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return res.json({
    message: "Answers saved",
    savedAnswerCount: result.answers.length,
    updatedAt: result.updatedAt,
  });
};

const submitExam = async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) {
    return res.status(404).json({ message: "Exam not found" });
  }

  const now = new Date();
  if (isExamWindowEnforced() && now > exam.endTime) {
    return res.status(400).json({ message: "Exam time window has ended" });
  }

  const { answers } = req.body;
  if (!Array.isArray(answers)) {
    return res.status(400).json({ message: "Answers must be an array" });
  }

  const existingResult = await Result.findOne({ student: req.user._id, exam: exam._id });
  if (existingResult?.submittedAt) {
    return res.status(400).json({ message: "Exam already submitted" });
  }

  const maxScore = exam.questions.reduce((acc, q) => acc + (q.points || 1), 0);
  const { normalizedAnswers, score } = normalizeAnswersAgainstExam(answers, exam.questions);

  const percentage = maxScore ? Number(((score / maxScore) * 100).toFixed(2)) : 0;

  const result = await Result.findOneAndUpdate(
    { student: req.user._id, exam: exam._id },
    {
      student: req.user._id,
      exam: exam._id,
      score,
      maxScore,
      percentage,
      answers: normalizedAnswers,
      submittedAt: new Date(),
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return res.json(result);
};

module.exports = {
  createExam,
  addQuestion,
  getExams,
  getExamById,
  startExam,
  saveAnswers,
  submitExam,
};
