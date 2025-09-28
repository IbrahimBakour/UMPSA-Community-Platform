// This file contains controller functions for managing comments on posts, including creating and deleting comments.

import { Request, Response } from 'express';
import Comment from '../models/Comment';
import FeedPost from '../models/FeedPost';
import ClubPost from '../models/ClubPost';

// Create a comment on a post
export const createComment = async (req: Request, res: Response) => {
    const { postId, postType, content, media } = req.body;
    const author = req.user.id; // Assuming user ID is stored in req.user

    try {
        const newComment = new Comment({
            postId,
            postType,
            author,
            content,
            media,
        });

        await newComment.save();

        // Optionally, you can push the comment ID to the respective post's comments array
        if (postType === 'feed') {
            await FeedPost.findByIdAndUpdate(postId, { $push: { comments: newComment._id } });
        } else if (postType === 'club') {
            await ClubPost.findByIdAndUpdate(postId, { $push: { comments: newComment._id } });
        }

        return res.status(201).json(newComment);
    } catch (error) {
        return res.status(500).json({ message: 'Error creating comment', error });
    }
};

// Get comments for a post
export const getComments = async (req: Request, res: Response) => {
    const { postId, postType } = req.params;

    try {
        const comments = await Comment.find({ postId, postType }).populate('author', 'nickname profilePicture');
        return res.status(200).json(comments);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching comments', error });
    }
};

// Delete a comment
export const deleteComment = async (req: Request, res: Response) => {
    const { commentId } = req.params;

    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Ensure only the author or an admin can delete the comment
        if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        await comment.remove();
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting comment', error });
    }
};