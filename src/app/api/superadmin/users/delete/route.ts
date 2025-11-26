import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import User from "@/app/lib/db/models/User";
import Resident from "@/app/lib/db/models/Resident";
import { authMiddleware } from "@/app/lib/auth/middleware";

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate superadmin
    const { user, error } = await authMiddleware(request, "superadmin");
    if (error) return error;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

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

    // Prevent deleting superadmin
    if (existingUser.role === "superadmin") {
      return NextResponse.json(
        { success: false, error: "Cannot delete superadmin user" },
        { status: 403 }
      );
    }

    // Soft delete - deactivate user instead of removing
    existingUser.isActive = false;
    await existingUser.save();

    // If resident, deactivate resident profile
    if (existingUser.role === "resident") {
      await Resident.findOneAndUpdate(
        { userId: userId },
        { $set: { isActive: false } }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User deactivated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
