import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUser } from "../models/User";
import User from "../models/User";

interface AuthRequest extends Request {
  user?: IUser;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "No authentication token found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.status === "restricted") {
      return res.status(403).json({
        message: "Account is restricted",
        restriction: user.restriction,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      if (error.name === 'TokenExpiredError') {
        console.log('Token expired for user');
        return res.status(401).json({ 
          message: "Authentication token has expired. Please login again.",
          expired: true 
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          message: "Invalid authentication token. Please login again.",
          invalid: true 
        });
      }
    }
    res.status(401).json({ message: "Invalid authentication token" });
  }
};

export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};
