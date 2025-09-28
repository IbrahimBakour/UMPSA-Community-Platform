// src/controllers/clubs.ts

import { Request, Response } from 'express';
import Club from '../models/Club';
import User from '../models/User';

// Create a new club
export const createClub = async (req: Request, res: Response) => {
    try {
        const { name, about, contactInfo, banner, profilePicture, initialMembers } = req.body;

        const club = new Club({
            name,
            about,
            contactInfo,
            banner,
            profilePicture,
            createdBy: req.user.id,
        });

        const savedClub = await club.save();

        // Update initial members
        if (initialMembers && initialMembers.length > 0) {
            await User.updateMany(
                { studentId: { $in: initialMembers } },
                { $addToSet: { clubs: savedClub._id, role: 'clubMember' } }
            );
        }

        res.status(201).json(savedClub);
    } catch (error) {
        res.status(500).json({ message: 'Error creating club', error });
    }
};

// Get all clubs
export const getClubs = async (req: Request, res: Response) => {
    try {
        const clubs = await Club.find().populate('members', 'nickname');
        res.status(200).json(clubs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching clubs', error });
    }
};

// Get club by ID
export const getClubById = async (req: Request, res: Response) => {
    try {
        const club = await Club.findById(req.params.id).populate('members', 'nickname');
        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }
        res.status(200).json(club);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching club', error });
    }
};

// Update club details
export const updateClub = async (req: Request, res: Response) => {
    try {
        const { name, about, contactInfo, banner, profilePicture } = req.body;

        const updatedClub = await Club.findByIdAndUpdate(
            req.params.id,
            { name, about, contactInfo, banner, profilePicture },
            { new: true }
        );

        if (!updatedClub) {
            return res.status(404).json({ message: 'Club not found' });
        }

        res.status(200).json(updatedClub);
    } catch (error) {
        res.status(500).json({ message: 'Error updating club', error });
    }
};

// Add a member to a club
export const addMember = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        const club = await Club.findById(req.params.id);
        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }

        if (!club.members.includes(userId)) {
            club.members.push(userId);
            await club.save();
            await User.findByIdAndUpdate(userId, { $addToSet: { clubs: club._id, role: 'clubMember' } });
        }

        res.status(200).json(club);
    } catch (error) {
        res.status(500).json({ message: 'Error adding member', error });
    }
};

// Remove a member from a club
export const removeMember = async (req: Request, res: Response) => {
    try {
        const club = await Club.findById(req.params.id);
        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }

        if (club.members.includes(req.params.userId)) {
            club.members.pull(req.params.userId);
            await club.save();
            await User.findByIdAndUpdate(req.params.userId, { $pull: { clubs: club._id } });
        }

        res.status(200).json(club);
    } catch (error) {
        res.status(500).json({ message: 'Error removing member', error });
    }
};

// Delete a club
export const deleteClub = async (req: Request, res: Response) => {
    try {
        const club = await Club.findByIdAndDelete(req.params.id);
        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }

        await User.updateMany({ clubs: club._id }, { $pull: { clubs: club._id } });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting club', error });
    }
};