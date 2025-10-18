import { Request, Response } from "express";
import Notification from "../models/Notification";
import User from "../models/User";
import Post from "../models/Post";
import Club from "../models/Club";
import { IUser } from "../models/User";
import { INotification, NotificationType, NotificationPriority } from "../models/Notification";

interface AuthRequest extends Request {
  user?: IUser;
}

interface PaginationQuery {
  page?: string;
  limit?: string;
}

// Get user's notifications
export const getUserNotifications = async (
  req: AuthRequest & { query: PaginationQuery & { 
    type?: string; 
    priority?: string; 
    unreadOnly?: string;
    sortBy?: string;
    sortOrder?: string;
  }},
  res: Response
) => {
  try {
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "20");
    const skip = (page - 1) * limit;
    const { type, priority, unreadOnly, sortBy = "createdAt", sortOrder = "desc" } = req.query;

    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Build query
    const query: any = { 
      $or: [
        { recipient: userId },
        { recipients: userId }
      ]
    };

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by priority
    if (priority) {
      query.priority = priority;
    }

    // Filter unread only
    if (unreadOnly === "true") {
      query.isRead = false;
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .populate("relatedPost", "content postType")
        .populate("relatedClub", "name")
        .populate("relatedUser", "studentId nickname profilePicture")
        .populate("relatedReport", "targetType reason")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(query),
      Notification.countDocuments({ ...query, isRead: false }),
    ]);

    res.json({
      notifications,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalNotifications: total,
        unreadCount,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get user notifications error:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Check if user is the recipient
    const isRecipient = String(notification.recipient) === String(userId) ||
      (notification.recipients && notification.recipients.some(r => String(r) === String(userId)));

    if (!isRecipient) {
      return res.status(403).json({ message: "Not authorized to read this notification" });
    }

    await notification.markAsRead();

    res.json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({ message: "Error marking notification as read" });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const result = await Notification.updateMany(
      {
        $or: [
          { recipient: userId },
          { recipients: userId }
        ],
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      }
    );

    res.json({
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    res.status(500).json({ message: "Error marking all notifications as read" });
  }
};

// Delete notification
export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Check if user is the recipient
    const isRecipient = String(notification.recipient) === String(userId) ||
      (notification.recipients && notification.recipients.some(r => String(r) === String(userId)));

    if (!isRecipient) {
      return res.status(403).json({ message: "Not authorized to delete this notification" });
    }

    await Notification.findByIdAndDelete(notificationId);

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ message: "Error deleting notification" });
  }
};

// Get notification statistics
export const getNotificationStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const query = {
      $or: [
        { recipient: userId },
        { recipients: userId }
      ]
    };

    const [
      totalNotifications,
      unreadNotifications,
      notificationsByType,
      notificationsByPriority,
      recentNotifications
    ] = await Promise.all([
      Notification.countDocuments(query),
      Notification.countDocuments({ ...query, isRead: false }),
      Notification.aggregate([
        { $match: query },
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Notification.aggregate([
        { $match: query },
        { $group: { _id: "$priority", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("relatedUser", "studentId nickname profilePicture")
    ]);

    res.json({
      totalNotifications,
      unreadNotifications,
      notificationsByType,
      notificationsByPriority,
      recentNotifications,
    });
  } catch (error) {
    console.error("Get notification stats error:", error);
    res.status(500).json({ message: "Error fetching notification statistics" });
  }
};

// Create notification (internal helper function)
export const createNotification = async (
  type: NotificationType,
  title: string,
  message: string,
  recipientId: string,
  options: {
    priority?: NotificationPriority;
    relatedPost?: string;
    relatedClub?: string;
    relatedReport?: string;
    relatedUser?: string;
    recipients?: string[];
    data?: any;
    expiresAt?: Date;
  } = {}
) => {
  try {
    const {
      priority = "medium",
      relatedPost,
      relatedClub,
      relatedReport,
      relatedUser,
      recipients,
      data,
      expiresAt
    } = options;

    const notificationData: any = {
      type,
      title,
      message,
      priority,
      recipient: recipientId,
      data: data || {},
    };

    if (relatedPost) notificationData.relatedPost = relatedPost;
    if (relatedClub) notificationData.relatedClub = relatedClub;
    if (relatedReport) notificationData.relatedReport = relatedReport;
    if (relatedUser) notificationData.relatedUser = relatedUser;
    if (recipients) notificationData.recipients = recipients;
    if (expiresAt) notificationData.expiresAt = expiresAt;

    const notification = new Notification(notificationData);
    await notification.save();

    // Populate related entities for better context
    await notification.populate([
      { path: "relatedPost", select: "content postType" },
      { path: "relatedClub", select: "name" },
      { path: "relatedUser", select: "studentId nickname profilePicture" },
      { path: "relatedReport", select: "targetType reason" }
    ]);

    return notification;
  } catch (error) {
    console.error("Create notification error:", error);
    throw error;
  }
};

// Create bulk notifications
export const createBulkNotifications = async (
  type: NotificationType,
  title: string,
  message: string,
  recipientIds: string[],
  options: {
    priority?: NotificationPriority;
    relatedPost?: string;
    relatedClub?: string;
    relatedReport?: string;
    relatedUser?: string;
    data?: any;
    expiresAt?: Date;
  } = {}
) => {
  try {
    const {
      priority = "medium",
      relatedPost,
      relatedClub,
      relatedReport,
      relatedUser,
      data,
      expiresAt
    } = options;

    const notifications = recipientIds.map(recipientId => ({
      type,
      title,
      message,
      priority,
      recipient: recipientId,
      relatedPost,
      relatedClub,
      relatedReport,
      relatedUser,
      data: data || {},
      expiresAt,
      isRead: false,
      isDelivered: false,
    }));

    const createdNotifications = await Notification.insertMany(notifications);
    return createdNotifications;
  } catch (error) {
    console.error("Create bulk notifications error:", error);
    throw error;
  }
};

// Clean up expired notifications (admin only)
export const cleanupExpiredNotifications = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const result = await Notification.deleteMany({
      expiresAt: { $lt: new Date() }
    });

    res.json({
      message: "Expired notifications cleaned up",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Cleanup expired notifications error:", error);
    res.status(500).json({ message: "Error cleaning up expired notifications" });
  }
};

// Get notification analytics (admin only)
export const getNotificationAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const days = parseInt((req.query.days as string) || "30");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalNotifications,
      notificationsByType,
      notificationsByPriority,
      readRate,
      deliveryRate,
      recentActivity
    ] = await Promise.all([
      Notification.countDocuments({ createdAt: { $gte: startDate } }),
      Notification.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Notification.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: "$priority", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Notification.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            read: { $sum: { $cond: ["$isRead", 1, 0] } }
          }
        }
      ]),
      Notification.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            delivered: { $sum: { $cond: ["$isDelivered", 1, 0] } }
          }
        }
      ]),
      Notification.find({ createdAt: { $gte: startDate } })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("recipient", "studentId nickname")
        .populate("relatedUser", "studentId nickname")
    ]);

    const readRateData = readRate[0] || { total: 0, read: 0 };
    const deliveryRateData = deliveryRate[0] || { total: 0, delivered: 0 };

    res.json({
      period: {
        days,
        startDate,
        endDate: new Date()
      },
      overview: {
        totalNotifications,
        readRate: readRateData.total > 0 ? (readRateData.read / readRateData.total * 100).toFixed(1) : "0",
        deliveryRate: deliveryRateData.total > 0 ? (deliveryRateData.delivered / deliveryRateData.total * 100).toFixed(1) : "0"
      },
      breakdown: {
        byType: notificationsByType,
        byPriority: notificationsByPriority
      },
      recentActivity
    });
  } catch (error) {
    console.error("Get notification analytics error:", error);
    res.status(500).json({ message: "Error fetching notification analytics" });
  }
};
