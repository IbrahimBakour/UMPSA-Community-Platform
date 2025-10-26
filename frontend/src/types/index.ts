// User Types
export interface User {
  _id: string;
  studentId: string;
  password?: string; // Only present in some contexts
  role: 'student' | 'club_member' | 'admin';
  status: 'active' | 'restricted';
  restriction?: {
    type: 'temporary' | 'permanent';
    until?: Date;
  };
  nickname?: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  token: string;
  user: {
    id?: string;
    _id?: string;
    studentId: string;
    role: 'student' | 'club_member' | 'admin';
    nickname?: string;
    profilePicture?: string;
  };
}

// Post Types
export interface IReaction {
  user: string; // User ID
  type: 'like' | 'love' | 'dislike' | 'laugh';
}

export interface Comment {
  _id: string;
  content: string;
  author: string; // User ID
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
  media?: string[]; // Array of file URLs
  author: string; // User ID
  postType: 'feed' | 'club';
  club?: string; // Club ID (for club posts)
  poll?: IPoll;
  calendarEvent?: ICalendarEvent;
  link?: string;
  interactions: IReaction[];
  comments: Comment[];
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
  action: 'added' | 'removed';
  user: string; // User ID
  by: string; // User ID
  at: Date;
}

export interface Club {
  _id: string;
  name: string;
  description?: string;
  profilePicture?: string;
  banner?: string;
  about?: string;
  contact?: string;
  members: string[]; // Array of user IDs
  createdBy: string; // User ID
  membershipEvents?: IMembershipEvent[];
  memberCount?: number; // Virtual field
  createdAt: Date;
  updatedAt: Date;
}

// Report Types
export type ReportTargetType = 'user' | 'post' | 'club';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved';

export interface Report {
  _id: string;
  reportedBy: string; // User ID
  targetType: ReportTargetType;
  targetId: string; // ID of the reported entity
  reason: string;
  status: ReportStatus;
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
  priority: NotificationPriority;
  recipient: string; // User ID
  recipients?: string[]; // For bulk notifications
  relatedPost?: string; // Post ID
  relatedClub?: string; // Club ID
  relatedReport?: string; // Report ID
  relatedUser?: string; // User ID
  data?: any; // Additional arbitrary data
  isRead: boolean;
  isDelivered: boolean;
  readAt?: Date;
  deliveredAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface PaginatedResponse<T> {
  [key: string]: T[] | {
    totalPages: number;
    currentPage: number;
    totalUsers?: number;
    totalPosts?: number;
    totalClubs?: number;
    totalNotifications?: number;
    totalPolls?: number;
    totalReports?: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  pagination: {
    totalPages: number;
    currentPage: number;
    totalUsers?: number;
    totalPosts?: number;
    totalClubs?: number;
    totalNotifications?: number;
    totalPolls?: number;
    totalReports?: number;
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
  description?: string;
  about?: string;
  contact?: string;
  profilePicture?: File;
  banner?: File;
  leaderStudentId: string;
}

export interface CreateReportForm {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
}

// Statistics Types
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  restrictedUsers: number;
  students: number;
  clubMembers: number;
  admins: number;
}

export interface UserActivity {
  user: {
    _id: string;
    studentId: string;
    nickname?: string;
    role: string;
    status: string;
    createdAt: Date;
  };
  activity: {
    postsCreated: number;
    clubsJoined: number;
    reportsSubmitted: number;
  };
}

export interface ClubStats {
  totalMembers: number;
  totalPosts: number;
  createdAt: Date;
  recentActivity: Date;
}

export interface AdminStats {
  overview: {
    totalUsers: number;
    totalPosts: number;
    totalClubs: number;
    totalReports: number;
    activeUsers: number;
    restrictedUsers: number;
  };
  userStats: {
    students: number;
    clubMembers: number;
    admins: number;
    userGrowthPercentage: string;
  };
  postStats: {
    feedPosts: number;
    clubPosts: number;
    approvedPosts: number;
    pendingPosts: number;
    rejectedPosts: number;
    postGrowthPercentage: string;
  };
  reportStats: {
    pendingReports: number;
    reviewedReports: number;
    resolvedReports: number;
  };
  recentActivity: {
    newUsersThisWeek: number;
    newPostsThisWeek: number;
    newReportsThisWeek: number;
    newClubsThisWeek: number;
    newUsersThisMonth: number;
    newPostsThisMonth: number;
  };
  lastUpdated: Date;
}

// Additional types for backend compatibility
export interface DashboardStats extends AdminStats {}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'error';
  timestamp: Date;
  responseTime: number;
  database: {
    status: string;
    responseTime: number;
    connectionState: number;
  };
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  cpu: {
    user: number;
    system: number;
  };
  system: {
    uptime: number;
    nodeVersion: string;
    platform: string;
    arch: string;
  };
  storage: {
    uploads: string;
  };
  environment: {
    nodeEnv: string;
    port: string;
  };
}

export interface AdminAnalytics {
  period: {
    days: number;
    startDate: Date;
    endDate: Date;
  };
  moderation: {
    reportsByType: Array<{
      _id: string;
      count: number;
      pending: number;
      reviewed: number;
      resolved: number;
    }>;
  };
  engagement: {
    metrics: {
      totalPosts: number;
      avgInteractions: number;
      avgComments: number;
      postsWithMedia: number;
      postsWithPolls: number;
    };
  };
  clubs: {
    mostActive: Array<{
      name: string;
      memberCount: number;
      postCount: number;
      recentPosts: number;
    }>;
  };
  content: {
    topPosts: Array<{
      _id: string;
      content: string;
      postType: string;
      interactionCount: number;
      commentCount: number;
      engagementScore: number;
      createdAt: Date;
      author: {
        studentId: string;
        nickname?: string;
      };
    }>;
  };
}

export interface PollAnalytics {
  period: {
    days: number;
    startDate: Date;
    endDate: Date;
  };
  overview: {
    totalPolls: number;
    activePolls: number;
    endedPolls: number;
    totalVotes: number;
  };
  trends: {
    creationTrends: Array<{
      _id: {
        year: number;
        month: number;
        day: number;
      };
      count: number;
      totalVotes: number;
    }>;
    voteDistribution: Array<{
      _id: string;
      pollCount: number;
      totalVotes: number;
      avgVotesPerPoll: number;
    }>;
  };
  popular: {
    mostPopularPolls: Array<{
      _id: string;
      content: string;
      pollQuestion: string;
      totalVotes: number;
      optionsCount: number;
      author: {
        studentId: string;
        nickname?: string;
      };
      createdAt: Date;
      postType: string;
    }>;
    recentActivity: Array<{
      _id: string;
      pollQuestion: string;
      totalVotes: number;
      author: {
        studentId: string;
        nickname?: string;
      };
      createdAt: Date;
      postType: string;
    }>;
  };
}

export interface NotificationAnalytics {
  period: {
    days: number;
    startDate: Date;
    endDate: Date;
  };
  overview: {
    totalNotifications: number;
    readRate: string;
    deliveryRate: string;
  };
  breakdown: {
    byType: Array<{
      _id: string;
      count: number;
    }>;
    byPriority: Array<{
      _id: string;
      count: number;
    }>;
  };
  recentActivity: Array<{
    _id: string;
    type: string;
    title: string;
    message: string;
    recipient: {
      studentId: string;
      nickname?: string;
    };
    relatedUser?: {
      studentId: string;
      nickname?: string;
    };
    createdAt: Date;
  }>;
}
