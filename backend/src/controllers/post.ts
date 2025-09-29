import { Request, Response } from "express";
import mongoose from "mongoose";
import Post from "../models/Post";
import Club from "../models/Club";
import { IUser } from "../models/User";

interface AuthRequest extends Request {
  user?: IUser;
}

interface PaginationQuery {
  page?: string;
  limit?: string;
}

// Create a new post
export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, clubId, visibility, images } = req.body;
    const userId = req.user?._id;

    if (!title || !content || !clubId) {
      return res.status(400).json({
        message: "Title, content and club ID are required",
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

    const post = new Post({
      title,
      content,
      club: clubId,
      author: userId,
      visibility: visibility || "public",
      images: images || [],
    });

    await post.save();
    await post.populate([
      { path: "author", select: "studentId nickname profilePicture" },
      { path: "club", select: "name" },
    ]);

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Error creating post" });
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

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    const query: mongoose.FilterQuery<typeof Post> = {
      club: clubId,
      status: "active",
    };

    if (!club.isMember(userId?.toString() || "")) {
      query.visibility = "public";
    }

    const [posts, total] = await Promise.all([
      Post.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate([
          { path: "author", select: "studentId nickname profilePicture" },
          { path: "club", select: "name" },
        ]),
      Post.countDocuments(query),
    ]);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalPosts: total,
    });
  } catch (error) {
    console.error("Get club posts error:", error);
    res.status(500).json({ message: "Error fetching posts" });
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
    ]);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.visibility === "members") {
      const club = await Club.findById(post.club);
      if (!club?.isMember(userId?.toString() || "")) {
        return res.status(403).json({
          message: "This post is for club members only",
        });
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
    const { title, content, visibility, images } = req.body;
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

    const updateData: Partial<typeof post> = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (visibility) updateData.visibility = visibility;
    if (images) updateData.images = images;

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

// Like/Unlike a post
export const toggleLike = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.visibility === "members") {
      const club = await Club.findById(post.club);
      if (!club?.isMember(userId?.toString() || "")) {
        return res.status(403).json({
          message: "This post is for club members only",
        });
      }
    }

    const isLiked = post.isLikedBy(userId?.toString() || "");
    const updateOperation = isLiked
      ? { $pull: { likes: userId } }
      : { $addToSet: { likes: userId } };

    const updatedPost = await Post.findByIdAndUpdate(id, updateOperation, {
      new: true,
    });

    res.json({
      message: isLiked ? "Post unliked" : "Post liked",
      likesCount: updatedPost?.likes.length || 0,
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({ message: "Error toggling like" });
  }
};
