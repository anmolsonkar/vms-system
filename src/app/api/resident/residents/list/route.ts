export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import User from "@/app/lib/db/models/User";
import { authMiddleware } from "@/app/lib/auth/middleware";

export async function GET(request: NextRequest) {
  try {
    // Authenticate resident
    const { user, error } = await authMiddleware(request, "resident");
    if (error) return error;

    await connectDB();

    const userId = user!.id;
    console.log("🔍 Fetching residents for forwarding:", userId);

    // Get current resident to check property
    const currentResident = await User.findById(userId);
    if (!currentResident) {
      return NextResponse.json(
        { success: false, error: "Current resident not found" },
        { status: 404 }
      );
    }

    // Get all residents in same property except current user
    const residents = await User.find({
      role: "resident",
      propertyId: currentResident.propertyId,
      isActive: true,
      _id: { $ne: userId }, // Exclude current user
    })
      .select("fullName phoneNumber unitNumber email")
      .sort({ fullName: 1 })
      .lean();

    console.log(`✅ Found ${residents.length} residents for forwarding`);

    return NextResponse.json(
      {
        success: true,
        data: {
          residents: residents.map((r) => ({
            _id: r._id,
            fullName: r.fullName,
            phoneNumber: r.phoneNumber,
            unitNumber: r.unitNumber,
            email: r.email,
          })),
        },
        count: residents.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Fetch residents error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch residents",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
