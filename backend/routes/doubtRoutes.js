import express from "express";
import Session from "../models/Session.js";

const router = express.Router();

// POST /api/doubts - submit a doubt, get AI diagnosis + explanation + practice questions
router.post("/", async (req, res) => {
  try {
    const { studentName, gradeLevel, subject, doubtText, explanationLanguage } = req.body;

    if (!studentName || !gradeLevel || !subject || !doubtText) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const language = explanationLanguage || "English";

    const prompt = `A student in grade "${gradeLevel}" studying "${subject}" has this doubt:
"${doubtText}"

Act as a patient tutor for underserved/first-generation learners. Do three things:
1. Diagnose the underlying concept gap causing this doubt (one short sentence).
2. Write a SHORT explanation suited to grade "${gradeLevel}" — max 60 words. Do NOT write a long paragraph. Break it into short points (2-4 bullet-style sentences, each on its own idea). Use very simple everyday words. If the concept is visual or spatial (shapes, fractions, processes, cycles, number lines, etc.), include one simple text-based diagram using arrows, dashes, or a small ASCII sketch to illustrate it — only if it genuinely helps, otherwise skip it.
3. Write 2 short practice questions (multiple choice, 4 options each) that test if the gap is closed.
4. Give one short topic tag (2-3 words) that categorizes this doubt, e.g. "Fractions", "Newton's Laws".

IMPORTANT: Write the conceptGap, explanation, topicTag, and all practice questions/options entirely in ${language}. If ${language} is not English, still use standard mathematical/scientific notation and numerals where needed, but all surrounding text must be in ${language} (use the native script, e.g. Kannada script for Kannada, Telugu script for Telugu).

Respond with ONLY valid JSON, no markdown fences, no preamble, in exactly this shape:
{
  "conceptGap": "string",
  "explanation": "string",
  "topicTag": "string",
  "practiceQuestions": [
    { "question": "string", "options": ["a","b","c","d"], "correctAnswer": "string" },
    { "question": "string", "options": ["a","b","c","d"], "correctAnswer": "string" }
  ]
}`;

    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const aiData = await aiResponse.json();

    if (
      !aiData.candidates ||
      !aiData.candidates[0] ||
      !aiData.candidates[0].content
    ) {
      console.error("Gemini response:", JSON.stringify(aiData));
      return res.status(502).json({ error: "AI service did not return a response" });
    }

    const rawText = aiData.candidates[0].content.parts[0].text
      .replace(/```json|```/g, "")
      .trim();
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (parseErr) {
      return res.status(502).json({ error: "Could not parse AI response", raw: rawText });
    }

    const session = new Session({
      studentName,
      gradeLevel,
      subject,
      doubtText,
      explanationLanguage: language,
      conceptGap: parsed.conceptGap,
      explanation: parsed.explanation,
      topicTag: parsed.topicTag,
      practiceQuestions: parsed.practiceQuestions,
    });

    await session.save();

    res.status(201).json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while processing doubt" });
  }
});

// POST /api/doubts/:id/reexplain - student didn't understand, give a fresh simpler explanation
router.post("/:id/reexplain", async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const prompt = `A grade "${session.gradeLevel}" student asked this doubt about "${session.subject}":
"${session.doubtText}"

They were already given this explanation but said they still did not understand it:
"${session.explanation}"

Write a COMPLETELY DIFFERENT, even simpler explanation. Use a different everyday analogy or a step-by-step breakdown than before. Max 50 words, broken into short points, very plain language, as if explaining to a friend, in ${session.explanationLanguage}. If a simple text-based diagram (arrows, dashes, small sketch) would help, include one.

Respond with ONLY the explanation text. No JSON, no preamble, no markdown.`;

    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const aiData = await aiResponse.json();

    if (
      !aiData.candidates ||
      !aiData.candidates[0] ||
      !aiData.candidates[0].content
    ) {
      return res.status(502).json({ error: "AI service did not return a response" });
    }

    const simplifiedExplanation = aiData.candidates[0].content.parts[0].text.trim();

    session.simplifiedExplanation = simplifiedExplanation;
    await session.save();

    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while generating simplified explanation" });
  }
});

// PATCH /api/doubts/:id/resolve - mark a session as resolved after practice questions attempted
router.patch("/:id/resolve", async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { resolved: true },
      { new: true }
    );
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: "Server error while updating session" });
  }
});

// GET /api/doubts/:studentName - all past sessions for a student
router.get("/:studentName", async (req, res) => {
  try {
    const sessions = await Session.find({
      studentName: req.params.studentName,
    }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: "Server error while fetching sessions" });
  }
});

export default router;
