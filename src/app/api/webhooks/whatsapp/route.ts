import { NextRequest, NextResponse } from "next/server";
import {
  sendVisitorApprovedWhatsApp,
  sendVisitorRejectedWhatsApp,
  notifyGuardWhatsApp,
} from "@/app/lib/utils/twilio-whatsapp";
import Notification from "@/app/lib/db/models/Notification";
import connectDB from "@/app/lib/db/mongoose";
import Visitor from "@/app/lib/db/models/Visitor";
import User from "@/app/lib/db/models/User";

export const dynamic = "force-dynamic";

// =============================================================================
// HELPER: Send in-app notification to guard (same as app)
// =============================================================================
async function notifyGuardOfApproval(
  guardId: string,
  visitorId: string,
  visitorName: string,
  residentName: string,
  unitNumber: string
): Promise<void> {
  try {
    await Notification.create({
      userId: guardId,
      message: `Visitor ${visitorName} approved by ${residentName} (Unit ${unitNumber})`,
      type: "visitor_approved",
      relatedId: visitorId,
      isRead: false,
    });
    console.log("✅ In-app notification sent to guard:", guardId);
  } catch (error) {
    console.error("❌ Failed to notify guard:", error);
  }
}

// =============================================================================
// MAIN WEBHOOK HANDLER
// =============================================================================
export async function POST(request: NextRequest) {
  try {
    console.log("\n" + "=".repeat(70));
    console.log("📨 WhatsApp Webhook Received");
    console.log("=".repeat(70));

    // Parse Twilio webhook data (application/x-www-form-urlencoded)
    const formData = await request.formData();
    const body = Object.fromEntries(formData);

    console.log("📦 Webhook Body:", {
      From: body.From,
      Body: body.Body,
      MessageSid: body.MessageSid,
    });

    const from = body.From as string; // e.g., "whatsapp:+919311377754"
    const messageBody = (body.Body as string)?.trim().toUpperCase(); // ✅ Converts to uppercase, so "approve", "Approve", "APPROVE" all work

    if (!from || !messageBody) {
      console.log("❌ Missing From or Body");
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Invalid request. Missing phone number or message.</Message>
</Response>`,
        {
          headers: { "Content-Type": "text/xml" },
        }
      );
    }

    // Extract phone number from WhatsApp format
    // "whatsapp:+919311377754" → "9311377754"
    const phoneMatch = from.match(/whatsapp:\+91(\d{10})/);
    if (!phoneMatch) {
      console.log("❌ Invalid phone format:", from);
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Invalid phone number format.</Message>
</Response>`,
        {
          headers: { "Content-Type": "text/xml" },
        }
      );
    }

    const phoneNumber = phoneMatch[1]; // "9311377754"
    console.log("📱 Extracted phone:", phoneNumber);

    // Connect to database
    await connectDB();

    // Find resident by phone number
    const resident = await User.findOne({
      phoneNumber,
      role: "resident",
      isActive: true,
    });

    if (!resident) {
      console.log("❌ Resident not found for phone:", phoneNumber);
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>⚠️ Resident account not found. Please contact support.</Message>
</Response>`,
        {
          headers: { "Content-Type": "text/xml" },
        }
      );
    }

    console.log("✅ Resident found:", {
      id: resident._id,
      name: resident.fullName || resident.email,
      phone: resident.phoneNumber,
    });

    // Find the most recent pending visitor for this resident
    const visitor = await Visitor.findOne({
      hostResidentId: resident._id,
      status: "pending",
    })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!visitor) {
      console.log("❌ No pending visitor found for resident:", resident._id);
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>⚠️ No pending visitor requests found. All visitors may already be processed.</Message>
</Response>`,
        {
          headers: { "Content-Type": "text/xml" },
        }
      );
    }

    console.log("✅ Pending visitor found:", {
      id: visitor._id,
      name: visitor.name,
      phone: visitor.phoneNumber,
      purpose: visitor.purpose,
    });

    // =============================================================================
    // PROCESS APPROVE
    // =============================================================================
    if (
      messageBody === "APPROVE" ||
      messageBody === "YES" ||
      messageBody === "ACCEPT" ||
      messageBody === "OK"
    ) {
      console.log("✅ Processing APPROVAL via WhatsApp...");

      // ✅ UPDATE VISITOR STATUS (same as app)
      visitor.status = "approved";
      visitor.approvedBy = resident._id;
      visitor.approvedAt = new Date();
      await visitor.save();

      console.log("✅ Visitor approved in database");

      // Get property name for better messaging
      let propertyName = "the property";
      if (visitor.propertyId) {
        const property = await Property.findById(visitor.propertyId);
        if (property) {
          propertyName = property.name;
        }
      }

      // ✅ SEND WHATSAPP TO VISITOR (same as app)
      const approvalSent = await sendVisitorApprovedWhatsApp(
        visitor.phoneNumber,
        visitor.name,
        resident.fullName || resident.email,
        visitor.hostUnitNumber || "N/A",
        propertyName
      );

      if (approvalSent) {
        console.log("✅ Approval WhatsApp sent to visitor");
      } else {
        console.log("⚠️ Failed to send approval WhatsApp to visitor");
      }

      // ✅ NOTIFY ALL GUARDS AT PROPERTY (same as app)
      if (visitor.propertyId) {
        // Find all active guards at this property
        const guards = await User.find({
          role: "guard",
          propertyId: visitor.propertyId,
          isActive: true,
        });

        console.log(`📢 Notifying ${guards.length} guards...`);

        for (const guard of guards) {
          // Send in-app notification
          await notifyGuardOfApproval(
            guard._id.toString(),
            visitor._id.toString(),
            visitor.name,
            resident.fullName || resident.email,
            visitor.hostUnitNumber || "N/A"
          );

          // Send WhatsApp notification if guard has phone
          if (guard.phoneNumber) {
            await notifyGuardWhatsApp(
              guard.phoneNumber,
              visitor.name,
              resident.fullName || resident.email,
              visitor.hostUnitNumber || "N/A"
            );
          }
        }

        console.log("✅ All guards notified (in-app + WhatsApp)");
      }

      // ✅ SEND CONFIRMATION TO RESIDENT
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>✅ *Visitor Approved Successfully!*

*Visitor:* ${visitor.name}
*Phone:* ${visitor.phoneNumber}

The visitor has been notified via WhatsApp and guards have been alerted.

Thank you! 🙏</Message>
</Response>`,
        {
          headers: { "Content-Type": "text/xml" },
        }
      );
    }

    // =============================================================================
    // PROCESS REJECT
    // =============================================================================
    else if (
      messageBody === "REJECT" ||
      messageBody === "NO" ||
      messageBody === "DECLINE" ||
      messageBody === "DENIED"
    ) {
      console.log("❌ Processing REJECTION via WhatsApp...");

      // ✅ UPDATE VISITOR STATUS (same as app)
      visitor.status = "rejected";
      visitor.rejectedBy = resident._id;
      visitor.rejectedAt = new Date();
      visitor.rejectionReason = "Declined via WhatsApp";
      await visitor.save();

      console.log("✅ Visitor rejected in database");

      // ✅ SEND WHATSAPP TO VISITOR (same as app)
      const rejectionSent = await sendVisitorRejectedWhatsApp(
        visitor.phoneNumber,
        visitor.name,
        "Declined via WhatsApp"
      );

      if (rejectionSent) {
        console.log("✅ Rejection WhatsApp sent to visitor");
      } else {
        console.log("⚠️ Failed to send rejection WhatsApp to visitor");
      }

      // ✅ SEND CONFIRMATION TO RESIDENT
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>❌ *Visitor Request Declined*

*Visitor:* ${visitor.name}
*Phone:* ${visitor.phoneNumber}

The visitor has been notified about the rejection.

Thank you! 🙏</Message>
</Response>`,
        {
          headers: { "Content-Type": "text/xml" },
        }
      );
    }

    // =============================================================================
    // INVALID RESPONSE
    // =============================================================================
    else {
      console.log("⚠️ Invalid response:", messageBody);
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>⚠️ *Invalid Response*

You have a pending visitor request from:
*${visitor.name}* (${visitor.phoneNumber})

Please reply with one of these:
✅ *APPROVE* - to allow entry
❌ *REJECT* - to decline

You can also use the VMS app.</Message>
</Response>`,
        {
          headers: { "Content-Type": "text/xml" },
        }
      );
    }
  } catch (error: any) {
    console.error("❌ Webhook error:", error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>⚠️ An error occurred processing your request. Please try again or use the VMS app.</Message>
</Response>`,
      {
        status: 500,
        headers: { "Content-Type": "text/xml" },
      }
    );
  }
}

// =============================================================================
// GET handler for testing
// =============================================================================
export async function GET() {
  return NextResponse.json({
    message: "WhatsApp Webhook is active",
    endpoint: "/api/webhooks/whatsapp",
    method: "POST",
    description: "Handles APPROVE/REJECT responses from residents via WhatsApp",
  });
}
