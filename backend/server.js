import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import chatRoutes from "./routes/chat.js";
import roadmapRoutes from "./routes/roadmap.js";
import coursesRoutes from "./routes/courses.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json({ limit: "5mb" }));

app.get("/", (_, res) => {
  res.json({
    message: "Learning Recommender Backend is running",
    status: "ok",
    api: {
      health: "/api/health",
      auth: "/api/auth",
      profile: "/api/profile",
      chat: "/api/chat",
      roadmap: "/api/roadmap",
      courses: "/api/courses",
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/courses", coursesRoutes);

app.get("/api/health", (_, res) => {
  res.json({
    status: "ok",
    timestamp: new Date(),
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.message || "Internal Server Error",
  });
});

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/learning_recommender";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected to:", MONGO_URI);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
