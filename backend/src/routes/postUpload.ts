import express from "express";
import multer from "multer";
import path from "path";
import Post from "../models/Post";
import { authMiddleware } from "../middlewares/auth";

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

// Upload multiple images to a post
router.post(
  "/:id/images",
  authMiddleware,
  upload.array("images", 5),
  async (req, res) => {
    try {
      if (
        !req.files ||
        !(req.files instanceof Array) ||
        req.files.length === 0
      ) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      const mediaPaths = req.files.map((file) => `/uploads/${file.filename}`);
      const post = await Post.findByIdAndUpdate(
        req.params.id,
        { $push: { media: { $each: mediaPaths } } },
        { new: true }
      );
      res.json({ message: "Images uploaded", images: post?.media });
    } catch (error) {
      console.error("Post images upload error:", error);
      res.status(500).json({ message: "Error uploading images" });
    }
  }
);

export default router;
