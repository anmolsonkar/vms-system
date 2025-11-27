import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProperty extends Document {
  name: string;
  type: "apartment" | "warehouse" | "rwa" | "office";
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  contactPerson: {
    name: string;
    phone: string;
    email: string;
  };
  qrCode?: string;
  isActive: boolean;
  totalUnits?: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    name: {
      type: String,
      required: [true, "Property name is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["apartment", "warehouse", "rwa", "office"],
      required: [true, "Property type is required"],
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: "India" },
    },
    contactPerson: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },
    qrCode: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalUnits: {
      type: Number,
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

// Index for faster queries
PropertySchema.index({ name: 1 });
PropertySchema.index({ type: 1 });

const Property: Model<IProperty> =
  mongoose.models.Property ||
  mongoose.model<IProperty>("Property", PropertySchema);

export default Property;
