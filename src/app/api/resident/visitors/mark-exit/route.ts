import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import Visitor from "@/app/lib/db/models/Visitor";
import User from "@/app/lib/db/models/User";
import { authMiddleware } from "@/app/lib/auth/middleware";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error } = await authMiddleware(request, "resident");
    if (error) return error;

    await connectDB();

    const body = await request.json();
    const { visitorId } = body;

    if (!visitorId) {
      return NextResponse.json(
        { success: false, error: "Visitor ID is required" },
        { status: 400 }
      );
    }

    const userId = user!.id;
    console.log("🚪 Marking visitor exit:", { userId, visitorId });

    // Get visitor
    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return NextResponse.json(
        { success: false, error: "Visitor not found" },
        { status: 404 }
      );
    }

    // Verify visitor belongs to this resident
    if (visitor.hostResidentId.toString() !== userId) {
      console.log("❌ Unauthorized");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if visitor is checked_in
    if (visitor.status !== "checked_in") {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot mark exit. Visitor status is: ${visitor.status}`,
        },
        { status: 400 }
      );
    }

    // Update status to checked_out
    visitor.status = "checked_out";
    visitor.checkOutTime = new Date();
    await visitor.save();

    console.log("✅ Visitor checked out:", visitorId);

    return NextResponse.json(
      {
        success: true,
        message: "Visitor checked out successfully",
        data: {
          visitorId: visitor._id.toString(),
          visitorName: visitor.name,
          status: "checked_out",
          checkOutTime: visitor.checkOutTime,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Mark exit error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
