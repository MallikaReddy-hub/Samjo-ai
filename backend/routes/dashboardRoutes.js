import express from "express";
import Session from "../models/Session.js";

const router = express.Router();

// GET /api/dashboard/:studentName - topic-wise doubt count and resolution rate
router.get("/:studentName", async (req, res) => {
  try {
    const sessions = await Session.find({
      studentName: req.params.studentName,
    });

    const topicMap = {};

    sessions.forEach((s) => {
      const topic = s.topicTag || "General";
      if (!topicMap[topic]) {
        topicMap[topic] = { topic, totalDoubts: 0, resolved: 0 };
      }
      topicMap[topic].totalDoubts += 1;
      if (s.resolved) topicMap[topic].resolved += 1;
    });

    const weakTopics = Object.values(topicMap)
      .map((t) => ({
        ...t,
        masteryPercent: Math.round((t.resolved / t.totalDoubts) * 100),
      }))
      .sort((a, b) => a.masteryPercent - b.masteryPercent);

    res.json({
      totalSessions: sessions.length,
      topics: weakTopics,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error while building dashboard" });
  }
});

export default router;
