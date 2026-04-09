const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      validate: {
        validator: (val) => Array.isArray(val) && val.length >= 2,
        message: "At least 2 options are required.",
      },
      required: true,
    },
    correctOption: {
      type: Number,
      required: true,
      min: 0,
    },
    points: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: true }
);

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questions: {
      type: [questionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exam", examSchema);
