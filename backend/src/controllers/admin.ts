import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/User";
import Post from "../models/Post";
import Club from "../models/Club";
import Report from "../models/Report";
import { IUser } from "../models/User";

interface AuthRequest extends Request {
  user?: IUser;
}

interface PaginationQuery {
  page?: string;
  limit?: string;
}

// Get comprehensive admin dashboard statistics
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    // Basic counts
    const [
      totalUsers,
      totalPosts,
      totalClubs,
      totalReports,
      activeUsers,
      restrictedUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Club.countDocuments(),
      Report.countDocuments(),
      User.countDocuments({ status: "active" }),
      User.countDocuments({ status: "restricted" }),
    ]);

    // User role distribution
    const [students, clubMembers, admins] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "club_member" }),
      User.countDocuments({ role: "admin" }),
    ]);

    // Post statistics
    const [feedPosts, clubPosts, approvedPosts, pendingPosts, rejectedPosts] = await Promise.all([
      Post.countDocuments({ postType: "feed" }),
      Post.countDocuments({ postType: "club" }),
      Post.countDocuments({ status: "approved" }),
      Post.countDocuments({ status: "pending" }),
      Post.countDocuments({ status: "rejected" }),
    ]);

    // Report statistics
    const [pendingReports, reviewedReports, resolvedReports] = await Promise.all([
      Report.countDocuments({ status: "pending" }),
      Report.countDocuments({ status: "reviewed" }),
      Report.countDocuments({ status: "resolved" }),
    ]);

    // Recent activity (last 7 days)
    const [
      newUsersThisWeek,
      newPostsThisWeek,
      newReportsThisWeek,
      newClubsThisWeek,
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thisWeek } }),
      Post.countDocuments({ createdAt: { $gte: thisWeek } }),
      Report.countDocuments({ createdAt: { $gte: thisWeek } }),
      Club.countDocuments({ createdAt: { $gte: thisWeek } }),
    ]);

    // Monthly comparison
    const [
      newUsersThisMonth,
      newPostsThisMonth,
      newUsersLastMonth,
      newPostsLastMonth,
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thisMonth } }),
      Post.countDocuments({ createdAt: { $gte: thisMonth } }),
      User.countDocuments({ 
        createdAt: { 
          $gte: lastMonth, 
          $lt: thisMonth 
        } 
      }),
      Post.countDocuments({ 
        createdAt: { 
          $gte: lastMonth, 
          $lt: thisMonth 
        } 
      }),
    ]);

    // Calculate growth percentages
    const userGrowthPercentage = newUsersLastMonth > 0 
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth * 100).toFixed(1)
      : "0";
    
    const postGrowthPercentage = newPostsLastMonth > 0 
      ? ((newPostsThisMonth - newPostsLastMonth) / newPostsLastMonth * 100).toFixed(1)
      : "0";

    res.json({
      overview: {
        totalUsers,
        totalPosts,
        totalClubs,
        totalReports,
        activeUsers,
        restrictedUsers,
      },
      userStats: {
        students,
        clubMembers,
        admins,
        userGrowthPercentage: `${userGrowthPercentage}%`,
      },
      postStats: {
        feedPosts,
        clubPosts,
        approvedPosts,
        pendingPosts,
        rejectedPosts,
        postGrowthPercentage: `${postGrowthPercentage}%`,
      },
      reportStats: {
        pendingReports,
        reviewedReports,
        resolvedReports,
      },
      recentActivity: {
        newUsersThisWeek,
        newPostsThisWeek,
        newReportsThisWeek,
        newClubsThisWeek,
        newUsersThisMonth,
        newPostsThisMonth,
      },
      lastUpdated: now,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ message: "Error fetching dashboard statistics" });
  }
};

// Get user activity analytics
export const getUserActivityAnalytics = async (
  req: AuthRequest & { query: PaginationQuery },
  res: Response
) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "10");
    const days = parseInt((req.query.days as string) || "30");
    const skip = (page - 1) * limit;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get most active users (by post count)
    const mostActiveUsers = await User.aggregate([
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "author",
          as: "posts",
        },
      },
      {
        $lookup: {
          from: "clubs",
          localField: "_id",
          foreignField: "members",
          as: "clubs",
        },
      },
      {
        $lookup: {
          from: "reports",
          localField: "_id",
          foreignField: "reportedBy",
          as: "reports",
        },
      },
      {
        $addFields: {
          postCount: { $size: { $ifNull: ["$posts", []] } },
          clubCount: { $size: { $ifNull: ["$clubs", []] } },
          reportCount: { $size: { $ifNull: ["$reports", []] } },
          recentPosts: {
            $size: {
              $filter: {
                input: { $ifNull: ["$posts", []] },
                cond: { $gte: ["$$this.createdAt", startDate] },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          studentId: 1,
          nickname: 1,
          role: 1,
          status: 1,
          createdAt: 1,
          postCount: 1,
          clubCount: 1,
          reportCount: 1,
          recentPosts: 1,
        },
      },
      { $sort: { recentPosts: -1, postCount: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    // Get total count for pagination
    const totalUsers = await User.countDocuments();

    // Get activity trends (posts per day for last 30 days)
    const activityTrends = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
          feedPosts: {
            $sum: { $cond: [{ $eq: ["$postType", "feed"] }, 1, 0] },
          },
          clubPosts: {
            $sum: { $cond: [{ $eq: ["$postType", "club"] }, 1, 0] },
          },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
    ]);

    res.json({
      mostActiveUsers,
      activityTrends,
      pagination: {
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
        totalUsers,
        hasNext: page < Math.ceil(totalUsers / limit),
        hasPrev: page > 1,
      },
      period: {
        days,
        startDate,
        endDate: new Date(),
      },
    });
  } catch (error) {
    console.error("Get user activity analytics error:", error);
    res.status(500).json({ message: "Error fetching user activity analytics" });
  }
};

// Get system health status
export const getSystemHealth = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const startTime = Date.now();
    
    // Database connection status
    const dbState = mongoose.connection.readyState;
    const dbStates = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    // Database operations test
    let dbResponseTime = 0;
    let dbStatus = "healthy";
    try {
      const dbTestStart = Date.now();
      await User.findOne().limit(1);
      dbResponseTime = Date.now() - dbTestStart;
      
      if (dbResponseTime > 1000) {
        dbStatus = "slow";
      }
    } catch (error) {
      dbStatus = "error";
    }

    // Memory usage
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024),
    };

    // CPU usage (basic)
    const cpuUsage = process.cpuUsage();

    // System uptime
    const uptime = process.uptime();

    // File system status (check uploads directory)
    const fs = require("fs");
    const path = require("path");
    let uploadsStatus = "healthy";
    try {
      const uploadsPath = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadsPath)) {
        uploadsStatus = "missing_directory";
      }
    } catch (error) {
      uploadsStatus = "error";
    }

    const totalResponseTime = Date.now() - startTime;

    res.json({
      status: dbStatus === "healthy" ? "healthy" : "degraded",
      timestamp: new Date(),
      responseTime: totalResponseTime,
      database: {
        status: dbStates[dbState as keyof typeof dbStates],
        responseTime: dbResponseTime,
        connectionState: dbState,
      },
      memory: memoryUsageMB,
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      system: {
        uptime: Math.round(uptime),
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      storage: {
        uploads: uploadsStatus,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || "development",
        port: process.env.PORT || 5000,
      },
    });
  } catch (error) {
    console.error("Get system health error:", error);
    res.status(500).json({ 
      status: "error",
      message: "Error fetching system health",
      timestamp: new Date(),
    });
  }
};

// Get admin analytics and insights
export const getAdminAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const days = parseInt((req.query.days as string) || "30");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Content moderation insights
    const moderationStats = await Report.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$targetType",
          count: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          reviewed: {
            $sum: { $cond: [{ $eq: ["$status", "reviewed"] }, 1, 0] },
          },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
          },
        },
      },
    ]);

    // User engagement metrics
    const engagementStats = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          avgInteractions: { 
            $avg: { 
              $size: { 
                $ifNull: ["$interactions", []] 
              } 
            } 
          },
          avgComments: { 
            $avg: { 
              $size: { 
                $ifNull: ["$comments", []] 
              } 
            } 
          },
          postsWithMedia: {
            $sum: { 
              $cond: [
                { 
                  $gt: [{ $size: { $ifNull: ["$media", []] } }, 0] 
                }, 
                1, 
                0
              ] 
            },
          },
          postsWithPolls: {
            $sum: { $cond: [{ $ne: ["$poll", null] }, 1, 0] },
          },
        },
      },
    ]);

    // Club activity insights
    const clubStats = await Club.aggregate([
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "club",
          as: "posts",
        },
      },
      {
        $addFields: {
          postCount: { $size: { $ifNull: ["$posts", []] } },
          recentPosts: {
            $size: {
              $filter: {
                input: { $ifNull: ["$posts", []] },
                cond: { $gte: ["$$this.createdAt", startDate] },
              },
            },
          },
        },
      },
      {
        $project: {
          name: 1,
          memberCount: { $size: { $ifNull: ["$members", []] } },
          postCount: 1,
          recentPosts: 1,
        },
      },
      { $sort: { recentPosts: -1 } },
      { $limit: 10 },
    ]);

    // Top performing content
    const topPosts = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: "approved",
        },
      },
      {
        $addFields: {
          interactionCount: { $size: { $ifNull: ["$interactions", []] } },
          commentCount: { $size: { $ifNull: ["$comments", []] } },
          engagementScore: {
            $add: [
              { $size: { $ifNull: ["$interactions", []] } },
              { $multiply: [{ $size: { $ifNull: ["$comments", []] } }, 2] },
            ],
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $unwind: "$author",
      },
      {
        $project: {
          _id: 1,
          content: { $substr: ["$content", 0, 100] },
          postType: 1,
          interactionCount: 1,
          commentCount: 1,
          engagementScore: 1,
          createdAt: 1,
          author: {
            studentId: 1,
            nickname: 1,
          },
        },
      },
      { $sort: { engagementScore: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      period: {
        days,
        startDate,
        endDate: new Date(),
      },
      moderation: {
        reportsByType: moderationStats,
      },
      engagement: {
        metrics: engagementStats[0] || {
          totalPosts: 0,
          avgInteractions: 0,
          avgComments: 0,
          postsWithMedia: 0,
          postsWithPolls: 0,
        },
      },
      clubs: {
        mostActive: clubStats,
      },
      content: {
        topPosts,
      },
    });
  } catch (error) {
    console.error("Get admin analytics error:", error);
    res.status(500).json({ message: "Error fetching admin analytics" });
  }
};

// Get recent admin activities (audit log)
export const getAdminActivities = async (
  req: AuthRequest & { query: PaginationQuery },
  res: Response
) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "20");
    const skip = (page - 1) * limit;

    // Get recent admin activities from various sources
    const [recentReports, recentUserChanges, recentPostApprovals] = await Promise.all([
      // Recent reports handled by admins
      Report.find({ reviewedBy: { $exists: true } })
        .populate("reportedBy", "studentId nickname")
        .populate("reviewedBy", "studentId nickname")
        .sort({ updatedAt: -1 })
        .limit(10),
      
      // Recent user role/status changes (we'll need to add audit fields to User model)
      User.find({
        $or: [
          { "role": { $exists: true } },
          { "status": { $exists: true } }
        ]
      })
        .sort({ updatedAt: -1 })
        .limit(10),
      
      // Recent post approvals/rejections
      Post.find({
        $or: [
          { status: "approved" },
          { status: "rejected" }
        ]
      })
        .populate("author", "studentId nickname")
        .sort({ updatedAt: -1 })
        .limit(10),
    ]);

    // Combine and format activities
    const activities = [
      ...recentReports.map(report => ({
        type: "report_reviewed",
        timestamp: report.updatedAt,
        details: {
          reportId: report._id,
          targetType: report.targetType,
          status: report.status,
          reviewedBy: report.reviewedBy,
        },
      })),
      ...recentUserChanges.map(user => ({
        type: "user_updated",
        timestamp: user.updatedAt,
        details: {
          userId: user._id,
          studentId: user.studentId,
          role: user.role,
          status: user.status,
        },
      })),
      ...recentPostApprovals.map(post => ({
        type: "post_moderated",
        timestamp: post.updatedAt,
        details: {
          postId: post._id,
          postType: post.postType,
          status: post.status,
          author: post.author,
        },
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const paginatedActivities = activities.slice(skip, skip + limit);

    res.json({
      activities: paginatedActivities,
      pagination: {
        totalPages: Math.ceil(activities.length / limit),
        currentPage: page,
        totalActivities: activities.length,
        hasNext: page < Math.ceil(activities.length / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get admin activities error:", error);
    res.status(500).json({ message: "Error fetching admin activities" });
  }
};
