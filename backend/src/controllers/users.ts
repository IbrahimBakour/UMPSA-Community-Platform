// src/controllers/users.ts

import { Request, Response } from 'express';
import User from '../models/User';

// Get all users (admin only)
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find().populate('clubs');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error });
    }
};

// Get a user by ID
export const getUserById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id).populate('clubs');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user', error });
    }
};

// Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nickname, profilePicture } = req.body;

    try {
        const user = await User.findByIdAndUpdate(id, { nickname, profilePicture }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error });
    }
};

// Promote user to admin
export const promoteToAdmin = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const user = await User.findByIdAndUpdate(id, { role: 'admin' }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error promoting user', error });
    }
};

// Assign user to club
export const assignClub = async (req: Request, res: Response) => {
    const { id, clubId } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.clubs.push(clubId);
        user.role = 'clubMember';
        await user.save();

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error assigning club', error });
    }
};

// Remove user from club
export const removeClub = async (req: Request, res: Response) => {
    const { id, clubId } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.clubs = user.clubs.filter(club => club.toString() !== clubId);
        if (user.clubs.length === 0 && user.role === 'clubMember') {
            user.role = 'student';
        }
        await user.save();

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error removing club', error });
    }
};

// Restrict user
export const restrictUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { reason, restrictedUntil } = req.body;

    try {
        const user = await User.findByIdAndUpdate(id, { restriction: { status: true, reason, restrictedUntil } }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error restricting user', error });
    }
};

// Unrestrict user
export const unrestrictUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const user = await User.findByIdAndUpdate(id, { restriction: { status: false, reason: null, restrictedUntil: null } }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error unrestricting user', error });
    }
};