import express from "express";
import ModelPaper from "../models/ModelPaper.js";

const router = express.Router();

const BOARD_PATTERNS = {
  CBSE: `Follow the CBSE Class 10 board exam pattern: sections A (1-mark MCQs, 20 questions), B (2-mark short answer, 5 questions), C (3-mark short answer, 6 questions), D (5-mark long answer, 4 questions), E (4-mark case-study based, 3 questions). Total 80 marks.`,
  "Karnataka SSLC": `Follow the Karnataka SSLC Class 10 board exam pattern: Part A (1-mark objective/MCQ, 8 questions), Part B (2-mark short answer, 8 questions), Part C (3-mark short answer, 8 questions), Part D (4-mark long answer, 9 questions), Part E (5-mark long answer/diagram, 3 questions). Total 80 marks.`,
};

// POST /api/modelpapers - generate a full model question paper for a subject
router.post("/", async (req, res) => {
  try {
    const { studentName, board, subject } = req.body;

    if (!studentName || !board || !subject) {
      return res.status(400).json({ error: "studentName, board, and subject are required" });
    }

    if (!BOARD_PATTERNS[board]) {
      return res.status(400).json({ error: "Unsupported board" });
    }

    const prompt = `Generate a complete Class 10 model question paper for the subject "${subject}".

${BOARD_PATTERNS[board]}

Cover the standard syllabus topics for this subject at Class 10 level, spread evenly across chapters, similar in difficulty and style to real previous year board papers (but do not copy any real paper — write original questions).

Format as clean readable plain text (no markdown symbols like # or **) with:
- A header with subject, board, total marks, and time (3 hours)
- Clear section headings
- Numbered questions
- A short answer key at the very end listing only final answers (not full solutions) for objective/short questions

Keep it realistic and exam-ready.`;

    const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 3000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const aiData = await aiResponse.json();

    if (!aiData.content || !aiData.content[0]) {
      return res.status(502).json({ error: "AI service did not return a response" });
    }

    const content = aiData.content[0].text.trim();

    const paper = new ModelPaper({ studentName, board, subject, content });
    await paper.save();

    res.status(201).json(paper);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while generating model paper" });
  }
});

// GET /api/modelpapers/:studentName - past generated papers for a student
router.get("/:studentName", async (req, res) => {
  try {
    const papers = await ModelPaper.find({
      studentName: req.params.studentName,
    }).sort({ createdAt: -1 });
    res.json(papers);
  } catch (err) {
    res.status(500).json({ error: "Server error while fetching model papers" });
  }
});

export default router;
