import express from "express";
import { authMiddleware } from "../middlewares/auth";

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
  });
});

export default router;


