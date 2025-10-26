import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Excel from "exceljs";

export const login = async (req: Request, res: Response) => {
  try {
    const { studentId, password } = req.body;

    // Validate input
    if (!studentId || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find user
    const user = await User.findOne({ studentId });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user is restricted
    if (user.status === "restricted") {
      return res.status(403).json({
        message: "Account is restricted",
        restriction: user.restriction,
      });
    }

    // Generate JWT token with 24h expiration
    // @ts-ignore - TypeScript type definitions issue with jsonwebtoken 9.x
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: "24h", // 24 hours
    });

    // Log token expiration for debugging
    const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    console.log(`Token generated for user ${user.studentId}. Expires at: ${expirationDate.toISOString()}`);

    res.json({
      token,
      user: {
        id: user._id,
        studentId: user.studentId,
        role: user.role,
        nickname: user.nickname,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const importUsers = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an Excel file" });
    }

    console.log("Processing file:", req.file.path);

    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      return res.status(400).json({ message: "Worksheet not found" });
    }

    const users: any[] = [];
    const errors: string[] = [];

    // Process each row
    const rows = worksheet.getRows(2, worksheet.rowCount - 1) || [];
    for (const row of rows) {
      try {
        const studentId = row.getCell(1).text.trim();
        const password = row.getCell(2).text.trim();

        console.log("Processing user:", studentId);

        if (!studentId || !password) {
          errors.push(`Row ${row.number}: Missing required fields`);
          continue;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ studentId });
        if (existingUser) {
          errors.push(
            `Row ${row.number}: User with studentId ${studentId} already exists`
          );
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        users.push({
          studentId,
          password: hashedPassword,
          role: "student", // Default role
          status: "active",
        });
      } catch (error) {
        errors.push(`Row ${row.number}: Invalid data format`);
      }
    }

    // Insert users

    if (users.length > 0) {
      console.log(`Inserting ${users.length} users`);
      await User.insertMany(users);
    }

    res.json({
      message: `${users.length} users imported successfully`,
      errors: errors.length > 0 ? errors : undefined,
      details: {
        totalProcessed: worksheet.rowCount - 1,
        successful: users.length,
        failed: errors.length,
      },
    });
  } catch (error) {
    console.error("Import users error:", error);
    res.status(500).json({
      message: "Server error during import",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
