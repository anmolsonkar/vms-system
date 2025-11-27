import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import User from "@/app/lib/db/models/User";
import Resident from "@/app/lib/db/models/Resident";
import Visitor from "@/app/lib/db/models/Visitor";
import { authMiddleware } from "@/app/lib/auth/middleware";

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate superadmin
    const { user, error } = await authMiddleware(request, "superadmin");
    if (error) return error;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const permanent = searchParams.get("permanent") === "true";

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

    if (permanent) {
      // PERMANENT DELETE - Remove all related data

      // Delete resident profile if exists
      if (existingUser.role === "resident") {
        await Resident.findOneAndDelete({ userId: userId });
      }

      // Delete or anonymize visitor records (you may want to keep history)
      // Option 1: Delete all visitors (not recommended)
      // await Visitor.deleteMany({ hostResidentId: residentId });

      // Option 2: Anonymize visitors (recommended)
      const resident = await Resident.findOne({ userId: userId });
      if (resident) {
        await Visitor.updateMany(
          { hostResidentId: resident._id },
          {
            $set: {
              hostResidentId: null,
              hostNote: "Resident account deleted",
            },
          }
        );
      }

      // Delete the user permanently
      await User.findByIdAndDelete(userId);

      return NextResponse.json(
        {
          success: true,
          message: "User permanently deleted",
        },
        { status: 200 }
      );
    } else {
      // SOFT DELETE - Just deactivate
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
    }
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
