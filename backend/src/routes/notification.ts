import express from "express";
import { authMiddleware, adminMiddleware } from "../middlewares/auth";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationStats,
  cleanupExpiredNotifications,
  getNotificationAnalytics,
} from "../controllers/notification";

const router = express.Router();

// All notification routes require authentication
router.use(authMiddleware);

// User notification management
router.get("/", getUserNotifications);
router.get("/stats", getNotificationStats);
router.put("/:notificationId/read", markNotificationAsRead);
router.put("/read-all", markAllNotificationsAsRead);
router.delete("/:notificationId", deleteNotification);

// Admin-only routes
router.use(adminMiddleware);
router.delete("/cleanup/expired", cleanupExpiredNotifications);
router.get("/analytics", getNotificationAnalytics);

export default router;
