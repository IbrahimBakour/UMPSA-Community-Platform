import express from "express";
import multer from "multer";
import { login, importUsers } from "../controllers/auth";
import { authMiddleware, adminMiddleware } from "../middlewares/auth";

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new Error("Only Excel files are allowed"));
    }
  },
});

// Login route
router.post("/login", login);

// Import users route (admin only)
router.post(
  "/import",
  authMiddleware,
  adminMiddleware,
  upload.single("users"), // Changed field name to "users"
  importUsers
);

export default router;
