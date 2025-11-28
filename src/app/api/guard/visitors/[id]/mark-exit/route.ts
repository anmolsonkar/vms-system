// =============================================================================
// FIXED: Mark Exit - Guard gets notification when resident marks exit
// File: src/app/api/resident/visitors/[id]/mark-exit/route.ts
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
    const { residentId } = body;

    console.log("🚪 Mark exit request:", { visitorId: id, residentId });

    // Find visitor
    const visitor = await Visitor.findById(id);
    if (!visitor) {
      return NextResponse.json(
        { success: false, error: "Visitor not found" },
        { status: 404 }
      );
    }

    // Check status
    if (visitor.status !== "checked_in") {
      return NextResponse.json(
        { success: false, error: "Visitor must be checked in to mark exit" },
        { status: 400 }
      );
    }

    // Get resident info
    const resident = await User.findById(residentId);

    // Mark exit
    visitor.markedExitBy = residentId;
    visitor.markedExitAt = new Date();
    await visitor.save();

    console.log("✅ Exit marked by resident");

    // ✅ FIX 4: NOTIFY ALL GUARDS TO VERIFY AT GATE
    if (visitor.propertyId) {
      try {
        const guards = await User.find({
          role: "guard",
          propertyId: visitor.propertyId,
          isActive: true,
        });

        for (const guard of guards) {
          await Notification.create({
            userId: guard._id,
            title: "Visitor Exit Marked",
            message: `${resident?.fullName || "Resident"} marked ${
              visitor.name
            } as exited - Verify at gate`,
            type: "visitor_exit_marked",
            propertyId: visitor.propertyId,
            relatedId: visitor._id,
            isRead: false,
          });
        }

        console.log(`✅ ${guards.length} guards notified of exit marking`);
      } catch (notifError) {
        console.error("⚠️ Guard notification failed:", notifError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Exit marked. Guard will verify at gate.",
      data: { visitor },
    });
  } catch (error: any) {
    console.error("❌ Mark exit error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
