// =============================================================================
// FIXED: Rejection - Guard gets notification when resident rejects
// File: src/app/api/resident/visitors/[id]/reject/route.ts
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import Visitor from "@/app/lib/db/models/Visitor";
import User from "@/app/lib/db/models/User";
import Notification from "@/app/lib/db/models/Notification";
import { sendVisitorRejectedWhatsApp } from "@/app/lib/utils/twilio-whatsapp";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;
    const body = await request.json();
    const { residentId, reason } = body;

    console.log("❌ Rejection request:", { visitorId: id, residentId, reason });

    // Find visitor
    const visitor = await Visitor.findById(id);
    if (!visitor) {
      return NextResponse.json(
        { success: false, error: "Visitor not found" },
        { status: 404 }
      );
    }

    // Check status
    if (visitor.status !== "pending") {
      return NextResponse.json(
        { success: false, error: "Only pending visitors can be rejected" },
        { status: 400 }
      );
    }

    // Get resident info
    const resident = await User.findById(residentId);

    // Update visitor
    visitor.status = "rejected";
    visitor.rejectedBy = residentId;
    visitor.rejectedAt = new Date();
    visitor.rejectionReason = reason || "Declined by resident";
    await visitor.save();

    console.log("✅ Visitor rejected");

    // Send WhatsApp to visitor
    if (visitor.phone) {
      try {
        await sendVisitorRejectedWhatsApp(
          visitor.phone,
          visitor.name,
          reason || "Declined by resident"
        );
        console.log("✅ Rejection WhatsApp sent to visitor");
      } catch (error) {
        console.error("⚠️ WhatsApp failed:", error);
      }
    }

    // ✅ FIX 3: NOTIFY GUARD ABOUT REJECTION
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
            title: "Visitor Rejected",
            message: `${resident?.fullName || "Resident"} rejected visitor ${
              visitor.name
            }`,
            type: "visitor_rejected",
            propertyId: visitor.propertyId,
            relatedId: visitor._id,
            isRead: false,
          });
        }

        console.log(`✅ ${guards.length} guards notified of rejection`);
      } catch (notifError) {
        console.error("⚠️ Guard notification failed:", notifError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Visitor request rejected",
      data: { visitor },
    });
  } catch (error: any) {
    console.error("❌ Rejection error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
