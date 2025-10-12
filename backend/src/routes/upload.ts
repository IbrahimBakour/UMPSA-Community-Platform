import express from "express";
import { authMiddleware, adminMiddleware } from "../middlewares/auth";
import {
  uploadProfilePicture,
  uploadClubMedia,
  uploadPostMedia,
  deleteFile,
  getFileInfo,
} from "../controllers/upload";
import {
  uploadProfilePicture as uploadProfilePictureMw,
  uploadClubMedia as uploadClubMediaMw,
  uploadPostMedia as uploadPostMediaMw,
} from "../middlewares/upload";

const router = express.Router();

// All upload routes require authentication
router.use(authMiddleware);

// Profile picture upload
router.post(
  "/profile",
  uploadProfilePictureMw,
  (req, res, next) => {
    // Force cast req as AuthRequest for the controller
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (uploadProfilePicture as any)(req, res, next);
  }
);

// Club media upload
router.post(
  "/clubs/:clubId",
  uploadClubMediaMw,
  (req, res, next) => {
    // Force cast req as AuthRequest for the controller
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (uploadClubMedia as any)(req, res, next);
  }
);


// Post media upload
router.post("/posts", uploadPostMediaMw, (req, res, next) => {
  // Force cast req as AuthRequest for the controller
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (uploadPostMedia as any)(req, res, next);
});

// File management
router.delete("/file", deleteFile as any);
router.get("/info/:filePath", getFileInfo as any);

export default router;
