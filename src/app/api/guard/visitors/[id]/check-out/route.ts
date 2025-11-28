// =============================================================================
// CHECK-OUT VISITOR - WITH RESIDENT NOTIFICATION
// File: src/app/api/guard/visitors/[id]/check-out/route.ts
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

    console.log("🚪 Check-out request:", { visitorId: id, guardId });

    const visitor = await Visitor.findById(id);
    if (!visitor) {
      return NextResponse.json(
        { success: false, error: "Visitor not found" },
        { status: 404 }
      );
    }

    if (visitor.status !== "checked_in") {
      return NextResponse.json(
        { success: false, error: "Visitor must be checked in" },
        { status: 400 }
      );
    }

    // Check out visitor
    visitor.status = "checked_out";
    visitor.checkedOutBy = guardId;
    visitor.actualCheckOutTime = new Date();
    await visitor.save();

    console.log("✅ Visitor checked out");

    // ✅ NOTIFY RESIDENT THAT VISITOR LEFT
    if (visitor.hostResidentId) {
      await Notification.create({
        userId: visitor.hostResidentId,
        title: "Visitor Left",
        message: `${visitor.name} has left the property`,
        type: "visitor_checked_out",
        propertyId: visitor.propertyId,
        relatedId: visitor._id,
        isRead: false,
      });
      console.log("✅ Resident notified of check-out");
    }

    return NextResponse.json({
      success: true,
      message: "Visitor checked out successfully",
      data: { visitor },
    });
  } catch (error: any) {
    console.error("❌ Check-out error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
