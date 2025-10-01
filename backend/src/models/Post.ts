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

// Reaction Interface
export interface IReaction {
  user: IUser["_id"];
  type: "like" | "love" | "dislike" | "laugh";
}

// Poll Option Interface
export interface IPollOption {
  text: string;
  votes: number;
}

// Poll Interface
export interface IPoll {
  question: string;
  options: IPollOption[];
}

// Calendar Event Interface
export interface ICalendarEvent {
  title: string;
  date: Date;
}

// Post Interface
export interface IPost extends Document {
  // Basic post info
  content: string;
  media?: string[];
  author: IUser["_id"];
  
  // Post type and location
  postType: "feed" | "club";
  club?: IClub["_id"]; // Optional for feed posts
  
  // Post features
  poll?: IPoll;
  calendarEvent?: ICalendarEvent;
  link?: string;
  
  // Interactions and comments
  interactions: IReaction[];
  comments: IComment[];
  
  // Status and approval
  status: "pending" | "approved" | "rejected";
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  hasReacted(userId: string): boolean;
  getReactionType(userId: string): string | null;
  addView(): Promise<void>;
  addReaction(userId: string, reactionType: string): Promise<void>;
  removeReaction(userId: string): Promise<void>;
  updateReaction(userId: string, reactionType: string): Promise<void>;
  
  // Virtual fields
  reactionCounts: { like: number; love: number; dislike: number; laugh: number };
  totalReactions: number;
}

const postSchema = new Schema<IPost>(
  {
    // Basic post info
    content: {
      type: String,
      required: true,
      trim: true,
    },
    media: [
      {
        type: String,
      },
    ],
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    // Post type and location
    postType: {
      type: String,
      enum: ["feed", "club"],
      required: true,
    },
    club: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: function(this: IPost) {
        return this.postType === "club";
      },
    },
    
    // Post features
    poll: {
      question: {
        type: String,
        trim: true,
      },
      options: [
        {
          text: {
            type: String,
            required: true,
            trim: true,
          },
          votes: {
            type: Number,
            default: 0,
          },
        },
      ],
    },
    calendarEvent: {
      title: {
        type: String,
        trim: true,
      },
      date: {
        type: Date,
      },
    },
    link: {
      type: String,
      trim: true,
    },
    
    // Interactions and comments
    interactions: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        type: {
          type: String,
          enum: ["like", "love", "dislike", "laugh"],
          required: true,
        },
      },
    ],
    comments: [commentSchema],
    
    // Status and approval
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Check if a user has reacted to the post
postSchema.methods.hasReacted = function (this: IPost, userId: string): boolean {
  return this.interactions.some((reaction: any) => 
    reaction.user.toString() === userId.toString()
  );
};

// Get the reaction type for a user
postSchema.methods.getReactionType = function (this: IPost, userId: string): string | null {
  const reaction = this.interactions.find((reaction: any) => 
    reaction.user.toString() === userId.toString()
  );
  return reaction ? reaction.type : null;
};

// Add a reaction to the post
postSchema.methods.addReaction = async function (this: IPost, userId: string, reactionType: string): Promise<void> {
  // Remove any existing reaction from this user
  this.interactions = this.interactions.filter((reaction: any) => 
    reaction.user.toString() !== userId.toString()
  );
  
  // Add the new reaction
  // Ensure reactionType is one of the allowed values
  const allowedReactions = ["like", "love", "dislike", "laugh"] as const;
  if (!allowedReactions.includes(reactionType as typeof allowedReactions[number])) {
    throw new Error(`Invalid reaction type: ${reactionType}`);
  }

  this.interactions.push({
    user: userId,
    type: reactionType as typeof allowedReactions[number],
  });

  await this.save();
};

// Remove a reaction from the post
postSchema.methods.removeReaction = async function (this: IPost, userId: string): Promise<void> {
  this.interactions = this.interactions.filter((reaction: any) => 
    reaction.user.toString() !== userId.toString()
  );
  await this.save();
};

// Update a reaction on the post
postSchema.methods.updateReaction = async function (this: IPost, userId: string, reactionType: string): Promise<void> {
  await this.addReaction(userId, reactionType);
};

// Increment view count (keeping for compatibility)
postSchema.methods.addView = async function (this: IPost): Promise<void> {
  // Note: viewCount was removed from the new schema, but keeping method for compatibility
  // If you want to track views, add viewCount back to the schema
  await this.save();
};

// Virtual field for reaction counts
postSchema.virtual("reactionCounts").get(function (this: IPost) {
  const counts = { like: 0, love: 0, dislike: 0, laugh: 0 };
  this.interactions.forEach((reaction: any) => {
    counts[reaction.type as keyof typeof counts]++;
  });
  return counts;
});

// Virtual field for total reactions
postSchema.virtual("totalReactions").get(function (this: IPost) {
  return this.interactions.length;
});

// Indexes for better query performance
postSchema.index({ postType: 1, status: 1, createdAt: -1 }); // For fetching feed posts
postSchema.index({ club: 1, postType: 1, createdAt: -1 }); // For fetching club posts by date
postSchema.index({ author: 1, postType: 1 }); // For fetching user's posts by type
postSchema.index({ status: 1, createdAt: -1 }); // For fetching pending posts
postSchema.index({ "interactions.user": 1 }); // For reaction queries

export default mongoose.model<IPost>("Post", postSchema);

// (Removed duplicate type exports. These are unnecessary and cause duplicate identifier errors.)
