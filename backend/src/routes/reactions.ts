import { Router } from "express";
import { addReaction, removeReaction } from "../controllers/reactions";
import { checkNotRestricted } from "../middleware/checkNotRestricted";
import { authenticate } from "../middleware/auth";

const router = Router();

// Route to add a reaction to a post
router.post(
  "/:postType/:postId/reactions",
  authenticate,
  checkNotRestricted,
  addReaction
);

// Route to remove a reaction from a post
router.delete(
  "/:postType/:postId/reactions",
  authenticate,
  checkNotRestricted,
  removeReaction
);

export default router;
