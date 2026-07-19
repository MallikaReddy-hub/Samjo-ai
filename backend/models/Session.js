import mongoose from "mongoose";

const practiceQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], default: [] },
  correctAnswer: { type: String, required: true },
});

const sessionSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true },
    gradeLevel: { type: String, required: true },
    subject: { type: String, required: true },
    doubtText: { type: String, required: true },
    explanationLanguage: { type: String, default: "English" },
    conceptGap: { type: String, default: "" },
    explanation: { type: String, default: "" },
    simplifiedExplanation: { type: String, default: "" },
    practiceQuestions: { type: [practiceQuestionSchema], default: [] },
    topicTag: { type: String, default: "General" },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
