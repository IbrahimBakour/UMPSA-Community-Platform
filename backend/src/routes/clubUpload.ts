import express from "express";
import multer from "multer";
import path from "path";
import Club from "../models/Club";
import { authMiddleware } from "../middlewares/auth";
import { isClubMember, isAdmin } from "../middlewares/club";

const router = express.Router();

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
  limits: { fileSize: 2 * 1024 * 1024 },
});

// Upload club banner
router.post(
  "/:id/banner",
  authMiddleware,
  isClubMember,
  upload.single("banner"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const club = await Club.findByIdAndUpdate(
        req.params.id,
        { banner: `/uploads/${req.file.filename}` },
        { new: true }
      );
      res.json({ message: "Club banner updated", banner: club?.banner });
    } catch (error) {
      console.error("Club banner upload error:", error);
      res.status(500).json({ message: "Error uploading club banner" });
    }
  }
);

// Upload club profile picture
router.post(
  "/:id/profile-picture",
  authMiddleware,
  isClubMember,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const club = await Club.findByIdAndUpdate(
        req.params.id,
        { profilePicture: `/uploads/${req.file.filename}` },
        { new: true }
      );
      res.json({
        message: "Club profile picture updated",
        profilePicture: club?.profilePicture,
      });
    } catch (error) {
      console.error("Club profile picture upload error:", error);
      res.status(500).json({ message: "Error uploading club profile picture" });
    }
  }
);

export default router;
