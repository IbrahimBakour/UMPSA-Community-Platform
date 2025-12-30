import app from "./app";
import connectDB from "./config/db";
import { scheduleReportCleanup } from "./services/reportCleanup";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const port = process.env.PORT || 5000;

// Create uploads directories if they don't exist (for local development fallback)
const useCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (!useCloudinary) {
  const uploadDirs = [
    "uploads",
    "uploads/profiles",
    "uploads/general",
    "uploads/posts",
  ];

  uploadDirs.forEach((dir) => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
}

// Connect to MongoDB
connectDB()
  .then(() => {
    // Schedule automatic cleanup of resolved reports
    scheduleReportCleanup();

    // Start server after successful DB connection
    app.listen(Number(port), () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
