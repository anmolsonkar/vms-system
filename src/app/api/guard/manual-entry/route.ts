// =============================================================================
// FIXED: Manual Entry - Resident gets notification
// File: src/app/api/guard/manual-entry/route.ts
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import User from "@/app/lib/db/models/User";
import Visitor from "@/app/lib/db/models/Visitor";
import Property from "@/app/lib/db/models/Property";
import Notification from "@/app/lib/db/models/Notification";
import { sendVisitorApprovalWhatsApp } from "@/app/lib/utils/twilio-whatsapp";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const phoneNumber = body.phoneNumber || body.phone;
    const { name, hostResidentId, purpose, idProof, photoUrl, vehicleNumber } =
      body;

    console.log("📝 Manual Entry Request:", {
      name,
      phone: phoneNumber,
      hostResidentId,
      purpose,
    });

    // Validation
    if (!name || !phoneNumber || !hostResidentId || !purpose) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find resident
    const resident = await User.findOne({
      _id: hostResidentId,
      role: "resident",
      isActive: true,
    }).select("_id fullName phoneNumber unitNumber email propertyId");

    if (!resident) {
      console.log("❌ Resident not found");
      return NextResponse.json(
        { success: false, error: "Resident not found" },
        { status: 404 }
      );
    }

    console.log("✅ Resident found:", resident.fullName);

    // Get property name
    let propertyName = "the property";
    if (resident.propertyId) {
      const property = await Property.findById(resident.propertyId);
      if (property) propertyName = property.name;
    }

    // Create visitor
    const visitorData: any = {
      name,
      phone: phoneNumber,
      purpose,
      hostResidentId: resident._id,
      hostResidentName: resident.fullName,
      hostUnitNumber: resident.unitNumber,
      hostPhone: resident.phoneNumber,
      propertyId: resident.propertyId,
      status: "pending",
      phoneVerified: true,
      isWalkIn: true,
      photoUrl: photoUrl || "/images/default-visitor-photo.png",
    };

    if (vehicleNumber) visitorData.vehicleNumber = vehicleNumber;
    if (idProof) visitorData.idCardImageUrl = idProof;

    const visitor = await Visitor.create(visitorData);
    console.log("✅ Visitor created:", visitor._id);

    // ✅ FIX 1: CREATE NOTIFICATION FOR RESIDENT
    try {
      await Notification.create({
        userId: resident._id,
        title: "New Visitor Request",
        message: `${name} is requesting approval for ${purpose}`,
        type: "visitor_request",
        propertyId: resident.propertyId,
        relatedId: visitor._id,
        isRead: false,
      });
      console.log("✅ Notification created for resident");
    } catch (notifError) {
      console.error("⚠️ Notification creation failed:", notifError);
    }

    // Send WhatsApp
    if (resident.phoneNumber) {
      try {
        await sendVisitorApprovalWhatsApp(resident.phoneNumber, {
          visitorId: visitor._id.toString(),
          visitorName: visitor.name,
          visitorPhone: visitor.phone,
          purpose: visitor.purpose,
          unitNumber: resident.unitNumber,
          propertyName,
        });
        console.log("✅ WhatsApp sent to resident");
      } catch (error) {
        console.error("⚠️ WhatsApp failed:", error);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Visitor entry created. Approval request sent.",
        data: {
          visitorId: visitor._id,
          status: "pending",
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Manual entry error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
