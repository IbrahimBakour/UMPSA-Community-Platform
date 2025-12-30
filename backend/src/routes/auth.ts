import express from "express";
import multer from "multer";
import { login, importUsers } from "../controllers/auth";
import { authMiddleware, adminMiddleware } from "../middlewares/auth";

const router = express.Router();

// Configure multer for Excel file upload (use memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
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
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for Excel files
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
