import { Request, Response } from "express";
import mongoose from "mongoose";
import Post from "../models/Post";
import Club from "../models/Club";
import { IUser } from "../models/User";
import { validateAndCreatePollData } from "./poll";

interface AuthRequest extends Request {
  user?: IUser;
}

interface PaginationQuery {
  page?: string;
  limit?: string;
}

// Create a new club post
export const createClubPost = async (req: AuthRequest, res: Response) => {
  try {
    const {
      content,
      media,
      poll,
      calendarEvent,
      link,
    } = req.body;
    const { clubId } = req.params;
    const userId = req.user?._id;

    if (!content?.trim()) {
      return res.status(400).json({
        message: "Post content is required",
      });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    if (!club.isMember(userId?.toString() || "")) {
      return res.status(403).json({
        message: "Only club members can create posts",
      });
    }

    const postData: any = {
      content: content.trim(),
      postType: "club",
      club: clubId,
      author: userId,
      status: "approved", // Club posts are immediately approved
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
      { path: "club", select: "name" },
    ]);

    res.status(201).json({
      message: "Club post created successfully",
      post,
    });
  } catch (error) {
    console.error("Create club post error:", error);
    res.status(500).json({ message: "Error creating club post" });
  }
};

// Get all posts for a club
export const getClubPosts = async (
  req: AuthRequest & { query: PaginationQuery },
  res: Response
) => {
  try {
    const { clubId } = req.params;
    const userId = req.user?._id;
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "10");
    const skip = (page - 1) * limit;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    // Only get approved club posts
    const query = {
      club: clubId,
      postType: "club",
      status: "approved",
    };
    
    const [posts, total] = await Promise.all([
      Post.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate([
          { path: "author", select: "studentId nickname profilePicture" },
          { path: "club", select: "name" },
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
    console.error("Get club posts error:", error);
    res.status(500).json({ message: "Error fetching club posts" });
  }
};

// Get a single post
export const getPost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const post = await Post.findById(id).populate([
      { path: "author", select: "studentId nickname profilePicture" },
      { path: "club", select: "name" },
      { path: "comments.author", select: "studentId nickname profilePicture" },
      { path: "interactions.user", select: "studentId nickname profilePicture" },
    ]);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if post is approved
    if (post.status !== "approved") {
      return res.status(404).json({ message: "Post not found" });
    }

    // For club posts, check if user has access
    if (post.postType === "club" && post.club) {
      const club = await Club.findById(post.club);
      if (!club) {
        return res.status(404).json({ message: "Club not found" });
      }
    }

    await post.addView();
    res.json(post);
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ message: "Error fetching post" });
  }
};

// Update a post
export const updatePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content, media, poll, calendarEvent, link } = req.body;
    const userId = req.user?._id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (
      (post.author as mongoose.Types.ObjectId).toString() !== userId?.toString()
    ) {
      return res.status(403).json({
        message: "Only the author can update this post",
      });
    }

    const updateData: any = {};
    if (content !== undefined) updateData.content = content;
    if (media !== undefined) updateData.media = media;
    if (poll !== undefined) updateData.poll = poll;
    if (calendarEvent !== undefined) updateData.calendarEvent = calendarEvent;
    if (link !== undefined) updateData.link = link;

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate([
      { path: "author", select: "studentId nickname profilePicture" },
      { path: "club", select: "name" },
    ]);

    res.json({
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ message: "Error updating post" });
  }
};

// Delete a post
export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (
      (post.author as mongoose.Types.ObjectId).toString() !==
        userId?.toString() &&
      userRole !== "admin"
    ) {
      return res.status(403).json({
        message: "Only the author or admin can delete this post",
      });
    }

    await Post.deleteOne({ _id: id });
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: "Error deleting post" });
  }
};

// Add/Update/Remove reaction to a post
export const addReaction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reactionType } = req.body;
    const userId = req.user?._id;

    if (!reactionType) {
      return res.status(400).json({
        message: "Reaction type is required",
      });
    }

    const allowedReactions = ["like", "love", "dislike", "laugh"];
    if (!allowedReactions.includes(reactionType)) {
      return res.status(400).json({
        message: "Invalid reaction type. Allowed: like, love, dislike, laugh",
      });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if post is approved
    if (post.status !== "approved") {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user has already reacted
    const hasReacted = post.hasReacted(userId?.toString() || "");
    const currentReactionType = post.getReactionType(userId?.toString() || "");

    if (hasReacted && currentReactionType === reactionType) {
      // Remove reaction if same type
      await post.removeReaction(userId?.toString() || "");
      res.json({
        message: "Reaction removed",
        reactionType: null,
        reactionCounts: (post as any).reactionCounts,
        totalReactions: (post as any).totalReactions,
      });
    } else {
      // Add or update reaction
      await post.addReaction(userId?.toString() || "", reactionType);
      res.json({
        message: "Reaction added",
        reactionType,
        reactionCounts: (post as any).reactionCounts,
        totalReactions: (post as any).totalReactions,
      });
    }
  } catch (error) {
    console.error("Add reaction error:", error);
    res.status(500).json({ message: "Error adding reaction" });
  }
};

// Get post reactions
export const getPostReactions = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id).populate([
      { path: "interactions.user", select: "studentId nickname profilePicture" },
    ]);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({
      reactions: post.interactions,
      reactionCounts: (post as any).reactionCounts,
      totalReactions: (post as any).totalReactions,
    });
  } catch (error) {
    console.error("Get reactions error:", error);
    res.status(500).json({ message: "Error fetching reactions" });
  }
};

// Add a comment to a post
export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?._id;

    if (!content?.trim()) {
      return res.status(400).json({
        message: "Comment content is required",
      });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if post is approved
    if (post.status !== "approved") {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = {
      content,
      author: userId,
    };

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $push: { comments: comment } },
      {
        new: true,
        populate: [
          {
            path: "comments.author",
            select: "studentId nickname profilePicture",
          },
        ],
      }
    );

    res.json({
      message: "Comment added successfully",
      comment: updatedPost?.comments[updatedPost.comments.length - 1],
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ message: "Error adding comment" });
  }
};

// Edit a comment
export const editComment = async (req: AuthRequest, res: Response) => {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    const userId = req.user?._id;

    if (!content?.trim()) {
      return res.status(400).json({
        message: "Comment content is required",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.find(
      (c: any) => c._id.toString() === commentId
    );
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the comment author
    if (
      (comment.author as mongoose.Types.ObjectId).toString() !==
      userId?.toString()
    ) {
      return res.status(403).json({
        message: "Only the comment author can edit this comment",
      });
    }

    comment.content = content;
    await post.save();

    await post.populate({
      path: "comments.author",
      select: "studentId nickname profilePicture",
    });

    res.json({
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    console.error("Edit comment error:", error);
    res.status(500).json({ message: "Error updating comment" });
  }
};

// Delete a comment
export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.find(
      (c: any) => c._id.toString() === commentId
    );
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Allow deletion by comment author, post author, or admin
    const isAuthorized =
      (comment.author as mongoose.Types.ObjectId).toString() ===
        userId?.toString() ||
      (post.author as mongoose.Types.ObjectId).toString() ===
        userId?.toString() ||
      userRole === "admin";

    if (!isAuthorized) {
      return res.status(403).json({
        message: "You are not authorized to delete this comment",
      });
    }

    post.comments = post.comments.filter(
      (c: any) => c._id.toString() !== commentId
    );
    await post.save();

    res.json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ message: "Error deleting comment" });
  }
};

// Get comments for a post
export const getComments = async (
  req: AuthRequest & { query: PaginationQuery },
  res: Response
) => {
  try {
    const { postId } = req.params;
    const userId = req.user?._id;
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "10");

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if post is approved
    if (post.status !== "approved") {
      return res.status(404).json({ message: "Post not found" });
    }

    // Get paginated comments
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const totalComments = post.comments.length;

    const paginatedComments = post.comments
      .slice(startIndex, endIndex)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    await Post.populate(paginatedComments, {
      path: "author",
      select: "studentId nickname profilePicture",
    });

    res.json({
      comments: paginatedComments,
      totalPages: Math.ceil(totalComments / limit),
      currentPage: page,
      totalComments,
    });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: "Error fetching comments" });
  }
};
