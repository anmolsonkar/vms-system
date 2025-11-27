import mongoose, { Schema, Document, Model } from "mongoose";

export interface IResident extends Document {
  userId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  unitNumber: string;
  name: string;
  phone: string;
  alternatePhone?: string;
  email: string;
  numberOfMembers: number;
  vehicleNumbers?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ResidentSchema = new Schema<IResident>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // ✅ FIXED: Removed unique: true from here, will use schema.index() instead
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    unitNumber: {
      type: String,
      required: [true, "Unit number is required"],
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Resident name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
    },
    alternatePhone: {
      type: String,
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    numberOfMembers: {
      type: Number,
      default: 1,
      min: 1,
    },
    vehicleNumbers: [
      {
        type: String,
        uppercase: true,
        trim: true,
      },
    ],
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relation: { type: String },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ FIXED: Use schema.index() to create indexes (no duplicates)
ResidentSchema.index({ userId: 1 }, { unique: true });
ResidentSchema.index({ propertyId: 1, unitNumber: 1 });
ResidentSchema.index({ phone: 1 });

const Resident: Model<IResident> =
  mongoose.models.Resident ||
  mongoose.model<IResident>("Resident", ResidentSchema);

export default Resident;
