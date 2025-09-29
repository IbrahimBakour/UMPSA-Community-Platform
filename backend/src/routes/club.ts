import express from "express";
import {
  createClub,
  getClubs,
  getClub,
  updateClub,
  deleteClub,
  addMember,
  removeMember,
} from "../controllers/club";
import { authMiddleware } from "../middlewares/auth";
import { isClubMember, isAdmin } from "../middlewares/club";

const router = express.Router();

// Public routes
router.get("/", getClubs);
router.get("/:id", getClub);

// Protected routes (require authentication)
router.use(authMiddleware);

// Admin only routes
router.post("/", isAdmin, createClub);
router.delete("/:id", isAdmin, deleteClub);

// Club member only routes
router.put("/:id", isClubMember, updateClub);
router.post("/:id/members", isClubMember, addMember);
router.delete("/:id/members", isClubMember, removeMember);

export default router;
