import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import doubtRoutes from "./routes/doubtRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import modelPaperRoutes from "./routes/modelPaperRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/doubts", doubtRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/modelpapers", modelPaperRoutes);

app.get("/", (req, res) => {
  res.send("Samjho AI backend is running");
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
