const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    maxScore: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        selectedOption: {
          type: Number,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
      },
    ],
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: Date,
    antiCheatSummary: {
      tabSwitches: { type: Number, default: 0 },
      fullscreenExits: { type: Number, default: 0 },
      copyPasteAttempts: { type: Number, default: 0 },
      rightClicks: { type: Number, default: 0 },
      faceAwayDetections: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

resultSchema.index({ student: 1, exam: 1 }, { unique: true });

module.exports = mongoose.model("Result", resultSchema);
