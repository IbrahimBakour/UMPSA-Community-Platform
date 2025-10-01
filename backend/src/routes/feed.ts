import express from "express";
import {
  getFeedPosts,
  createFeedPost,
  getPendingFeedPosts,
  approveFeedPost,
  rejectFeedPost,
  deleteFeedPost,
  getFeedPost,
  getFeedStats,
} from "../controllers/feed";
import { authMiddleware, adminMiddleware } from "../middlewares/auth";

const router = express.Router();

// Public route - get approved feed posts
router.get("/", getFeedPosts);

// Get single feed post
router.get("/:id", getFeedPost);

// Protected routes - require authentication
router.use(authMiddleware);

// Create feed post
router.post("/", createFeedPost);

// Admin-only routes
router.use(adminMiddleware);

// Get pending posts for review
router.get("/admin/pending", getPendingFeedPosts);

// Get feed statistics
router.get("/admin/stats", getFeedStats);

// Approve pending post
router.post("/:id/approve", approveFeedPost);

// Reject pending post
router.post("/:id/reject", rejectFeedPost);

// Delete any feed post
router.delete("/:id", deleteFeedPost);

export default router;
