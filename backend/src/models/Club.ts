import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";

export interface IClub extends Document {
  name: string;
  description?: string;
  profilePicture?: string;
  banner?: string;
  about?: string;
  contact?: string;
  members: IUser["_id"][];
  clubLeader?: IUser["_id"];
  createdBy: IUser["_id"];
  createdAt: Date;
  updatedAt: Date;
  // Instance methods
  isMember(userId: string): boolean;
  // Virtual properties
  memberCount: number;
  // Membership audit log (optional)
  membershipEvents?: Array<{
    action: "added" | "removed";
    user: IUser["_id"];
    by: IUser["_id"];
    at: Date;
  }>;
}

const clubSchema = new Schema<IClub>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String,
    },
    banner: {
      type: String,
    },
    about: {
      type: String,
      trim: true,
    },
    contact: {
      type: String,
      trim: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    clubLeader: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add membershipEvents schema path
clubSchema.add({
  membershipEvents: [
    {
      action: { type: String, enum: ["added", "removed"] },
      user: { type: Schema.Types.ObjectId, ref: "User" },
      by: { type: Schema.Types.ObjectId, ref: "User" },
      at: { type: Date, default: Date.now },
    },
  ],
});

// Ensure at least one club member exists
clubSchema.pre("save", function (next) {
  if (this.members.length === 0) {
    const error = new Error("Club must have at least one member");
    return next(error);
  }
  next();
});

// Instance method to check if a user is a member
clubSchema.methods.isMember = function (this: IClub, userId: string): boolean {
  return (this.members as mongoose.Types.ObjectId[]).some(
    (memberId) => memberId.toString() === userId.toString()
  );
};

// Virtual field to get member count
clubSchema.virtual("memberCount").get(function (this: IClub) {
  return this.members.length;
});

export default mongoose.model<IClub>("Club", clubSchema);
