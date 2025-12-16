import { Request, Response } from "express";
import Club from "../models/Club";
import User from "../models/User";
import { IUser } from "../models/User";
import {
  triggerClubJoinedNotification,
  triggerClubLeftNotification,
} from "../services/notificationTriggers";

interface AuthRequest extends Request {
  user?: IUser;
}

// Create a new club (Admin only)
export const createClub = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, about, contact, leaderStudentId } = req.body;
    const adminId = req.user?._id;

    if (!name) {
      return res.status(400).json({ message: "Club name is required" });
    }

    if (!leaderStudentId) {
      return res.status(400).json({
        message: "A club leader is required. Please provide a student ID.",
      });
    }

    // Check if club with same name exists
    const existingClub = await Club.findOne({ name });
    if (existingClub) {
      return res
        .status(400)
        .json({ message: "A club with this name already exists" });
    }

    // Find the user by studentId
    const leaderUser = await User.findOne({ studentId: leaderStudentId });
    if (!leaderUser) {
      return res.status(404).json({
        message: `User with student ID "${leaderStudentId}" not found`,
      });
    }

    // Update leader's role to club_leader
    if (leaderUser.role === "student" || leaderUser.role === "club_member") {
      leaderUser.role = "club_leader";
      await leaderUser.save();
    }

    const club = new Club({
      name,
      description,
      about,
      contact,
      members: [leaderUser._id], // Initial club leader
      clubLeader: leaderUser._id,
      createdBy: adminId,
    });

    await club.save();

    res.status(201).json({
      message: "Club created successfully",
      club: await club.populate(["members", "createdBy"]),
    });
  } catch (error) {
    console.error("Create club error:", error);
    res.status(500).json({ message: "Error creating club" });
  }
};

// Get all clubs
export const getClubs = async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || "1");
    const limit = parseInt((req.query.limit as string) || "10");
    const search = (req.query.search as string)?.trim();
    const skip = (page - 1) * limit;

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { about: { $regex: search, $options: "i" } },
      ];
    }

    const [clubs, total] = await Promise.all([
      Club.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate("members", "studentId nickname profilePicture")
        .populate("createdBy", "studentId"),
      Club.countDocuments(query),
    ]);

    res.json({
      clubs,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalClubs: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get clubs error:", error);
    res.status(500).json({ message: "Error fetching clubs" });
  }
};

// Get single club by ID
export const getClub = async (req: Request, res: Response) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate("members", "studentId nickname profilePicture")
      .populate("clubLeader", "studentId nickname profilePicture")
      .populate("createdBy", "studentId");

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    res.json(club);
  } catch (error) {
    console.error("Get club error:", error);
    res.status(500).json({ message: "Error fetching club" });
  }
};

// Update club details (Club members only)
export const updateClub = async (req: AuthRequest, res: Response) => {
  try {
    const { description, about, contact, profilePicture, banner } = req.body;
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    const userId = req.user?._id as string;
    const isAdmin = req.user?.role === "admin";
    const isClubLeader = (club as any).clubLeader.toString() === userId;

    // Check if user is club leader or admin
    if (!isAdmin && !isClubLeader) {
      return res
        .status(403)
        .json({ message: "Only club leader or admin can update club details" });
    }

    // Update allowed fields
    if (description) club.description = description;
    if (about) club.about = about;
    if (contact) club.contact = contact;
    if (profilePicture) club.profilePicture = profilePicture;
    if (banner) club.banner = banner;

    await club.save();

    res.json({
      message: "Club updated successfully",
      club: await club.populate(["members", "createdBy"]),
    });
  } catch (error) {
    console.error("Update club error:", error);
    res.status(500).json({ message: "Error updating club" });
  }
};

// Delete club (Admin only)
export const deleteClub = async (req: Request, res: Response) => {
  try {
    const club = await Club.findByIdAndDelete(req.params.id);

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    res.json({ message: "Club deleted successfully" });
  } catch (error) {
    console.error("Delete club error:", error);
    res.status(500).json({ message: "Error deleting club" });
  }
};

// Add member to club (Club members only)
export const addMember = async (req: AuthRequest, res: Response) => {
  try {
    // Accept studentId, memberId (legacy), or userId (from frontend)
    const studentId = req.body.studentId;
    const memberId = req.body.memberId || req.body.userId;

    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    if (!studentId && !memberId) {
      return res
        .status(400)
        .json({ message: "Student ID or User ID is required" });
    }

    const userId = req.user?._id as string;
    const isAdmin = req.user?.role === "admin";
    const isClubLeader =
      (club as any).clubLeader.toString() === userId.toString();

    // Check if user is club leader or admin
    if (!isAdmin && !isClubLeader) {
      return res
        .status(403)
        .json({ message: "Only club leader or admin can add new members" });
    }

    let userToAdd: any;

    // If studentId is provided, find user by studentId
    if (studentId) {
      userToAdd = await User.findOne({ studentId });
      if (!userToAdd) {
        return res
          .status(404)
          .json({ message: `User with student ID "${studentId}" not found` });
      }
    } else {
      // Otherwise, find user by memberId/userId
      userToAdd = await User.findById(memberId);
      if (!userToAdd) {
        return res.status(404).json({ message: "User not found" });
      }
    }

    // Check if user is already a member
    if (club.isMember(userToAdd._id.toString())) {
      return res
        .status(400)
        .json({ message: "User is already a member of this club" });
    }

    // Prevent adding admins or club leaders to clubs
    if (userToAdd.role === "admin") {
      return res
        .status(400)
        .json({ message: "Admins cannot be added as club members" });
    }

    if (userToAdd.role === "club_leader") {
      return res.status(400).json({
        message: "Club leaders of other clubs cannot be added as members",
      });
    }

    // Update user role if needed
    if (userToAdd.role === "student") {
      userToAdd.role = "club_member";
      await userToAdd.save();
    }

    club.members.push(userToAdd._id);
    // Audit event
    (club as any).membershipEvents = (club as any).membershipEvents || [];
    (club as any).membershipEvents.push({
      action: "added",
      user: userToAdd._id,
      by: req.user?._id,
      at: new Date(),
    });
    await club.save();

    // Trigger notification BEFORE populating (to get raw ObjectIds)
    await triggerClubJoinedNotification(
      String((club as any)._id),
      String(userToAdd._id),
      club.members.map((m) => String(m))
    );

    res.json({
      message: "Member added successfully",
      club: await club.populate(["members", "createdBy"]),
    });
  } catch (error) {
    console.error("Add member error:", error);
    res.status(500).json({ message: "Error adding member" });
  }
};

// Remove member from club (Club members only)
export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const memberId = (req.params as any).memberId || (req.body as any).memberId;
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    const userId = req.user?._id as string;
    const isAdmin = req.user?.role === "admin";
    const isClubLeader =
      (club as any).clubLeader.toString() === userId.toString();

    // Check if user is club leader or admin
    if (!isAdmin && !isClubLeader) {
      return res
        .status(403)
        .json({ message: "Only club leader or admin can remove members" });
    }

    // Prevent removing the club leader
    if ((club as any).clubLeader.toString() === memberId) {
      return res.status(400).json({
        message: "Cannot remove the club leader. Transfer leadership first.",
      });
    }

    // Prevent removing the last member
    if (club.members.length === 1) {
      return res
        .status(400)
        .json({ message: "Cannot remove the last member of the club" });
    }

    club.members = club.members.filter((id: any) => id.toString() !== memberId);
    // Audit event
    (club as any).membershipEvents = (club as any).membershipEvents || [];
    (club as any).membershipEvents.push({
      action: "removed",
      user: memberId,
      by: req.user?._id,
      at: new Date(),
    });
    await club.save();

    // Trigger notification BEFORE populating (to get raw ObjectIds)
    await triggerClubLeftNotification(
      String((club as any)._id),
      String(memberId),
      club.members.map((m) => String(m))
    );

    res.json({
      message: "Member removed successfully",
      club: await club.populate(["members", "createdBy"]),
    });
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({ message: "Error removing member" });
  }
};
