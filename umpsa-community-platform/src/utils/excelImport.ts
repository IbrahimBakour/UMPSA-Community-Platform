import * as XLSX from 'xlsx';
import { User } from '../models/User';

export const importUsersFromExcel = async (file: Express.Multer.File) => {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    const createdUsers = [];
    const updatedUsers = [];
    const errors = [];

    for (const row of data) {
        const { studentId, nickname, email } = row;

        if (!studentId) {
            errors.push(`Missing studentId in row: ${JSON.stringify(row)}`);
            continue;
        }

        try {
            const existingUser = await User.findOne({ studentId });

            if (existingUser) {
                existingUser.nickname = nickname || existingUser.nickname;
                existingUser.email = email || existingUser.email;
                await existingUser.save();
                updatedUsers.push(existingUser);
            } else {
                const newUser = new User({ studentId, nickname, email });
                await newUser.save();
                createdUsers.push(newUser);
            }
        } catch (error) {
            errors.push(`Error processing row: ${JSON.stringify(row)} - ${error.message}`);
        }
    }

    return { created: createdUsers.length, updated: updatedUsers.length, errors };
};