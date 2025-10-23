// User Types
export interface User {
  _id: string;
  studentId: string;
  role: 'student' | 'admin' | 'club_member';
  status: 'active' | 'restricted';
  nickname: string;
  profilePicture?: string;
  restriction?: {
    type: 'temporary' | 'permanent';
    until?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Post Types
export interface IReaction {
  user: string; // User ID
  type: 'like' | 'love' | 'dislike' | 'laugh';
  createdAt: Date;
}

export interface Comment {
  _id: string;
  author: string; // User ID
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPollOption {
  text: string;
  votes: number;
  voters: string[]; // Array of user IDs who voted
}

export interface IPoll {
  question: string;
  options: IPollOption[];
  allowMultipleVotes: boolean;
  endDate?: Date;
  totalVotes: number;
  createdAt: Date;
  isActive: boolean;
}

export interface ICalendarEvent {
  title: string;
  date: Date;
}

export interface Post {
  _id: string;
  content: string;
  postType: 'feed' | 'club';
  author: string; // User ID
  club?: string; // Club ID (for club posts)
  media: string[]; // Array of file URLs
  interactions: IReaction[];
  comments: Comment[];
  poll?: IPoll;
  calendarEvent?: ICalendarEvent;
  link?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedPost extends Post {
  postType: 'feed';
  status: 'pending' | 'approved' | 'rejected';
}

export interface ClubPost extends Post {
  postType: 'club';
  club: string; // Club ID
  status: 'approved'; // Club posts are always approved
}

export type AnyPost = FeedPost | ClubPost;

// Club Types
export interface IMembershipEvent {
  member: string; // User ID
  action: 'added' | 'removed';
  by: string; // User ID
  at: Date;
}

export interface Club {
  _id: string;
  name: string;
  description: string;
  profilePicture?: string;
  banner?: string;
  about?: string;
  contact?: string;
  members: string[]; // Array of user IDs
  createdBy: string; // User ID
  membershipEvents: IMembershipEvent[];
  createdAt: Date;
  updatedAt: Date;
}

// Report Types
export interface Report {
  _id: string;
  reportedBy: string; // User ID
  targetType: 'user' | 'post' | 'club';
  targetId: string; // ID of the reported entity
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  reviewedBy?: string; // User ID
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Notification Types
export type NotificationType =
  | 'post_approved'
  | 'post_rejected'
  | 'post_liked'
  | 'post_commented'
  | 'poll_voted'
  | 'club_invited'
  | 'club_joined'
  | 'club_left'
  | 'report_submitted'
  | 'report_resolved'
  | 'user_restricted'
  | 'user_unrestricted'
  | 'admin_action'
  | 'system_announcement';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  recipient: string; // User ID
  recipients?: string[]; // For bulk notifications
  priority: NotificationPriority;
  isRead: boolean;
  isDelivered: boolean;
  relatedPost?: string; // Post ID
  relatedClub?: string; // Club ID
  relatedReport?: string; // Report ID
  relatedUser?: string; // User ID
  data?: any; // Additional arbitrary data
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    totalPages: number;
    currentPage: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
}

// Form Types
export interface LoginForm {
  studentId: string;
  password: string;
}

export interface RegisterForm {
  studentId: string;
  password: string;
  confirmPassword: string;
  nickname: string;
}

export interface CreatePostForm {
  content: string;
  media?: File[];
  poll?: {
    question: string;
    options: string[];
    allowMultipleVotes: boolean;
    endDate?: Date;
  };
  calendarEvent?: {
    title: string;
    date: Date;
  };
  link?: string;
}

export interface CreateClubForm {
  name: string;
  description: string;
  about?: string;
  contact?: string;
  profilePicture?: File;
  banner?: File;
  initialMemberId?: string;
}

export interface CreateReportForm {
  targetType: 'user' | 'post' | 'club';
  targetId: string;
  reason: string;
}

// Statistics Types
export interface UserStats {
  totalPosts: number;
  totalComments: number;
  totalReactions: number;
  joinDate: Date;
  lastActivity: Date;
}

export interface ClubStats {
  totalMembers: number;
  totalPosts: number;
  createdAt: Date;
  recentActivity: Date;
}

export interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalClubs: number;
  totalReports: number;
  pendingPosts: number;
  pendingReports: number;
}
