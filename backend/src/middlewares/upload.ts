import multer from "multer";
import path from "path";
import { Request } from "express";

// File type validation
const allowedImageTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];
const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];
const allowedFileTypes = [...allowedImageTypes, ...allowedVideoTypes];

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_PROFILE_SIZE = 2 * 1024 * 1024; // 2MB for profile pictures

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "uploads/";

    // Determine upload path based on file type
    if (file.fieldname === "profilePicture") {
      // Check if it's a user profile or club profile based on route
      const isClubRoute = req.originalUrl?.includes("/clubs/");
      uploadPath += isClubRoute ? "general/" : "profiles/";
    } else if (
      file.fieldname === "banner" ||
      file.fieldname === "clubProfilePicture"
    ) {
      uploadPath += "general/"; // Banner goes to general folder
    } else if (file.fieldname === "postMedia") {
      uploadPath += "posts/";
    } else {
      uploadPath += "general/";
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random string
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    const fileName = `${file.fieldname}-${uniqueSuffix}${fileExtension}`;
    cb(null, fileName);
  },
});

// File filter function
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Check file type
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed types: ${allowedFileTypes.join(", ")}`
      )
    );
  }
};

// File size validation
const fileSizeValidator = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  let maxSize = MAX_IMAGE_SIZE;

  // Set appropriate size limit based on file type and field
  if (file.fieldname === "profilePicture") {
    maxSize = MAX_PROFILE_SIZE;
  } else if (allowedVideoTypes.includes(file.mimetype)) {
    maxSize = MAX_VIDEO_SIZE;
  }

  // Note: Actual size validation happens after upload in the controller
  // This is just for multer configuration
  cb(null, true);
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_VIDEO_SIZE, // Set to largest allowed size
    files: 10, // Maximum number of files per request
  },
});

// Middleware for profile picture upload
export const uploadProfilePicture = upload.single("profilePicture");

// Middleware for club media upload (multiple files)
export const uploadClubMedia = upload.fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "banner", maxCount: 1 },
]);

// Middleware for post media upload (multiple files)
export const uploadPostMedia = upload.array("postMedia", 5); // Max 5 files per post

// Middleware for single file upload (general purpose)
export const uploadSingleFile = upload.single("file");

// File validation helper
export const validateFileSize = (
  file: Express.Multer.File,
  fieldName: string
): boolean => {
  let maxSize = MAX_IMAGE_SIZE;

  if (fieldName === "profilePicture") {
    maxSize = MAX_PROFILE_SIZE;
  } else if (allowedVideoTypes.includes(file.mimetype)) {
    maxSize = MAX_VIDEO_SIZE;
  }

  return file.size <= maxSize;
};

// File type helper
export const getFileType = (
  mimetype: string
): "image" | "video" | "unknown" => {
  if (allowedImageTypes.includes(mimetype)) return "image";
  if (allowedVideoTypes.includes(mimetype)) return "video";
  return "unknown";
};

// Clean filename helper
export const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, "_");
};

export default upload;
