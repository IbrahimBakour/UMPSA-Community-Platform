import express from "express";
import { authMiddleware, adminMiddleware } from "../middlewares/auth";
import {
  getAllUsers,
  getUserById,
  getPublicUserProfile,
  updateUserRole,
  updateUserStatus,
  updateUserProfile,
  changePassword,
  getUserStats,
  getUserActivity,
  deleteUser,
} from "../controllers/user";

const router = express.Router();

router.use(authMiddleware);

// Get current user profile
router.get("/me", (req: any, res) => {
  const user = req.user;
  res.json({
    _id: user._id,
    studentId: user.studentId,
    role: user.role,
    nickname: user.nickname,
    profilePicture: user.profilePicture,
    status: user.status,
    restriction: user.restriction,
    createdAt: user.createdAt,
  });
});

// User profile management
router.put("/me", updateUserProfile);
router.put("/me/password", changePassword);

// Public profile for any authenticated user
router.get("/:userId/profile", getPublicUserProfile);

// User activity (allows users to view their own activity)
router.get("/:userId/activity", getUserActivity);

// Admin-only user management routes
router.use(adminMiddleware);

// User CRUD
router.get("/", getAllUsers);
router.get("/stats", getUserStats);
router.get("/:userId", getUserById);

// User management
router.put("/:userId/role", updateUserRole);
router.put("/:userId/status", updateUserStatus);
router.delete("/:userId", deleteUser);

export default router;
