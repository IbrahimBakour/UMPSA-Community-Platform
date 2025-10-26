import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import User from "../models/User";
import Club from "../models/Club";
import { IUser } from "../models/User";
import { validateFileSize, getFileType } from "../middlewares/upload";

interface AuthRequest extends Request {
  user?: IUser;
  file?: Express.Multer.File;
  files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
}

// Upload profile picture
export const uploadProfilePicture = async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    const userId = req.user?._id;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Validate file size
    if (!validateFileSize(file, "profilePicture")) {
      // Delete the uploaded file if size is invalid
      fs.unlinkSync(file.path);
      return res.status(400).json({ 
        message: "File size too large. Maximum size for profile pictures is 2MB" 
      });
    }

    // Validate file type
    const fileType = getFileType(file.mimetype);
    if (fileType !== "image") {
      fs.unlinkSync(file.path);
      return res.status(400).json({ 
        message: "Only image files are allowed for profile pictures" 
      });
    }

    // Update user profile picture
    const user = await User.findById(userId);
    if (!user) {
      fs.unlinkSync(file.path);
      return res.status(404).json({ message: "User not found" });
    }

    // Delete old profile picture if exists
    if (user.profilePicture) {
      const oldImagePath = path.join(process.cwd(), user.profilePicture);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update user with new profile picture path
    user.profilePicture = file.path;
    await user.save();

    res.json({
      message: "Profile picture uploaded successfully",
      profilePicture: file.path,
      file: {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        type: fileType,
      },
    });
  } catch (error) {
    console.error("Upload profile picture error:", error);
    // Clean up file if there's an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: "Error uploading profile picture" });
  }
};

// Upload club media (profile picture and banner)
export const uploadClubMedia = async (req: AuthRequest, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const { clubId } = req.params;
    const userId = req.user?._id;

    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Check if user has permission to update club
    const club = await Club.findById(clubId);
    if (!club) {
      // Clean up uploaded files
      Object.values(files).flat().forEach(file => fs.unlinkSync(file.path));
      return res.status(404).json({ message: "Club not found" });
    }

    // Check if user is a club member or admin
    const isClubMember = club.isMember(userId?.toString() || "");
    const isAdmin = req.user?.role === "admin";
    
    if (!isClubMember && !isAdmin) {
      // Clean up uploaded files
      Object.values(files).flat().forEach(file => fs.unlinkSync(file.path));
      return res.status(403).json({ 
        message: "Only club members and admins can upload club media" 
      });
    }

    const uploadedFiles: any[] = [];
    const errors: string[] = [];

    // Process each uploaded file
    for (const [fieldName, fileArray] of Object.entries(files)) {
      for (const file of fileArray) {
        // Validate file size
        if (!validateFileSize(file, fieldName)) {
          errors.push(`File ${file.originalname} is too large`);
          fs.unlinkSync(file.path);
          continue;
        }

        // Validate file type
        const fileType = getFileType(file.mimetype);
        if (fileType !== "image") {
          errors.push(`File ${file.originalname} is not a valid image`);
          fs.unlinkSync(file.path);
          continue;
        }

        // Delete old file if exists
        if (fieldName === "profilePicture" && club.profilePicture) {
          const oldImagePath = path.join(process.cwd(), club.profilePicture);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } else if (fieldName === "banner" && club.banner) {
          const oldImagePath = path.join(process.cwd(), club.banner);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }

        // Update club with new file path (normalized to start with /)
        if (fieldName === "profilePicture") {
          club.profilePicture = file.path.startsWith('/') ? file.path : `/${file.path}`;
        } else if (fieldName === "banner") {
          club.banner = file.path.startsWith('/') ? file.path : `/${file.path}`;
        }

        uploadedFiles.push({
          fieldName,
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          type: fileType,
          path: file.path,
        });
      }
    }

    await club.save();

    res.json({
      message: "Club media uploaded successfully",
      uploadedFiles,
      errors: errors.length > 0 ? errors : undefined,
      club: {
        _id: club._id,
        name: club.name,
        profilePicture: club.profilePicture,
        banner: club.banner,
      },
    });
  } catch (error) {
    console.error("Upload club media error:", error);
    // Clean up all uploaded files
    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      Object.values(files).flat().forEach(file => fs.unlinkSync(file.path));
    }
    res.status(500).json({ message: "Error uploading club media" });
  }
};

// Upload post media
export const uploadPostMedia = async (req: AuthRequest, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const userId = req.user?._id;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadedFiles: any[] = [];
    const errors: string[] = [];

    // Process each uploaded file
    for (const file of files) {
      // Validate file size
      if (!validateFileSize(file, "postMedia")) {
        errors.push(`File ${file.originalname} is too large`);
        fs.unlinkSync(file.path);
        continue;
      }

      // Validate file type
      const fileType = getFileType(file.mimetype);
      if (fileType === "unknown") {
        errors.push(`File ${file.originalname} is not a valid image or video`);
        fs.unlinkSync(file.path);
        continue;
      }

      uploadedFiles.push({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        type: fileType,
        path: file.path,
      });
    }

    res.json({
      message: "Post media uploaded successfully",
      uploadedFiles,
      errors: errors.length > 0 ? errors : undefined,
      mediaUrls: uploadedFiles.map(file => {
        // Multer gives us relative path like "uploads/posts/filename.jpg"
        // Ensure it starts with / for the static file serving
        const cleanPath = file.path.startsWith('/') ? file.path : `/${file.path}`;
        return cleanPath;
      }),
    });
  } catch (error) {
    console.error("Upload post media error:", error);
    // Clean up all uploaded files
    if (req.files) {
      const files = req.files as Express.Multer.File[];
      files.forEach(file => fs.unlinkSync(file.path));
    }
    res.status(500).json({ message: "Error uploading post media" });
  }
};

// Delete uploaded file
export const deleteFile = async (req: AuthRequest, res: Response) => {
  try {
    const { filePath } = req.body;
    const userId = req.user?._id;

    if (!filePath) {
      return res.status(400).json({ message: "File path is required" });
    }

    // Check if file exists
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check if user has permission to delete this file
    // This is a basic check - you might want to enhance this based on your needs
    const isProfilePicture = filePath.includes("/profiles/");
    const isClubMedia = filePath.includes("/clubs/");
    const isPostMedia = filePath.includes("/posts/");

    if (isProfilePicture) {
      // Check if user owns this profile picture
      const user = await User.findOne({ profilePicture: filePath });
      if (
        !user ||
        !user._id ||
        user._id.toString() !== userId?.toString()
      ) {
        return res.status(403).json({ message: "You don't have permission to delete this file" });
      }
    } else if (isClubMedia) {
      // Check if user is a club member or admin
      const club = await Club.findOne({
        $or: [
          { profilePicture: filePath },
          { banner: filePath }
        ]
      });
      if (!club) {
        return res.status(404).json({ message: "Club not found" });
      }
      
      const isClubMember = club.isMember(userId?.toString() || "");
      const isAdmin = req.user?.role === "admin";
      
      if (!isClubMember && !isAdmin) {
        return res.status(403).json({ message: "You don't have permission to delete this file" });
      }
    } else if (isPostMedia) {
      // For post media, we'll allow deletion if user is admin
      // You might want to enhance this to check if user is the post author
      if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Only admins can delete post media" });
      }
    }

    // Delete the file
    fs.unlinkSync(fullPath);

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({ message: "Error deleting file" });
  }
};

// Get file info
export const getFileInfo = async (req: Request, res: Response) => {
  try {
    const { filePath } = req.params;
    
    const fullPath = path.join(process.cwd(), typeof filePath);
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: "File not found" });
    }

    const stats = fs.statSync(fullPath);
    const fileExtension = path.extname(fullPath).toLowerCase();
    
    res.json({
      path: filePath,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      extension: fileExtension,
    });
  } catch (error) {
    console.error("Get file info error:", error);
    res.status(500).json({ message: "Error getting file info" });
  }
};
