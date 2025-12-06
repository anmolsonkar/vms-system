import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import Visitor from "@/app/lib/db/models/Visitor";
import { authMiddleware } from "@/app/lib/auth/middleware";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Use authMiddleware from your existing setup
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

    // Find visitor
    const visitor = await Visitor.findById(visitorId)
      .populate("hostResidentId", "_id fullName unitNumber")
      .populate("forwardedFrom", "_id fullName unitNumber")
      .populate("forwardedTo", "_id fullName unitNumber");

    if (!visitor) {
      return NextResponse.json(
        { success: false, error: "Visitor not found" },
        { status: 404 }
      );
    }

    // Check if visitor is checked in
    if (visitor.status !== "checked_in") {
      return NextResponse.json(
        {
          success: false,
          error: `Visitor is not checked in. Current status: ${visitor.status}`,
        },
        { status: 400 }
      );
    }

    // Check authorization - FIXED: Respect forwarding
    let isAuthorized = false;
    let currentHostId = "";

    if (visitor.isForwarded && visitor.forwardedTo) {
      // If forwarded, only the person it was forwarded TO can mark exit
      currentHostId =
        visitor.forwardedTo._id?.toString() || visitor.forwardedTo.toString();
      if (currentHostId === user._id.toString()) {
        isAuthorized = true;
      }
    } else {
      // If not forwarded, original host can mark exit
      currentHostId =
        visitor.hostResidentId._id?.toString() ||
        visitor.hostResidentId.toString();
      if (currentHostId === user._id.toString()) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          error: visitor.isForwarded
            ? "This visitor was forwarded. Only the current host can mark exit."
            : "You are not authorized to mark exit for this visitor",
        },
        { status: 403 }
      );
    }

    const now = new Date();

    // Update visitor status and store exit time
    visitor.status = "checked_out";
    visitor.markedExitBy = user._id;
    visitor.markedExitAt = now;
    visitor.actualCheckOutTime = now;
    visitor.checkOutTime = now; // ✅ For analytics compatibility
    visitor.checkedOutBy = user._id;

    await visitor.save();

    console.log("✅ Visitor marked as exited:", {
      visitorId: visitor._id,
      name: visitor.name,
      markedBy: user.fullName,
      checkOutTime: now,
    });

    return NextResponse.json({
      success: true,
      message: "Visitor marked as exited successfully",
      data: {
        visitor: {
          _id: visitor._id,
          name: visitor.name,
          status: visitor.status,
          checkInTime: visitor.checkInTime,
          checkOutTime: now,
          markedExitAt: now,
          markedExitBy: user.fullName,
        },
      },
    });
  } catch (error: any) {
    console.error("❌ Mark exit error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to mark visitor as exited",
      },
      { status: 500 }
    );
  }
}
