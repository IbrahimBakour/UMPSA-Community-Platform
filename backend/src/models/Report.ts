import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";

export type ReportTargetType = "user" | "post" | "comment";
export type ReportStatus = "pending" | "reviewed" | "resolved";

export interface IReport extends Document {
  reportedBy: IUser["_id"];
  targetType: ReportTargetType;
  targetId: mongoose.Types.ObjectId;
  reason: string;
  status: ReportStatus;
  reviewedBy?: IUser["_id"];
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: {
      type: String,
      enum: ["user", "post", "comment"],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending",
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IReport>("Report", reportSchema);
