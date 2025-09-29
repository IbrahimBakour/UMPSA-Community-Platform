import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic test route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to UMPSA Community Platform API" });
});

export default app;
