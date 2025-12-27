import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import clubRoutes from "./routes/club";
import postRoutes from "./routes/post";
import feedRoutes from "./routes/feed";
import reportRoutes from "./routes/report";
import userUploadRoutes from "./routes/userUpload";
import userRoutes from "./routes/user";
import clubUploadRoutes from "./routes/clubUpload";
import postUploadRoutes from "./routes/postUpload";
import uploadRoutes from "./routes/upload";
import adminRoutes from "./routes/admin";
import pollRoutes from "./routes/poll";
import notificationRoutes from "./routes/notification";

dotenv.config();

const app = express();

// Serve uploads statically
import path from "path";
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userUploadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/clubs", clubUploadRoutes);
app.use("/api/posts", postUploadRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/notifications", notificationRoutes);

// Basic test route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to UMPSA Community Platform API" });
});

// Health check endpoint for Render
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve Frontend in Production
if (process.env.NODE_ENV === "production") {
  // Serve static files from the frontend build directory
  const frontendPath = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(frontendPath));

  // Handle React routing - return index.html for all non-API routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

export default app;
