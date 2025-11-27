import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import User from "@/app/lib/db/models/User";
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

    // Build update object
    const userUpdateData: any = {};

    // Update email if changed
    if (email && email !== existingUser.email) {
      const emailExists = await User.findOne({
        email,
        _id: { $ne: userId },
      });

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

    // Update profile fields
    if (fullName !== undefined) {
      userUpdateData.fullName = fullName;
    }

    if (unitNumber !== undefined) {
      userUpdateData.unitNumber = unitNumber;
    }

    if (phoneNumber !== undefined) {
      userUpdateData.phoneNumber = phoneNumber;
    }

    // Update active status
    if (typeof isActive !== "undefined") {
      userUpdateData.isActive = isActive;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: userUpdateData },
      { new: true }
    ).select("-password");

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
