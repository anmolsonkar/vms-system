import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  fullName?: string; // ✅ Added fullName field
  role: "superadmin" | "resident" | "guard";
  propertyId?: mongoose.Types.ObjectId;
  unitNumber?: string; // ✅ Added unitNumber field
  phoneNumber?: string; // ✅ Added phoneNumber field
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: mongoose.Types.ObjectId;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    fullName: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["superadmin", "resident", "guard"],
      required: [true, "Role is required"],
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: function (this: IUser) {
        return this.role !== "superadmin";
      },
    },
    unitNumber: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// ✅ FIXED: Remove duplicate indexes - only use schema.index()
// Remove the index: true from the email field definition and use this instead:
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, propertyId: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
