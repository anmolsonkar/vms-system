import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  type:
    | "visitor_request"
    | "visitor_approved"
    | "visitor_rejected"
    | "visitor_checked_in"
    | "visitor_exit_marked"
    | "visitor_at_gate"
    | "system";
  title: string;
  message: string;
  relatedVisitorId?: mongoose.Types.ObjectId;
  isRead: boolean;
  readAt?: Date;
  actionUrl?: string;
  priority: "low" | "medium" | "high";
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "visitor_request",
        "visitor_approved",
        "visitor_rejected",
        "visitor_checked_in",
        "visitor_exit_marked",
        "visitor_at_gate",
        "system",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedVisitorId: {
      type: Schema.Types.ObjectId,
      ref: "Visitor",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    actionUrl: {
      type: String,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ propertyId: 1 });
NotificationSchema.index({ type: 1 });

// Auto-delete notifications older than 30 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
