import app from "./app";
import connectDB from "./config/db";
import { scheduleReportCleanup } from "./services/reportCleanup";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT;

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
