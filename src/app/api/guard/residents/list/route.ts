import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import User from "@/app/lib/db/models/User";
import Resident from "@/app/lib/db/models/Resident";
import { authMiddleware } from "@/app/lib/auth/middleware";

export async function GET(request: NextRequest) {
  try {
    // Authenticate guard
    const { user, error } = await authMiddleware(request, "guard");
    if (error) return error;

    await connectDB();

    // Get all residents in the same property as the guard
    const residents = await User.find({
      role: "resident",
      propertyId: user!.propertyId,
      isActive: true,
    })
      .select("-password")
      .lean();

    // Get resident details for each resident user
    const residentsWithDetails = await Promise.all(
      residents.map(async (u) => {
        const resident = await Resident.findOne({ userId: u._id }).lean();
        return {
          _id: resident?._id || u._id,
          userId: u._id,
          fullName: resident?.name || u.fullName,
          email: resident?.email || u.email,
          unitNumber: resident?.unitNumber || "",
          phoneNumber: resident?.phone || "",
          alternatePhone: resident?.alternatePhone,
          numberOfMembers: resident?.numberOfMembers,
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          residents: residentsWithDetails,
          count: residentsWithDetails.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get residents list error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
