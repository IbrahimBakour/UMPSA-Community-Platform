import express from "express";
import {
  createClubPost,
  getClubPosts,
  getPost,
  updatePost,
  deletePost,
  addReaction,
  getPostReactions,
  addComment,
  editComment,
  deleteComment,
  getComments,
} from "../controllers/post";
import { authMiddleware } from "../middlewares/auth";

const router = express.Router();

// Public routes - no auth required
router.get("/:id", getPost);
router.get("/:id/reactions", getPostReactions);

// Protected routes - require authentication
router.use(authMiddleware);

// Club post routes
router.post("/clubs/:clubId", createClubPost);
router.get("/clubs/:clubId", getClubPosts);

// Post management routes
router.put("/:id", updatePost);
router.delete("/:id", deletePost);

// Reaction routes
router.post("/:id/reactions", addReaction);

// Comment routes
router.get("/:postId/comments", getComments);
router.post("/:id/comments", addComment);
router.put("/:postId/comments/:commentId", editComment);
router.delete("/:postId/comments/:commentId", deleteComment);

export default router;
