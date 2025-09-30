export interface User {
  _id: string;
  studentId: string;
  role: "student" | "admin" | "club_member";
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
