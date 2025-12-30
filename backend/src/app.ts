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
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

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

// Health check endpoint for Render
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve Frontend in Production
const frontendPath = path.join(__dirname, "../../frontend/dist");
const isProduction = process.env.NODE_ENV?.trim() === "production";

if (isProduction) {
  // Serve static files from the frontend build directory
  app.use(
    express.static(frontendPath, {
      index: false, // Don't auto-serve index.html, we'll handle it explicitly
      fallthrough: true,
    })
  );

  // Handle React routing - return index.html for all non-API routes
  app.use((req, res, next) => {
    // Skip if it's an API route
    if (req.path.startsWith("/api/")) {
      return next();
    }

    const indexPath = path.join(frontendPath, "index.html");
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error("Error sending index.html:", err);
        res.status(500).send("Error loading application");
      }
    });
  });
} else {
  console.log("Development mode: Not serving frontend");
  // Development mode - just return API info
  app.get("/", (req, res) => {
    res.json({ message: "Welcome to UMPSA Community Platform API" });
  });
}

// Error handling middleware (must be last)
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res.status(err.status || 500).json({
      message: err.message || "Internal Server Error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }
);

export default app;
