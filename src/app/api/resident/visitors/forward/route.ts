import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import Visitor from "@/app/lib/db/models/Visitor";
import User from "@/app/lib/db/models/User";
import Notification from "@/app/lib/db/models/Notification";
import Property from "@/app/lib/db/models/Property";
import { authMiddleware } from "@/app/lib/auth/middleware";
import { sendVisitorApprovalWhatsApp } from "@/app/lib/utils/twilio-whatsapp";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error } = await authMiddleware(request, "resident");
    if (error) return error;

    await connectDB();

    const body = await request.json();
    const { visitorId, forwardToResidentId, note } = body;

    if (!visitorId || !forwardToResidentId) {
      return NextResponse.json(
        {
          success: false,
          error: "Visitor ID and forward-to resident ID are required",
        },
        { status: 400 }
      );
    }

    const userId = user!.id;
    console.log("🔄 Forwarding visitor:", {
      userId,
      visitorId,
      forwardToResidentId,
    });

    // Get current resident
    const currentResident = await User.findById(userId);
    if (!currentResident) {
      return NextResponse.json(
        { success: false, error: "Current resident not found" },
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

    // Get forward-to resident
    const forwardToResident = await User.findOne({
      _id: forwardToResidentId,
      role: "resident",
      isActive: true,
      propertyId: currentResident.propertyId, // Must be same property
    });

    if (!forwardToResident) {
      return NextResponse.json(
        {
          success: false,
          error: "Forward-to resident not found or not in same property",
        },
        { status: 404 }
      );
    }

    // Update visitor with forwarding info
    visitor.isForwarded = true;
    visitor.forwardedFrom = userId as any;
    visitor.forwardedTo = forwardToResidentId as any;
    visitor.forwardedAt = new Date();
    visitor.forwardingNote = note || "";
    visitor.hostResidentId = forwardToResidentId as any; // Change host to new resident
    await visitor.save();

    console.log("✅ Visitor forwarded successfully");

    // ✅ CREATE NOTIFICATION FOR NEW RESIDENT
    try {
      await Notification.create({
        userId: forwardToResidentId,
        title: "Forwarded Visitor Request",
        message: `${
          currentResident.fullName || currentResident.email
        } forwarded visitor ${visitor.name} to you. ${
          note ? `Note: ${note}` : ""
        }`,
        type: "visitor_request",
        propertyId: currentResident.propertyId,
        relatedId: visitor._id,
        isRead: false,
      });
      console.log("✅ Notification created for new resident");
    } catch (notifError) {
      console.error("⚠️ Notification creation failed:", notifError);
    }

    // ✅ SEND WHATSAPP TO NEW RESIDENT
    if (forwardToResident.phoneNumber) {
      try {
        let propertyName = "the property";
        if (currentResident.propertyId) {
          const property = await Property.findById(currentResident.propertyId);
          if (property) propertyName = property.name;
        }

        await sendVisitorApprovalWhatsApp(forwardToResident.phoneNumber, {
          visitorId: visitor._id.toString(),
          visitorName: visitor.name,
          visitorPhone: visitor.phone || "N/A",
          purpose: visitor.purpose,
          unitNumber: forwardToResident.unitNumber || "N/A",
          propertyName,
        });
        console.log("✅ WhatsApp sent to new resident");
      } catch (error) {
        console.error("⚠️ WhatsApp failed:", error);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Visitor request forwarded successfully",
        data: {
          visitorId: visitor._id.toString(),
          forwardedTo: forwardToResident.fullName || forwardToResident.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Forward visitor error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
