import { Request, Response, NextFunction } from "express";
import Club from "../models/Club";
import { IUser } from "../models/User";

interface AuthRequest extends Request {
  user?: IUser;
}

// Middleware to check if user is a member of the specified club
export const isClubMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const clubId = req.params.id;
    const userId = req.user?._id;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

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
