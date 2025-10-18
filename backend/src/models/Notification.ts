import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";
import { IPost } from "./Post";
import { IClub } from "./Club";
import { IReport } from "./Report";

// Notification types
export type NotificationType = 
  | "post_approved"
  | "post_rejected"
  | "post_liked"
  | "post_commented"
  | "poll_voted"
  | "club_invited"
  | "club_joined"
  | "club_left"
  | "report_submitted"
  | "report_resolved"
  | "user_restricted"
  | "user_unrestricted"
  | "admin_action"
  | "system_announcement";

// Notification priority levels
export type NotificationPriority = "low" | "medium" | "high" | "urgent";

// Notification interface
export interface INotification extends Document {
  // Basic notification info
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  
  // Recipients
  recipient: IUser["_id"]; // Primary recipient
  recipients?: IUser["_id"][]; // Additional recipients (for bulk notifications)
  
  // Related entities (optional)
  relatedPost?: IPost["_id"];
  relatedClub?: IClub["_id"];
  relatedReport?: IReport["_id"];
  relatedUser?: IUser["_id"]; // User who triggered the notification
  
  // Notification data
  data?: {
    [key: string]: any; // Additional data specific to notification type
  };
  
  // Status and delivery
  isRead: boolean;
  isDelivered: boolean;
  readAt?: Date;
  deliveredAt?: Date;
  
  // Expiration
  expiresAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  markAsRead(): Promise<void>;
  markAsDelivered(): Promise<void>;
  isExpired(): boolean;
}

const notificationSchema = new Schema<INotification>(
  {
    // Basic notification info
    type: {
      type: String,
      enum: [
        "post_approved",
        "post_rejected", 
        "post_liked",
        "post_commented",
        "poll_voted",
        "club_invited",
        "club_joined",
        "club_left",
        "report_submitted",
        "report_resolved",
        "user_restricted",
        "user_unrestricted",
        "admin_action",
        "system_announcement"
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    
    // Recipients
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipients: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    
    // Related entities
    relatedPost: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
    relatedClub: {
      type: Schema.Types.ObjectId,
      ref: "Club",
    },
    relatedReport: {
      type: Schema.Types.ObjectId,
      ref: "Report",
    },
    relatedUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    
    // Notification data
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    
    // Status and delivery
    isRead: {
      type: Boolean,
      default: false,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    
    // Expiration
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Instance methods
notificationSchema.methods.markAsRead = async function (this: INotification): Promise<void> {
  this.isRead = true;
  this.readAt = new Date();
  await this.save();
};

notificationSchema.methods.markAsDelivered = async function (this: INotification): Promise<void> {
  this.isDelivered = true;
  this.deliveredAt = new Date();
  await this.save();
};

notificationSchema.methods.isExpired = function (this: INotification): boolean {
  return this.expiresAt ? new Date() > this.expiresAt : false;
};

// Indexes for better query performance
notificationSchema.index({ recipient: 1, createdAt: -1 }); // For fetching user notifications
notificationSchema.index({ type: 1, createdAt: -1 }); // For fetching notifications by type
notificationSchema.index({ isRead: 1, createdAt: -1 }); // For fetching unread notifications
notificationSchema.index({ priority: 1, createdAt: -1 }); // For fetching by priority
notificationSchema.index({ expiresAt: 1 }); // For cleanup of expired notifications
notificationSchema.index({ relatedPost: 1 }); // For post-related notifications
notificationSchema.index({ relatedClub: 1 }); // For club-related notifications

export default mongoose.model<INotification>("Notification", notificationSchema);
