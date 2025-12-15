// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// App Configuration
export const APP_NAME =
  import.meta.env.VITE_APP_NAME || "UMPSA Community Platform";
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.0.0";

// File Upload Configuration
export const MAX_FILE_SIZE = parseInt(
  import.meta.env.VITE_MAX_FILE_SIZE || "52428800"
); // 50MB
export const ALLOWED_IMAGE_TYPES = (
  import.meta.env.VITE_ALLOWED_IMAGE_TYPES ||
  "image/jpeg,image/png,image/gif,image/webp"
).split(",");
export const ALLOWED_VIDEO_TYPES = (
  import.meta.env.VITE_ALLOWED_VIDEO_TYPES || "video/mp4,video/webm,video/ogg"
).split(",");

// Development Configuration
export const DEV_MODE = import.meta.env.VITE_DEV_MODE === "true";

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register", // Not implemented in backend
  REFRESH: "/api/auth/refresh", // Not implemented in backend
  IMPORT_USERS: "/api/auth/import",

  // Users
  USERS: "/api/users",
  USER_PROFILE: "/api/users/me",
  USER_PUBLIC_PROFILE: "/api/users/:userId/profile",
  USER_CHANGE_PASSWORD: "/api/users/me/password",
  USER_STATS: "/api/users/stats",
  USER_ACTIVITY: "/api/users/:userId/activity",
  USER_ROLE: "/api/users/:userId/role",
  USER_STATUS: "/api/users/:userId/status",

  // Posts
  FEED_POSTS: "/api/feed",
  FEED_POST: "/api/feed/:id",
  FEED_POST_APPROVE: "/api/feed/:id/approve",
  FEED_POST_REJECT: "/api/feed/:id/reject",
  FEED_PENDING_POSTS: "/api/feed/admin/pending",
  FEED_STATS: "/api/feed/admin/stats",

  CLUB_POSTS: "/api/posts/clubs/:clubId",
  CLUB_POST_CREATE: "/api/posts/clubs/:clubId",
  POST: "/api/posts/:id",
  POST_UPDATE: "/api/posts/:id",
  POST_DELETE: "/api/posts/:id",
  POST_REACTIONS: "/api/posts/:id/reactions",
  POST_COMMENTS: "/api/posts/:postId/comments",
  POST_COMMENT_CREATE: "/api/posts/:id/comments",
  POST_COMMENT_UPDATE: "/api/posts/:postId/comments/:commentId",
  POST_COMMENT_DELETE: "/api/posts/:postId/comments/:commentId",

  // Polls
  POLLS: "/api/polls",
  POLL_VOTE: "/api/polls/:postId/vote",
  POLL_RESULTS: "/api/polls/:postId/results",
  POLL_UPDATE: "/api/polls/:postId",
  POLL_DELETE: "/api/polls/:postId",
  POLL_ANALYTICS: "/api/polls/analytics",
  POLL_HISTORY: "/api/polls/history",

  // Clubs
  CLUBS: "/api/clubs",
  CLUB: "/api/clubs/:id",
  CLUB_CREATE: "/api/clubs",
  CLUB_UPDATE: "/api/clubs/:id",
  CLUB_DELETE: "/api/clubs/:id",
  CLUB_MEMBERS: "/api/clubs/:id/members",
  CLUB_MEMBER_ADD: "/api/clubs/:id/members",
  CLUB_MEMBER_REMOVE: "/api/clubs/:id/members/:memberId",

  // Reports
  REPORTS: "/api/reports",
  REPORT: "/api/reports/:id",
  REPORT_CREATE: "/api/reports",
  REPORT_UPDATE: "/api/reports/:id",
  REPORT_RESTRICT_USER: "/api/reports/:id/restrictUser",
  REPORT_UNRESTRICT_USER: "/api/reports/:id/unrestrictUser",

  // Uploads
  UPLOAD_PROFILE: "/api/upload/profile",
  UPLOAD_CLUB: "/api/upload/clubs/:clubId",
  UPLOAD_POST: "/api/upload/posts",
  UPLOAD_DELETE: "/api/upload/file",
  UPLOAD_INFO: "/api/upload/info/:filePath",

  // Admin
  ADMIN_DASHBOARD: "/api/admin/dashboard",
  ADMIN_ANALYTICS: "/api/admin/analytics",
  ADMIN_ACTIVITIES: "/api/admin/activities",
  ADMIN_USER_ACTIVITY: "/api/admin/users/activity",
  ADMIN_SYSTEM_HEALTH: "/api/admin/system/health",

  // Notifications
  NOTIFICATIONS: "/api/notifications",
  NOTIFICATION_STATS: "/api/notifications/stats",
  NOTIFICATION_READ: "/api/notifications/:notificationId/read",
  NOTIFICATION_READ_ALL: "/api/notifications/read-all",
  NOTIFICATION_DELETE: "/api/notifications/:notificationId",
  NOTIFICATION_CLEANUP: "/api/notifications/cleanup/expired",
  NOTIFICATION_ANALYTICS: "/api/notifications/analytics",
} as const;

// User Roles
export const USER_ROLES = {
  STUDENT: "student",
  CLUB_MEMBER: "club_member",
  ADMIN: "admin",
} as const;

// Post Types
export const POST_TYPES = {
  FEED: "feed",
  CLUB: "club",
} as const;

// Post Status
export const POST_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

// Reaction Types
export const REACTION_TYPES = {
  LIKE: "like",
  LOVE: "love",
  DISLIKE: "dislike",
  LAUGH: "laugh",
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  POST_APPROVED: "post_approved",
  POST_REJECTED: "post_rejected",
  POST_LIKED: "post_liked",
  POST_COMMENTED: "post_commented",
  POLL_VOTED: "poll_voted",
  CLUB_JOINED: "club_joined",
  CLUB_LEFT: "club_left",
  REPORT_SUBMITTED: "report_submitted",
  REPORT_RESOLVED: "report_resolved",
  USER_RESTRICTED: "user_restricted",
  USER_UNRESTRICTED: "user_unrestricted",
  ADMIN_ACTION: "admin_action",
  SYSTEM_ANNOUNCEMENT: "system_announcement",
} as const;

// Notification Priority
export const NOTIFICATION_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

// Report Status
export const REPORT_STATUS = {
  PENDING: "pending",
  REVIEWED: "reviewed",
  RESOLVED: "resolved",
} as const;

// Report Target Types
export const REPORT_TARGET_TYPES = {
  USER: "user",
  POST: "post",
  COMMENT: "comment",
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

// File Upload Limits
export const FILE_LIMITS = {
  PROFILE_PICTURE: 2 * 1024 * 1024, // 2MB
  CLUB_MEDIA: 5 * 1024 * 1024, // 5MB
  POST_MEDIA: 50 * 1024 * 1024, // 50MB
  MAX_FILES_PER_POST: 5,
} as const;
