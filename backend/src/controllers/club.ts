import { Request, Response } from "express";
import Club from "../models/Club";
import User from "../models/User";
import { IUser } from "../models/User";
import { triggerClubJoinedNotification, triggerClubLeftNotification } from "../services/notificationTriggers";

interface AuthRequest extends Request {
  user?: IUser;
}

// Create a new club (Admin only)
export const createClub = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, about, contact } = req.body;
    const adminId = req.user?._id;

    if (!name) {
      return res.status(400).json({ message: "Club name is required" });
    }

    // Check if club with same name exists
    const existingClub = await Club.findOne({ name });
    if (existingClub) {
      return res
        .status(400)
        .json({ message: "A club with this name already exists" });
    }

    // Update initial member's role if needed
    const initialMemberId = req.body.initialMemberId;
    if (initialMemberId) {
      const userToUpdate = await User.findById(initialMemberId);
      if (userToUpdate && userToUpdate.role === "student") {
        userToUpdate.role = "club_member";
        await userToUpdate.save();
      }
      // Do not change role if admin
    }

    const club = new Club({
      name,
      description,
      about,
      contact,
      members: [initialMemberId], // Initial club member
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

    // Check if user is a club member
    if (!club.isMember(req.user?._id as string)) {
      return res
        .status(403)
        .json({ message: "Only club members can update club details" });
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
    const { memberId } = req.body;
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    // Check if user is a club member
    if (!club.isMember(req.user?._id as string)) {
      return res
        .status(403)
        .json({ message: "Only club members can add new members" });
    }

    // Check if user is already a member
    if (club.isMember(memberId)) {
      return res
        .status(400)
        .json({ message: "User is already a member of this club" });
    }

    // Update user role if needed
    const userToUpdate = await User.findById(memberId);
    if (userToUpdate && userToUpdate.role === "student") {
      userToUpdate.role = "club_member";
      await userToUpdate.save();
    }
    // Do not change role if admin

    club.members.push(memberId);
    // Audit event
    (club as any).membershipEvents = (club as any).membershipEvents || [];
    (club as any).membershipEvents.push({
      action: "added",
      user: memberId,
      by: req.user?._id,
      at: new Date(),
    });
    await club.save();

    // Trigger notification BEFORE populating (to get raw ObjectIds)
    await triggerClubJoinedNotification(String((club as any)._id), String(memberId), club.members.map(m => String(m)));

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

    // Check if user is a club member
    if (!club.isMember(req.user?._id as string)) {
      return res
        .status(403)
        .json({ message: "Only club members can remove members" });
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
    await triggerClubLeftNotification(String((club as any)._id), String(memberId), club.members.map(m => String(m)));

    res.json({
      message: "Member removed successfully",
      club: await club.populate(["members", "createdBy"]),
    });
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({ message: "Error removing member" });
  }
};
