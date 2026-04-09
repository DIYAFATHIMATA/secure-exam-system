const mongoose = require("mongoose");

const cheatingLogSchema = new mongoose.Schema(
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
    eventType: {
      type: String,
      enum: [
        "tab-switch",
        "fullscreen-exit",
        "copy-paste",
        "right-click",
        "face-away",
      ],
      required: true,
    },
    details: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CheatingLog", cheatingLogSchema);
