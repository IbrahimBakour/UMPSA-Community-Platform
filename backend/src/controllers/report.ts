import { Request, Response } from "express";
import Report from "../models/Report";
import User from "../models/User";
import { IUser } from "../models/User";
import { triggerReportSubmittedNotification, triggerReportResolvedNotification, triggerUserRestrictedNotification, triggerUserUnrestrictedNotification } from "../services/notificationTriggers";

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

    // Get all admin users to notify them
    const admins = await User.find({ role: "admin" }).select("_id");
    const adminIds = admins.map(admin => String(admin._id));

    // Trigger notification to all admins
    if (adminIds.length > 0) {
      await triggerReportSubmittedNotification(String(report._id), String(userId), adminIds);
    }

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

    // Trigger notification when report is resolved
    if (status === "resolved") {
      await triggerReportResolvedNotification(String(report._id), String(report.reportedBy), String(req.user._id));
    }

    res.json({ message: "Report updated", report });
  } catch (error) {
    console.error("Update report error:", error);
    res.status(500).json({ message: "Error updating report" });
  }
};

// Restrict a user from a report (admin only)
export const restrictUserFromReport = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const { id } = req.params; // report id
    const { restriction } = req.body as {
      restriction: { type: "temporary" | "permanent"; until?: Date };
    };

    if (!restriction?.type) {
      return res.status(400).json({ message: "restriction.type is required" });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.targetType !== "user") {
      return res.status(400).json({ message: "Report target is not a user" });
    }

    const userId = report.targetId.toString();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.status = "restricted";
    user.restriction = {
      type: restriction.type,
      ...(restriction.until ? { until: new Date(restriction.until) } : {}),
    } as any;
    await user.save();

    // Trigger notification BEFORE saving report
    await triggerUserRestrictedNotification(
      userId, 
      String((req.user as any)!._id), 
      restriction.type,
      restriction.until ? `until ${new Date(restriction.until).toISOString()}` : undefined
    );

    report.status = "reviewed";
    report.reviewedBy = req.user._id;
    report.reviewNotes = `Restricted user ${userId} (${restriction.type}${
      restriction.until ? ` until ${new Date(restriction.until).toISOString()}` : ""
    })`;
    await report.save();

    res.json({
      message: "User restricted successfully",
      user: {
        _id: user._id,
        status: user.status,
        restriction: user.restriction,
      },
      report,
    });
  } catch (error) {
    console.error("Restrict user error:", error);
    res.status(500).json({ message: "Error restricting user" });
  }
};

// Unrestrict a user from a report (admin only)
export const unrestrictUserFromReport = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const { id } = req.params; // report id

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.targetType !== "user") {
      return res.status(400).json({ message: "Report target is not a user" });
    }

    const userId = report.targetId.toString();
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.status = "active";
    user.restriction = undefined as any;
    await user.save();

    // Trigger notification BEFORE saving report
    await triggerUserUnrestrictedNotification(userId, String((req.user as any)!._id));

    report.status = "reviewed";
    report.reviewedBy = req.user._id;
    report.reviewNotes = `Unrestricted user ${userId}`;
    await report.save();

    res.json({
      message: "User unrestricted successfully",
      user: {
        _id: user._id,
        status: user.status,
        restriction: user.restriction,
      },
      report,
    });
  } catch (error) {
    console.error("Unrestrict user error:", error);
    res.status(500).json({ message: "Error unrestricting user" });
  }
};
