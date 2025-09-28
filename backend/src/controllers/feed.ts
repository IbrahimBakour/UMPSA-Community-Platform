// src/controllers/feed.ts

import { Request, Response } from 'express';
import FeedPost from '../models/FeedPost';
import { checkNotRestricted } from '../middleware/checkNotRestricted';

// Create a new feed post
export const createFeedPost = async (req: Request, res: Response) => {
    try {
        const { content, media, type } = req.body;
        const newPost = new FeedPost({
            author: req.user.id,
            content,
            media,
            type,
            status: 'pending',
        });
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ message: 'Error creating post', error });
    }
};

// Approve a feed post
export const approveFeedPost = async (req: Request, res: Response) => {
    try {
        const postId = req.params.id;
        const post = await FeedPost.findByIdAndUpdate(postId, { status: 'approved' }, { new: true });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error approving post', error });
    }
};

// Reject a feed post
export const rejectFeedPost = async (req: Request, res: Response) => {
    try {
        const postId = req.params.id;
        const post = await FeedPost.findByIdAndUpdate(postId, { status: 'rejected' }, { new: true });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting post', error });
    }
};

// Delete a feed post
export const deleteFeedPost = async (req: Request, res: Response) => {
    try {
        const postId = req.params.id;
        const post = await FeedPost.findByIdAndDelete(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting post', error });
    }
};

// Get approved feed posts
export const getApprovedFeedPosts = async (req: Request, res: Response) => {
    try {
        const posts = await FeedPost.find({ status: 'approved' }).populate('author', 'nickname');
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error });
    }
};

// Get pending feed posts (admin only)
export const getPendingFeedPosts = async (req: Request, res: Response) => {
    try {
        const posts = await FeedPost.find({ status: 'pending' }).populate('author', 'nickname');
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending posts', error });
    }
};