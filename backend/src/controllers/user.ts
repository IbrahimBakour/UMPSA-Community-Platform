import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import Post from "../models/Post";
import Club from "../models/Club";
import Report from "../models/Report";
import { IUser } from "../models/User";

interface AuthRequest extends Request {
  user?: IUser;
}

interface PaginationQuery {
  page?: string;
  limit?: string;
}

// Get all users (Admin only)
export const getAllUsers = async (
  req: AuthRequest & { query: PaginationQuery },
  res: Response
) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "10");
    const search = (req.query.search as string)?.trim();
    const role = (req.query.role as string)?.trim();
    const status = (req.query.status as string)?.trim();
    const skip = (page - 1) * limit;

    const query: any = {};

    // Search by studentId or nickname
    if (search) {
      query.$or = [
        { studentId: { $regex: search, $options: "i" } },
        { nickname: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by role
    if (role && ["student", "club_member", "admin"].includes(role)) {
      query.role = role;
    }

    // Filter by status
    if (status && ["active", "restricted"].includes(status)) {
      query.status = status;
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password") // Exclude password from response
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    res.json({
      users,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Get user by ID (Admin only)
export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const user = await User.findById(req.params.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Error fetching user" });
  }
};

// Get public user profile (any authenticated user)
export const getPublicUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      studentId: user.studentId,
      nickname: user.nickname,
      role: user.role,
      status: user.status,
      restriction: user.restriction,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Get public user profile error:", error);
    res.status(500).json({ message: "Error fetching user profile" });
  }
};

// Update user role (Admin only)
export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const { userId } = req.params;
    const { role } = req.body;

    if (!["student", "club_member", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Must be: student, club_member, or admin",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent demoting the last admin
    if (user.role === "admin" && role !== "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({
          message: "Cannot demote the last admin",
        });
      }
    }

    user.role = role as "student" | "club_member" | "admin";
    await user.save();

    res.json({
      message: "User role updated successfully",
      user: {
        _id: user._id,
        studentId: user.studentId,
        nickname: user.nickname,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ message: "Error updating user role" });
  }
};

// Update user status (Admin only)
export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const { userId } = req.params;
    const { status, restriction } = req.body;

    if (!["active", "restricted"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be: active or restricted",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.status = status as "active" | "restricted";

    if (status === "restricted" && restriction) {
      user.restriction = {
        type: restriction.type,
        ...(restriction.until ? { until: new Date(restriction.until) } : {}),
      } as any;
    } else if (status === "active") {
      user.restriction = undefined as any;
    }

    await user.save();

    res.json({
      message: "User status updated successfully",
      user: {
        _id: user._id,
        studentId: user.studentId,
        nickname: user.nickname,
        role: user.role,
        status: user.status,
        restriction: user.restriction,
      },
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({ message: "Error updating user status" });
  }
};

// Update user profile (User can update their own profile)
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { nickname, profilePicture } = req.body;
    const userId = req.user?._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update allowed fields
    if (nickname !== undefined) user.nickname = nickname;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        studentId: user.studentId,
        nickname: user.nickname,
        role: user.role,
        status: user.status,
        profilePicture: user.profilePicture,
        restriction: user.restriction,
      },
    });
  } catch (error) {
    console.error("Update user profile error:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

// Change user password
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Error changing password" });
  }
};

// Get user statistics (Admin only)
export const getUserStats = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const [
      totalUsers,
      activeUsers,
      restrictedUsers,
      students,
      clubMembers,
      admins,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: "active" }),
      User.countDocuments({ status: "restricted" }),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "club_member" }),
      User.countDocuments({ role: "admin" }),
    ]);

    res.json({
      totalUsers,
      activeUsers,
      restrictedUsers,
      students,
      clubMembers,
      admins,
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({ message: "Error fetching user statistics" });
  }
};

// Get user activity (any authenticated user)
export const getUserActivity = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const [posts, clubs, reports] = await Promise.all([
      Post.countDocuments({ author: userId }),
      Club.countDocuments({ members: userId }),
      Report.countDocuments({ reportedBy: userId }),
    ]);

    res.json({
      user: {
        _id: user._id,
        studentId: user.studentId,
        nickname: user.nickname,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
      activity: {
        postsCreated: posts,
        clubsJoined: clubs,
        reportsSubmitted: reports,
      },
    });
  } catch (error) {
    console.error("Get user activity error:", error);
    res.status(500).json({ message: "Error fetching user activity" });
  }
};

// Delete user (Admin only)
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const { userId } = req.params;

    // Prevent deleting the last admin
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({
          message: "Cannot delete the last admin",
        });
      }
    }

    // Delete user and related data
    await Promise.all([
      User.findByIdAndDelete(userId),
      Post.deleteMany({ author: userId }),
      Report.deleteMany({ reportedBy: userId }),
      // Remove user from clubs
      Club.updateMany({ members: userId }, { $pull: { members: userId } }),
    ]);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
};
