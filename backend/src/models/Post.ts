import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";
import { IClub } from "./Club";

// Comment Interface and Schema
export interface IComment extends Document {
  content: string;
  author: IUser["_id"];
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Post Interface
export interface IPost extends Document {
  title: string;
  content: string;
  images: string[];
  club: IClub["_id"];
  author: IUser["_id"];
  comments: IComment[];
  visibility: "public" | "members";
  status: "active" | "archived";
  viewCount: number;
  likes: IUser["_id"][];
  createdAt: Date;
  updatedAt: Date;
  // Virtual methods
  isLikedBy(userId: string): boolean;
  addView(): Promise<void>;
}

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    club: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comments: [commentSchema],
    visibility: {
      type: String,
      enum: ["public", "members"],
      default: "public",
    },
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Check if a user has liked the post
postSchema.methods.isLikedBy = function (this: IPost, userId: string): boolean {
  return this.likes.some((id: any) => id.toString() === userId);
};

// Increment view count
postSchema.methods.addView = async function (this: IPost): Promise<void> {
  this.viewCount += 1;
  await this.save();
};

// Indexes for better query performance
postSchema.index({ club: 1, createdAt: -1 }); // For fetching club posts by date
postSchema.index({ club: 1, status: 1 }); // For fetching active/archived posts
postSchema.index({ author: 1 }); // For fetching user's posts

export default mongoose.model<IPost>("Post", postSchema);
