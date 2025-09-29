import express from "express";
import {
  createPost,
  getClubPosts,
  getPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  editComment,
  deleteComment,
  getComments,
} from "../controllers/post";
import { authMiddleware } from "../middlewares/auth";
import { isClubMember } from "../middlewares/club";

const router = express.Router();

// Apply auth middleware to all routes except public ones
router.use(authMiddleware);

// Post routes
router.post("/", createPost);
router.get("/club/:clubId", getClubPosts);
router.get("/:id", getPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);
router.post("/:id/like", toggleLike);

// Comment routes
router.get("/:postId/comments", getComments);
router.post("/:id/comments", addComment);
router.put("/:postId/comments/:commentId", editComment);
router.delete("/:postId/comments/:commentId", deleteComment);

export default router;
