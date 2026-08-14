// index.js

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// -------------------
// CONFIG
// -------------------

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// -------------------
// MIDDLEWARE
// -------------------

app.use(cors());
app.use(express.json());

// -------------------
// HEALTH CHECK
// -------------------

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// -------------------
// ROUTES
// -------------------

// ⚠️ You should split these into separate route files
import challengeRoutes from "./routes/challenge.routes.js";
import userRoutes from "./routes/user.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";

app.use("/api/challenges", challengeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// -------------------
// 404 HANDLER
// -------------------

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// -------------------
// GLOBAL ERROR HANDLER
// -------------------

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// -------------------
// DATABASE CONNECTION
// -------------------

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(
        `🚀 Server running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();