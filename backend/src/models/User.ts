import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  studentId: string;
  password: string;
  role: "student" | "club_member" | "club_leader" | "admin";
  status: "active" | "restricted";
  restriction?: {
    type: "temporary" | "permanent";
    until?: Date;
  };
  nickname?: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "club_member", "club_leader", "admin"],
      default: "student",
    },
    status: {
      type: String,
      enum: ["active", "restricted"],
      default: "active",
    },
    restriction: {
      type: {
        type: String,
        enum: ["temporary", "permanent"],
      },
      until: Date,
    },
    nickname: String,
    profilePicture: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", userSchema);
