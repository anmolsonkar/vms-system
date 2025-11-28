import { NextRequest, NextResponse } from "next/server";
import {
  sendVisitorApprovedWhatsApp,
  sendVisitorRejectedWhatsApp,
  notifyGuardWhatsApp,
} from "@/app/lib/utils/twilio-whatsapp";
import Notification from "@/app/lib/db/models/Notification";
import Property from "@/app/lib/db/models/Property"; // ✅ ADDED
import connectDB from "@/app/lib/db/mongoose";
import Visitor from "@/app/lib/db/models/Visitor";
import User from "@/app/lib/db/models/User";

export const dynamic = "force-dynamic";

async function notifyGuardOfApproval(
  guardId: string,
  visitorId: string,
  visitorName: string,
  residentName: string,
  unitNumber: string,
  propertyId: string
): Promise<void> {
  try {
    await Notification.create({
      userId: guardId,
      title: "Visitor Approved",
      message: `Visitor ${visitorName} approved by ${residentName} (Unit ${unitNumber})`,
      type: "visitor_approved",
      propertyId,
      relatedId: visitorId,
      isRead: false,
    });
    console.log("✅ In-app notification sent to guard:", guardId);
  } catch (error) {
    console.error("❌ Failed to notify guard:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("\n" + "=".repeat(70));
    console.log("📨 WhatsApp Webhook Received");
    console.log("=".repeat(70));

    const formData = await request.formData();
    const body = Object.fromEntries(formData);

    console.log("📦 Webhook Body:", {
      From: body.From,
      Body: body.Body,
      MessageSid: body.MessageSid,
    });

    const from = body.From as string;
    const messageBody = (body.Body as string)?.trim().toUpperCase();

    if (!from || !messageBody) {
      console.log("❌ Missing From or Body");
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Invalid request.</Message>
</Response>`,
        { headers: { "Content-Type": "text/xml" } }
      );
    }

    const phoneMatch = from.match(/whatsapp:\+91(\d{10})/);
    if (!phoneMatch) {
      console.log("❌ Invalid phone format:", from);
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Invalid phone number format.</Message>
</Response>`,
        { headers: { "Content-Type": "text/xml" } }
      );
    }

    const phoneNumber = phoneMatch[1];
    console.log("📱 Extracted phone:", phoneNumber);

    await connectDB();

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
  <Message>⚠️ Resident account not found.</Message>
</Response>`,
        { headers: { "Content-Type": "text/xml" } }
      );
    }

    console.log("✅ Resident found:", {
      id: resident._id,
      name: resident.fullName || resident.email,
    });

    const visitor = await Visitor.findOne({
      hostResidentId: resident._id,
      status: "pending",
    })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!visitor) {
      console.log("❌ No pending visitor found");
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>⚠️ No pending visitor requests found.</Message>
</Response>`,
        { headers: { "Content-Type": "text/xml" } }
      );
    }

    console.log("✅ Pending visitor found:", {
      id: visitor._id,
      name: visitor.name,
      phone: visitor.phone,
    });

    // =============================================================================
    // APPROVE
    // =============================================================================
    if (
      messageBody === "APPROVE" ||
      messageBody === "YES" ||
      messageBody === "ACCEPT" ||
      messageBody === "OK"
    ) {
      console.log("✅ Processing APPROVAL...");

      visitor.status = "approved";
      visitor.approvedBy = resident._id;
      visitor.approvedAt = new Date();
      await visitor.save();

      console.log("✅ Visitor approved in database");

      // Get property name
      let propertyName = "the property";
      if (visitor.propertyId) {
        const property = await Property.findById(visitor.propertyId);
        if (property) propertyName = property.name;
      }

      // ✅ Send WhatsApp to visitor
      const approvalSent = await sendVisitorApprovedWhatsApp(
        visitor.phone,
        visitor.name,
        resident.fullName || resident.email,
        visitor.hostUnitNumber || "N/A"
      );

      if (approvalSent) {
        console.log("✅ Approval WhatsApp sent to visitor");
      } else {
        console.log("⚠️ Failed to send approval WhatsApp");
      }

      // ✅ Notify guards
      if (visitor.propertyId) {
        const guards = await User.find({
          role: "guard",
          propertyId: visitor.propertyId,
          isActive: true,
        });

        console.log(`📢 Notifying ${guards.length} guards...`);

        for (const guard of guards) {
          await notifyGuardOfApproval(
            guard._id.toString(),
            visitor._id.toString(),
            visitor.name,
            resident.fullName || resident.email,
            visitor.hostUnitNumber || "N/A",
            visitor.propertyId.toString()
          );

          if (guard.phoneNumber) {
            await notifyGuardWhatsApp(
              guard.phoneNumber,
              visitor.name,
              resident.fullName || resident.email,
              visitor.hostUnitNumber || "N/A"
            );
          }
        }

        console.log("✅ All guards notified");
      }

      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>✅ *Visitor Approved!*

*Visitor:* ${visitor.name}
*Phone:* ${visitor.phone}

The visitor has been notified and guards alerted.

Thank you! 🙏</Message>
</Response>`,
        { headers: { "Content-Type": "text/xml" } }
      );
    }

    // =============================================================================
    // REJECT
    // =============================================================================
    else if (
      messageBody === "REJECT" ||
      messageBody === "NO" ||
      messageBody === "DECLINE" ||
      messageBody === "DENIED"
    ) {
      console.log("❌ Processing REJECTION...");

      visitor.status = "rejected";
      visitor.rejectedBy = resident._id;
      visitor.rejectedAt = new Date();
      visitor.rejectionReason = "Declined via WhatsApp";
      await visitor.save();

      console.log("✅ Visitor rejected in database");

      // ✅ Send WhatsApp to visitor
      const rejectionSent = await sendVisitorRejectedWhatsApp(
        visitor.phone,
        visitor.name,
        "Declined via WhatsApp"
      );

      if (rejectionSent) {
        console.log("✅ Rejection WhatsApp sent to visitor");
      } else {
        console.log("⚠️ Failed to send rejection WhatsApp");
      }

      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>❌ *Visitor Declined*

*Visitor:* ${visitor.name}
*Phone:* ${visitor.phone}

The visitor has been notified.

Thank you! 🙏</Message>
</Response>`,
        { headers: { "Content-Type": "text/xml" } }
      );
    }

    // =============================================================================
    // INVALID
    // =============================================================================
    else {
      console.log("⚠️ Invalid response:", messageBody);
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>⚠️ *Invalid Response*

Pending visitor: *${visitor.name}* (${visitor.phone})

Reply with:
✅ *APPROVE* - to allow
❌ *REJECT* - to decline</Message>
</Response>`,
        { headers: { "Content-Type": "text/xml" } }
      );
    }
  } catch (error: any) {
    console.error("❌ Webhook error:", error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>⚠️ Error occurred. Please use the VMS app.</Message>
</Response>`,
      { status: 500, headers: { "Content-Type": "text/xml" } }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "WhatsApp Webhook is active",
    endpoint: "/api/webhooks/whatsapp",
  });
}
