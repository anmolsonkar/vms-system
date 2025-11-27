import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import Visitor from "@/app/lib/db/models/Visitor";
import User from "@/app/lib/db/models/User";
import { authMiddleware } from "@/app/lib/auth/middleware";
import { sendVisitorRejectedNotification } from "@/app/lib/utils/whatsapp";
import { sendRejectionSMS } from "@/app/lib/utils/sms";

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
    }).select("fullName unitNumber phoneNumber propertyId");

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

    // Send SMS/WhatsApp to visitor
    if (visitor.phone) {
      try {
        await sendRejectionSMS(visitor.phone, visitor.name, reason);
        await sendVisitorRejectedNotification(
          visitor.phone,
          visitor.name,
          reason
        );
        console.log("✅ Rejection notifications sent");
      } catch (error) {
        console.error("Notification send error:", error);
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
