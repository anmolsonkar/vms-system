import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVisitor extends Document {
  propertyId: mongoose.Types.ObjectId;
  name: string;
  phone?: string;
  phoneVerified: boolean;
  idCardType?: "aadhaar" | "pan" | "driving_license" | "passport" | "other";
  idCardNumber?: string;
  idCardImageUrl?: string;
  photoUrl: string;
  purpose: string;
  hostResidentId: mongoose.Types.ObjectId;
  vehicleNumber?: string;
  numberOfPersons: number;
  status: "pending" | "approved" | "rejected" | "checked_in" | "checked_out";
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectedBy?: mongoose.Types.ObjectId;
  rejectedAt?: Date;
  rejectionReason?: string;
  checkedInBy?: mongoose.Types.ObjectId;
  checkInTime?: Date;
  markedExitBy?: mongoose.Types.ObjectId;
  markedExitAt?: Date;
  actualCheckOutTime?: Date;
  checkedOutBy?: mongoose.Types.ObjectId;
  isWalkIn: boolean;
  createdBy?: mongoose.Types.ObjectId;
  otp?: string;
  otpExpiry?: Date;
  otpVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VisitorSchema = new Schema<IVisitor>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Visitor name is required"],
      trim: true,
    },
    phone: {
      type: String,
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    idCardType: {
      type: String,
      enum: ["aadhaar", "pan", "driving_license", "passport", "other"],
    },
    idCardNumber: {
      type: String,
      trim: true,
    },
    idCardImageUrl: {
      type: String,
    },
    photoUrl: {
      type: String,
      required: [true, "Visitor photo is required"],
    },
    purpose: {
      type: String,
      required: [true, "Purpose of visit is required"],
      trim: true,
    },
    hostResidentId: {
      type: Schema.Types.ObjectId,
      ref: "Resident",
      required: [true, "Host resident is required"],
    },
    vehicleNumber: {
      type: String,
      uppercase: true,
      trim: true,
    },
    numberOfPersons: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "checked_in", "checked_out"],
      default: "pending",
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    rejectedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    rejectedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    checkedInBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    checkInTime: {
      type: Date,
    },
    markedExitBy: {
      type: Schema.Types.ObjectId,
      ref: "Resident",
    },
    markedExitAt: {
      type: Date,
    },
    actualCheckOutTime: {
      type: Date,
    },
    checkedOutBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isWalkIn: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
VisitorSchema.index({ propertyId: 1, status: 1 });
VisitorSchema.index({ hostResidentId: 1, status: 1 });
VisitorSchema.index({ phone: 1 });
VisitorSchema.index({ createdAt: -1 });
VisitorSchema.index({ checkInTime: 1, status: 1 });

const Visitor: Model<IVisitor> =
  mongoose.models.Visitor || mongoose.model<IVisitor>("Visitor", VisitorSchema);

export default Visitor;
