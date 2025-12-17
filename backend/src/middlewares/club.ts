import { Request, Response, NextFunction } from "express";
import Club from "../models/Club";
import { IUser } from "../models/User";

interface AuthRequest extends Request {
  user?: IUser;
}

// Middleware to check if user is a member of the specified club (or admin)
export const isClubMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const clubId = req.params.id;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    // Admins have access to everything
    if (userRole === "admin") {
      (req as any).club = club;
      return next();
    }

    // Check if user is a member of the club
    if (!club.isMember(userId as string)) {
      return res.status(403).json({
        message:
          "Access denied. You must be a club member to perform this action",
      });
    }

    // Add club to request object for potential future use
    (req as any).club = club;
    next();
  } catch (error) {
    console.error("Club member check error:", error);
    res.status(500).json({ message: "Error checking club membership" });
  }
};

// Middleware to check if user is a club leader of the specified club (or admin)
export const isClubLeader = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const clubId = req.params.id;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    // Admins have access to everything
    if (userRole === "admin") {
      (req as any).club = club;
      return next();
    }

    // Check if user is the club leader
    const isLeader =
      !!(club as any).clubLeader &&
      (club as any).clubLeader.toString() === userId?.toString();

    if (!isLeader) {
      return res.status(403).json({
        message:
          "Access denied. Only club leader or admin can perform this action",
      });
    }

    // Add club to request object for potential future use
    (req as any).club = club;
    next();
  } catch (error) {
    console.error("Club leader check error:", error);
    res.status(500).json({ message: "Error checking club leader status" });
  }
};

// Middleware to check if user is a super admin
export const isAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin privileges required",
    });
  }
  next();
};
