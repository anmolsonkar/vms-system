import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import Visitor from "@/app/lib/db/models/Visitor";
import User from "@/app/lib/db/models/User";
import { authMiddleware } from "@/app/lib/auth/middleware";
import { sendVisitorRejectedWhatsApp } from "@/app/lib/utils/twilio-whatsapp";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error } = await authMiddleware(request, "resident");
    if (error) return error;

    await connectDB();

    const body = await request.json();
    const { visitorId, reason } = body;

    if (!visitorId) {
      return NextResponse.json(
        { success: false, error: "Visitor ID is required" },
        { status: 400 }
      );
    }

    const userId = user!.id;
    console.log("❌ Rejecting visitor:", { userId, visitorId, reason });

    // Get resident user
    const residentUser = await User.findOne({
      _id: userId,
      role: "resident",
      isActive: true,
    }).select("fullName unitNumber phoneNumber propertyId email");

    if (!residentUser) {
      return NextResponse.json(
        { success: false, error: "Resident not found" },
        { status: 404 }
      );
    }

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
      console.log("❌ Unauthorized:", {
        visitorHostId: visitor.hostResidentId.toString(),
        currentUserId: userId,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized - This visitor is not assigned to you",
        },
        { status: 403 }
      );
    }

    // Check if already processed
    if (visitor.status !== "pending") {
      return NextResponse.json(
        { success: false, error: `Visitor already ${visitor.status}` },
        { status: 400 }
      );
    }

    // Update visitor status
    visitor.status = "rejected";
    visitor.rejectedBy = userId as any;
    visitor.rejectedAt = new Date();
    visitor.rejectionReason = reason || "Request declined";
    await visitor.save();

    console.log("✅ Visitor rejected:", visitorId);

    // ========================================================================
    // SEND WHATSAPP REJECTION NOTIFICATION TO VISITOR
    // ========================================================================
    if (visitor.phone) {
      try {
        const rejectionReason = reason || "Request declined by resident";

        const whatsappResult = await sendVisitorRejectedWhatsApp(
          visitor.phone,
          visitor.name,
          rejectionReason
        );

        if (whatsappResult) {
          console.log("✅ WhatsApp rejection sent to visitor:", visitor.phone);
        } else {
          console.log("⚠️ WhatsApp send failed (non-critical)");
        }
      } catch (whatsappError) {
        console.error("⚠️ WhatsApp send error (non-critical):", whatsappError);
        // Don't fail the entire request if WhatsApp fails
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Visitor request rejected",
        data: {
          visitorId: visitor._id.toString(),
          visitorName: visitor.name,
          status: visitor.status,
          rejectedAt: visitor.rejectedAt,
          rejectedBy: residentUser.fullName || residentUser.email,
          rejectionReason: visitor.rejectionReason,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Reject visitor error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
