import express from "express";
import {
  createReport,
  listReports,
  getReport,
  updateReport,
  restrictUserFromReport,
  unrestrictUserFromReport,
} from "../controllers/report";
import { authMiddleware } from "../middlewares/auth";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Create a new report (any user)
router.post("/", createReport);

// Admin-only routes
router.get("/", listReports);
router.get("/:id", getReport);
router.put("/:id", updateReport);
router.post("/:id/restrictUser", restrictUserFromReport);
router.post("/:id/unrestrictUser", unrestrictUserFromReport);

export default router;
