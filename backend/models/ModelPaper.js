import mongoose from "mongoose";

const modelPaperSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true },
    board: { type: String, enum: ["CBSE", "Karnataka SSLC"], required: true },
    subject: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const ModelPaper = mongoose.model("ModelPaper", modelPaperSchema);

export default ModelPaper;
