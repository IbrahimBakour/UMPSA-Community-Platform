import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';

const createAdmin = async () => {
    try {
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            console.log('Admin user already exists.');
            return;
        }

        const adminData = {
            studentId: 'admin123',
            passwordHash: await bcrypt.hash('adminPassword', 10),
            role: 'admin',
            nickname: 'Admin User',
            email: 'admin@example.com',
        };

        const adminUser = new User(adminData);
        await adminUser.save();
        console.log('Admin user created successfully.');
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        mongoose.connection.close();
    }
};

createAdmin();