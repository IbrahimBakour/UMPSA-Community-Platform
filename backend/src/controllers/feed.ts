import { Request, Response } from "express";
import mongoose from "mongoose";
import Post from "../models/Post";
import { IUser } from "../models/User";
import { validateAndCreatePollData } from "./poll";

interface AuthRequest extends Request {
  user?: IUser;
}

interface PaginationQuery {
  page?: string;
  limit?: string;
}

// Get approved feed posts (global posts)
export const getFeedPosts = async (
  req: AuthRequest & { query: PaginationQuery },
  res: Response
) => {
  try {
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "10");
    const skip = (page - 1) * limit;

    // Get approved feed posts only
    const query = {
      postType: "feed",
      status: "approved",
    };

    const [posts, total] = await Promise.all([
      Post.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate([
          { path: "author", select: "studentId nickname profilePicture" },
          { path: "interactions.user", select: "studentId nickname profilePicture" },
        ]),
      Post.countDocuments(query),
    ]);

    res.json({
      posts,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalPosts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get feed posts error:", error);
    res.status(500).json({ message: "Error fetching feed posts" });
  }
};

// Create a new feed post
export const createFeedPost = async (req: AuthRequest, res: Response) => {
  try {
    const {
      content,
      media,
      poll,
      calendarEvent,
      link,
    } = req.body;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!content?.trim()) {
      return res.status(400).json({
        message: "Post content is required",
      });
    }

    // Determine post status based on user role
    let status: "pending" | "approved" = "pending";
    if (userRole === "admin") {
      status = "approved";
    }

    const postData: any = {
      content: content.trim(),
      postType: "feed",
      author: userId,
      status,
      media: media || [],
    };

    // Add optional features
    if (poll) {
      try {
        postData.poll = validateAndCreatePollData(poll);
      } catch (error) {
        return res.status(400).json({ 
          message: error instanceof Error ? error.message : "Invalid poll data" 
        });
      }
    }

    if (calendarEvent) {
      postData.calendarEvent = {
        title: calendarEvent.title?.trim(),
        date: new Date(calendarEvent.date),
      };
    }

    if (link) {
      postData.link = link.trim();
    }

    const post = new Post(postData);
    await post.save();

    await post.populate([
      { path: "author", select: "studentId nickname profilePicture" },
    ]);

    const message = status === "approved" 
      ? "Post created and published successfully" 
      : "Post created and submitted for review";

    res.status(201).json({
      message,
      post,
      status,
    });
  } catch (error) {
    console.error("Create feed post error:", error);
    res.status(500).json({ message: "Error creating feed post" });
  }
};

// Get pending feed posts (admin only)
export const getPendingFeedPosts = async (
  req: AuthRequest & { query: PaginationQuery },
  res: Response
) => {
  try {
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "10");
    const skip = (page - 1) * limit;

    const query = {
      postType: "feed",
      status: "pending",
    };

    const [posts, total] = await Promise.all([
      Post.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate([
          { path: "author", select: "studentId nickname profilePicture" },
        ]),
      Post.countDocuments(query),
    ]);

    res.json({
      posts,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalPosts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get pending posts error:", error);
    res.status(500).json({ message: "Error fetching pending posts" });
  }
};

// Approve a feed post (admin only)
export const approveFeedPost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const post = await Post.findOne({
      _id: id,
      postType: "feed",
      status: "pending",
    });

    if (!post) {
      return res.status(404).json({
        message: "Pending feed post not found",
      });
    }

    post.status = "approved";
    await post.save();

    await post.populate([
      { path: "author", select: "studentId nickname profilePicture" },
    ]);

    res.json({
      message: "Post approved successfully",
      post,
    });
  } catch (error) {
    console.error("Approve post error:", error);
    res.status(500).json({ message: "Error approving post" });
  }
};

// Reject a feed post (admin only)
export const rejectFeedPost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const post = await Post.findOne({
      _id: id,
      postType: "feed",
      status: "pending",
    });

    if (!post) {
      return res.status(404).json({
        message: "Pending feed post not found",
      });
    }

    post.status = "rejected";
    await post.save();

    res.json({
      message: "Post rejected successfully",
      reason: reason || "No reason provided",
    });
  } catch (error) {
    console.error("Reject post error:", error);
    res.status(500).json({ message: "Error rejecting post" });
  }
};

// Delete a feed post (admin only)
export const deleteFeedPost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const post = await Post.findOne({
      _id: id,
      postType: "feed",
    });

    if (!post) {
      return res.status(404).json({
        message: "Feed post not found",
      });
    }

    await Post.deleteOne({ _id: id });

    res.json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete feed post error:", error);
    res.status(500).json({ message: "Error deleting post" });
  }
};

// Get a single feed post
export const getFeedPost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const post = await Post.findOne({
      _id: id,
      postType: "feed",
      status: "approved",
    }).populate([
      { path: "author", select: "studentId nickname profilePicture" },
      { path: "interactions.user", select: "studentId nickname profilePicture" },
      { path: "comments.author", select: "studentId nickname profilePicture" },
    ]);

    if (!post) {
      return res.status(404).json({
        message: "Feed post not found",
      });
    }

    res.json(post);
  } catch (error) {
    console.error("Get feed post error:", error);
    res.status(500).json({ message: "Error fetching feed post" });
  }
};

// Get feed post statistics (admin only)
export const getFeedStats = async (req: AuthRequest, res: Response) => {
  try {
    const [totalPosts, approvedPosts, pendingPosts, rejectedPosts] = await Promise.all([
      Post.countDocuments({ postType: "feed" }),
      Post.countDocuments({ postType: "feed", status: "approved" }),
      Post.countDocuments({ postType: "feed", status: "pending" }),
      Post.countDocuments({ postType: "feed", status: "rejected" }),
    ]);

    res.json({
      totalPosts,
      approvedPosts,
      pendingPosts,
      rejectedPosts,
    });
  } catch (error) {
    console.error("Get feed stats error:", error);
    res.status(500).json({ message: "Error fetching feed statistics" });
  }
};
