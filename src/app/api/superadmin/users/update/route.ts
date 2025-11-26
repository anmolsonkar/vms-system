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
    const { userId, email, password, isActive, ...otherUpdates } = body;

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
    const updateData: any = {};

    if (email && email !== existingUser.email) {
      // Check if new email already exists
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return NextResponse.json(
          { success: false, error: "Email already exists" },
          { status: 400 }
        );
      }
      updateData.email = email;
    }

    if (password) {
      // Hash new password
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (typeof isActive !== "undefined") {
      updateData.isActive = isActive;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select("-password");

    // If resident, update resident info
    if (existingUser.role === "resident" && otherUpdates.residentData) {
      await Resident.findOneAndUpdate(
        { userId: userId },
        { $set: otherUpdates.residentData },
        { new: true }
      );
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
