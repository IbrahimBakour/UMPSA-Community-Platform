import express from "express";
import { authMiddleware, adminMiddleware } from "../middlewares/auth";
import {
  getDashboardStats,
  getUserActivityAnalytics,
  getSystemHealth,
  getAdminAnalytics,
  getAdminActivities,
} from "../controllers/admin";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard and statistics
router.get("/dashboard", getDashboardStats);
router.get("/analytics", getAdminAnalytics);
router.get("/activities", getAdminActivities);

// User activity monitoring
router.get("/users/activity", getUserActivityAnalytics);

// System health and monitoring
router.get("/system/health", getSystemHealth);

export default router;
