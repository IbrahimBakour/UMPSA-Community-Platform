import express from "express";
import { authMiddleware } from "../middlewares/auth";
import {
  validateAndCreatePollData,
  votePoll,
  getPollResults,
  updatePoll,
  deletePoll,
  getAllPolls,
  getPollAnalytics,
  getUserPollHistory,
} from "../controllers/poll";

const router = express.Router();

// All poll routes require authentication
router.use(authMiddleware);

// Poll CRUD operations (no separate create route - polls are created with posts)
router.put("/:postId", updatePoll);
router.delete("/:postId", deletePoll);

// Poll interactions
router.post("/:postId/vote", votePoll);
router.get("/:postId/results", getPollResults);

// Poll listings and analytics
router.get("/", getAllPolls);
router.get("/analytics", getPollAnalytics);
router.get("/history", getUserPollHistory);

export default router;
