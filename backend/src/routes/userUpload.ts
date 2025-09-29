import express from "express";
import multer from "multer";
import path from "path";
import User from "../models/User";
import { authMiddleware } from "../middlewares/auth";

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed!"));
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// Upload user profile picture
router.post(
  "/profile-picture",
  authMiddleware,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { profilePicture: `/uploads/${req.file.filename}` },
        { new: true }
      );
      res.json({
        message: "Profile picture updated",
        profilePicture: user?.profilePicture,
      });
    } catch (error) {
      console.error("Profile picture upload error:", error);
      res.status(500).json({ message: "Error uploading profile picture" });
    }
  }
);

export default router;
