// src/controllers/auth.ts

import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response) => {
    const { studentId, password } = req.body;

    try {
        const user = await User.findOne({ studentId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET!, {
            expiresIn: process.env.JWT_EXPIRE || '7d',
        });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const verifyToken = (req: Request, res: Response) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        res.json({ userId: decoded.userId, role: decoded.role });
    });
};