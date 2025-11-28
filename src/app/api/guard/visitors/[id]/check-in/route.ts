// =============================================================================
// FIXED: Check-in - Resident gets notification when visitor enters
// File: src/app/api/guard/visitors/[id]/check-in/route.ts
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import Visitor from "@/app/lib/db/models/Visitor";
import User from "@/app/lib/db/models/User";
import Notification from "@/app/lib/db/models/Notification";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;
    const body = await request.json();
    const { guardId } = body;

    console.log("🚪 Check-in request:", { visitorId: id, guardId });

    // Find visitor
    const visitor = await Visitor.findById(id);
    if (!visitor) {
      return NextResponse.json(
        { success: false, error: "Visitor not found" },
        { status: 404 }
      );
    }

    // Check status
    if (visitor.status !== "approved") {
      return NextResponse.json(
        { success: false, error: "Visitor must be approved before check-in" },
        { status: 400 }
      );
    }

    // Update visitor
    visitor.status = "checked_in";
    visitor.checkedInBy = guardId;
    visitor.checkInTime = new Date();
    await visitor.save();

    console.log("✅ Visitor checked in");

    // ✅ FIX 2: NOTIFY RESIDENT THAT VISITOR ENTERED
    if (visitor.hostResidentId) {
      try {
        await Notification.create({
          userId: visitor.hostResidentId,
          title: "Visitor Entered",
          message: `${visitor.name} has entered the property`,
          type: "visitor_checked_in",
          propertyId: visitor.propertyId,
          relatedId: visitor._id,
          isRead: false,
        });
        console.log("✅ Resident notified: Visitor entered");
      } catch (notifError) {
        console.error("⚠️ Notification failed:", notifError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Visitor checked in successfully",
      data: { visitor },
    });
  } catch (error: any) {
    console.error("❌ Check-in error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
