import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import Visitor from "@/app/lib/db/models/Visitor";
import { authMiddleware } from "@/app/lib/auth/middleware";

export async function GET(request: NextRequest) {
  try {
    // Authenticate resident
    const { user, error } = await authMiddleware(request, "resident");
    if (error) return error;

    await connectDB();

    const userId = user!.id;
    console.log("🔍 Fetching pending visitors for resident:", userId);

    // Get pending visitors for this resident
    const visitors = await Visitor.find({
      hostResidentId: userId,
      status: "pending",
    })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Found ${visitors.length} pending visitors`);

    return NextResponse.json(
      {
        success: true,
        data: {
          visitors,
          count: visitors.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Get pending visitors error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
