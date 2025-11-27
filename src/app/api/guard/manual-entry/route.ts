import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import User from "@/app/lib/db/models/User";
import Visitor from "@/app/lib/db/models/Visitor";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      name,
      phone,
      purpose,
      hostResidentId,
      vehicleNumber,
      idCardImageUrl,
      photoUrl,
      isWalkIn = true,
      phoneVerified = true,
    } = body;

    console.log("📝 Manual Entry Request:", { name, phone, hostResidentId });

    // Validate required fields
    if (!name || !phone || !purpose || !hostResidentId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if resident exists in users collection
    const resident = await User.findOne({
      _id: hostResidentId,
      role: "resident",
      isActive: true,
    }).select("_id fullName phoneNumber unitNumber email propertyId");

    if (!resident) {
      console.log("❌ Resident not found or inactive:", hostResidentId);
      return NextResponse.json(
        {
          success: false,
          error: "Resident not found. Please select a valid resident.",
        },
        { status: 404 }
      );
    }

    console.log("✅ Resident found:", resident.fullName);

    // Prepare visitor data matching your schema
    const visitorData: any = {
      name,
      phone,
      purpose,
      hostResidentId: resident._id, // Use the correct field name from your schema
      propertyId: resident.propertyId,
      status: "pending", // Waiting for resident approval
      phoneVerified,
      isWalkIn,
    };

    // Add optional fields only if provided
    if (vehicleNumber) {
      visitorData.vehicleNumber = vehicleNumber;
    }

    // Handle photo - use provided photo or a placeholder
    if (photoUrl) {
      visitorData.photoUrl = photoUrl;
    } else if (idCardImageUrl) {
      visitorData.photoUrl = idCardImageUrl; // Use ID card as photo if no separate photo
    } else {
      // If no photo at all, set a placeholder or mark as optional
      visitorData.photoUrl =
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3ENo Photo%3C/text%3E%3C/svg%3E";
    }

    if (idCardImageUrl) {
      visitorData.idCardImageUrl = idCardImageUrl;
    }

    // Don't set createdBy as ObjectId, let it be undefined or remove it
    // The schema might auto-populate this

    // Create visitor entry
    const visitor = await Visitor.create(visitorData);

    console.log("✅ Visitor entry created:", visitor._id);

    // TODO: Send notification to resident
    // You can add WhatsApp/SMS/Email notification here
    // Example: await sendApprovalNotification(resident.phoneNumber, visitor);

    return NextResponse.json(
      {
        success: true,
        message: "Approval request sent to resident",
        data: {
          visitorId: visitor._id,
          status: "pending",
          resident: {
            name: resident.fullName,
            unitNumber: resident.unitNumber,
          },
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Manual entry error:", error);

    // Better error messages
    let errorMessage = "Failed to create visitor entry";
    if (error.name === "ValidationError") {
      const errors = Object.keys(error.errors).map(
        (key) => error.errors[key].message
      );
      errorMessage = errors.join(", ");
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error.message,
      },
      { status: 500 }
    );
  }
}
