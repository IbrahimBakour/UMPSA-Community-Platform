export interface User {
  _id: string;
  studentId: string;
  role: 'student' | 'admin' | 'clubMember';
  nickname: string;
  profilePicture: string;
  restriction: {
    status: boolean;
    endDate?: Date;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Reaction {
  userId: string;
  reaction: 'like' | 'love' | 'laugh' | 'dislike';
}

export interface Comment {
  _id: string;
  author: User;
  content: string;
  createdAt: Date;
}

interface Post {
  _id: string;
  author: User;
  title: string;
  content: string;
  images?: string[]; // Changed from media
  likes: string[]; // Changed from reactions
  comments: Comment[];
  createdAt: Date;
}

export interface FeedPost extends Post {
  type: 'feed';
  status: 'pending' | 'approved' | 'rejected';
}

export interface ClubPost extends Post {
  type: 'club';
  club: string; // Club ID
}

export type AnyPost = FeedPost | ClubPost;

export interface Club {
  _id: string;
  name: string;
  description: string;
  members: User[];
  profilePicture: string;
  banner: string;
}

export interface Report {
  _id: string;
  reporter: User;
  reportedUser?: User;
  reportedPost?: AnyPost;
  reason: string;
  status: 'open' | 'resolved' | 'dismissed';
  createdAt: Date;
}
