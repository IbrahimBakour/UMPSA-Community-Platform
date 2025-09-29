import { Request, Response } from "express";
import Report from "../models/Report";
import { IUser } from "../models/User";

interface AuthRequest extends Request {
  user?: IUser;
}

// Create a new report (any user)
export const createReport = async (req: AuthRequest, res: Response) => {
  try {
    const { targetType, targetId, reason } = req.body;
    const userId = req.user?._id;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const report = new Report({
      reportedBy: userId,
      targetType,
      targetId,
      reason,
      status: "pending",
    });
    await report.save();
    res.status(201).json({ message: "Report submitted", report });
  } catch (error) {
    console.error("Create report error:", error);
    res.status(500).json({ message: "Error submitting report" });
  }
};

// List all reports (admin only)
export const listReports = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }
    const reports = await Report.find()
      .populate("reportedBy", "studentId nickname")
      .populate("reviewedBy", "studentId nickname")
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    console.error("List reports error:", error);
    res.status(500).json({ message: "Error fetching reports" });
  }
};

// Get a single report (admin only)
export const getReport = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }
    const report = await Report.findById(req.params.id)
      .populate("reportedBy", "studentId nickname")
      .populate("reviewedBy", "studentId nickname");
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.json(report);
  } catch (error) {
    console.error("Get report error:", error);
    res.status(500).json({ message: "Error fetching report" });
  }
};

// Update a report (admin only)
export const updateReport = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }
    const { status, reviewNotes } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    if (status) report.status = status;
    if (reviewNotes) report.reviewNotes = reviewNotes;
    report.reviewedBy = req.user._id;
    await report.save();
    res.json({ message: "Report updated", report });
  } catch (error) {
    console.error("Update report error:", error);
    res.status(500).json({ message: "Error updating report" });
  }
};
