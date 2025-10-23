// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// App Configuration
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'UMPSA Community Platform';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

// File Upload Configuration
export const MAX_FILE_SIZE = parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '52428800'); // 50MB
export const ALLOWED_IMAGE_TYPES = (import.meta.env.VITE_ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(',');
export const ALLOWED_VIDEO_TYPES = (import.meta.env.VITE_ALLOWED_VIDEO_TYPES || 'video/mp4,video/webm,video/ogg').split(',');

// Development Configuration
export const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  REFRESH: '/api/auth/refresh',
  
  // Users
  USERS: '/api/users',
  USER_PROFILE: '/api/users/profile',
  USER_STATS: '/api/users/stats',
  
  // Posts
  FEED_POSTS: '/api/feed',
  CLUB_POSTS: '/api/posts',
  POST_REACTIONS: '/api/posts',
  POST_COMMENTS: '/api/posts',
  
  // Polls
  POLLS: '/api/polls',
  
  // Clubs
  CLUBS: '/api/clubs',
  CLUB_MEMBERS: '/api/clubs',
  
  // Reports
  REPORTS: '/api/reports',
  
  // Uploads
  UPLOAD_PROFILE: '/api/upload/profile',
  UPLOAD_CLUB: '/api/upload/club',
  UPLOAD_POST: '/api/upload/post',
  
  // Admin
  ADMIN_DASHBOARD: '/api/admin/dashboard',
  ADMIN_USERS: '/api/admin/users',
  ADMIN_ANALYTICS: '/api/admin/analytics',
  
  // Notifications
  NOTIFICATIONS: '/api/notifications',
} as const;

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  CLUB_MEMBER: 'club_member',
  ADMIN: 'admin',
} as const;

// Post Types
export const POST_TYPES = {
  FEED: 'feed',
  CLUB: 'club',
} as const;

// Post Status
export const POST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

// Reaction Types
export const REACTION_TYPES = {
  LIKE: 'like',
  LOVE: 'love',
  DISLIKE: 'dislike',
  LAUGH: 'laugh',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  POST_APPROVED: 'post_approved',
  POST_REJECTED: 'post_rejected',
  POST_LIKED: 'post_liked',
  POST_COMMENTED: 'post_commented',
  POLL_VOTED: 'poll_voted',
  CLUB_JOINED: 'club_joined',
  CLUB_LEFT: 'club_left',
  REPORT_SUBMITTED: 'report_submitted',
  REPORT_RESOLVED: 'report_resolved',
  USER_RESTRICTED: 'user_restricted',
  USER_UNRESTRICTED: 'user_unrestricted',
  ADMIN_ACTION: 'admin_action',
  SYSTEM_ANNOUNCEMENT: 'system_announcement',
} as const;

// Notification Priority
export const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// Report Status
export const REPORT_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  RESOLVED: 'resolved',
} as const;

// Report Target Types
export const REPORT_TARGET_TYPES = {
  USER: 'user',
  POST: 'post',
  CLUB: 'club',
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
