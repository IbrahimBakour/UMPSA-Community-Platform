import multer from "multer";
import path from "path";
import { Request } from "express";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

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

// Cloudinary storage configuration
const getCloudinaryStorage = (folder: string) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      // Default folder from createUpload parameter
      let cloudinaryFolder = `umpsa/${folder}`;

      // Override based on fieldname and route for specific cases
      if (file.fieldname === "profilePicture") {
        const isClubRoute = req.originalUrl?.includes("/clubs/");
        cloudinaryFolder = isClubRoute ? "umpsa/club-media" : "umpsa/profiles";
      } else if (file.fieldname === "banner") {
        cloudinaryFolder = "umpsa/club-media";
      } else if (file.fieldname === "postMedia") {
        cloudinaryFolder = "umpsa/posts";
      }
      // If none of the above match, use the default folder parameter

      return {
        folder: cloudinaryFolder,
        resource_type: "auto",
        public_id: `${file.fieldname}-${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}`,
      };
    },
  });
};

// Use Cloudinary if credentials are available
const useCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

// Fallback local storage
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "uploads/";

    // Determine upload path based on file type
    if (file.fieldname === "profilePicture") {
      const isClubRoute = req.originalUrl?.includes("/clubs/");
      uploadPath += isClubRoute ? "general/" : "profiles/";
    } else if (
      file.fieldname === "banner" ||
      file.fieldname === "clubProfilePicture"
    ) {
      uploadPath += "general/";
    } else if (file.fieldname === "postMedia") {
      uploadPath += "posts/";
    } else {
      uploadPath += "general/";
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
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

  if (file.fieldname === "profilePicture") {
    maxSize = MAX_PROFILE_SIZE;
  } else if (allowedVideoTypes.includes(file.mimetype)) {
    maxSize = MAX_VIDEO_SIZE;
  }

  cb(null, true);
};

// Create multer instances with appropriate storage
const createUpload = (folder?: string) => {
  const storage = useCloudinary
    ? getCloudinaryStorage(folder || "general")
    : localStorage;

  return multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: MAX_VIDEO_SIZE,
      files: 10,
    },
  });
};

const uploadInstances = {
  profilePicture: createUpload("profiles"), // Will be dynamically routed in getCloudinaryStorage
  clubMedia: createUpload("club-media"),
  postMedia: createUpload("posts"),
  general: createUpload("general"),
};

// Middleware for profile picture upload
export const uploadProfilePicture =
  uploadInstances.profilePicture.single("profilePicture");

// Middleware for club media upload (multiple files)
export const uploadClubMedia = uploadInstances.clubMedia.fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "banner", maxCount: 1 },
]);

// Middleware for post media upload (multiple files)
export const uploadPostMedia = uploadInstances.postMedia.array("postMedia", 5);

// Middleware for single file upload (general purpose)
export const uploadSingleFile = uploadInstances.general.single("file");

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

export default uploadInstances.general;
