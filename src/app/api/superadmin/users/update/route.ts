import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import User from "@/app/lib/db/models/User";
import Resident from "@/app/lib/db/models/Resident";
import bcrypt from "bcryptjs";
import { authMiddleware } from "@/app/lib/auth/middleware";

export async function PUT(request: NextRequest) {
  try {
    // Authenticate superadmin
    const { user, error } = await authMiddleware(request, "superadmin");
    if (error) return error;

    await connectDB();

    const body = await request.json();
    const {
      userId,
      email,
      password,
      fullName,
      unitNumber,
      phoneNumber,
      isActive,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Find user
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Build update object for User
    const userUpdateData: any = {};

    // Update email if changed
    if (email && email !== existingUser.email) {
      // Check if new email already exists
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return NextResponse.json(
          { success: false, error: "Email already exists" },
          { status: 400 }
        );
      }
      userUpdateData.email = email.toLowerCase();
    }

    // Update password if provided
    if (password) {
      if (password.length < 8) {
        return NextResponse.json(
          { success: false, error: "Password must be at least 8 characters" },
          { status: 400 }
        );
      }
      userUpdateData.password = await bcrypt.hash(password, 10);
    }

    // Update fullName if provided
    if (fullName !== undefined) {
      userUpdateData.fullName = fullName;
    }

    // Update unitNumber if provided (for User model)
    if (unitNumber !== undefined) {
      userUpdateData.unitNumber = unitNumber;
    }

    // Update phoneNumber if provided (for User model)
    if (phoneNumber !== undefined) {
      userUpdateData.phoneNumber = phoneNumber;
    }

    // Update active status if provided
    if (typeof isActive !== "undefined") {
      userUpdateData.isActive = isActive;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: userUpdateData },
      { new: true }
    ).select("-password");

    // If resident, update resident info as well
    if (existingUser.role === "resident") {
      const residentUpdateData: any = {};

      if (fullName) residentUpdateData.name = fullName;
      if (unitNumber) residentUpdateData.unitNumber = unitNumber;
      if (phoneNumber) residentUpdateData.phone = phoneNumber;
      if (email) residentUpdateData.email = email.toLowerCase();
      if (typeof isActive !== "undefined")
        residentUpdateData.isActive = isActive;

      if (Object.keys(residentUpdateData).length > 0) {
        await Resident.findOneAndUpdate(
          { userId: userId },
          { $set: residentUpdateData },
          { new: true }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "User updated successfully",
        data: {
          user: updatedUser,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
