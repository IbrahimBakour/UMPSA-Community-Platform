import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import clubRoutes from "./routes/club";
import postRoutes from "./routes/post";
import reportRoutes from "./routes/report";
import userUploadRoutes from "./routes/userUpload";
import clubUploadRoutes from "./routes/clubUpload";
import postUploadRoutes from "./routes/postUpload";

dotenv.config();

const app = express();

// Serve uploads statically
import path from "path";
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userUploadRoutes);
app.use("/api/clubs", clubUploadRoutes);
app.use("/api/posts", postUploadRoutes);

// Basic test route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to UMPSA Community Platform API" });
});

export default app;
