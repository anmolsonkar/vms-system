import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import Property from "@/app/lib/db/models/Property";
import { authMiddleware } from "@/app/lib/auth/middleware";
import { generatePropertyQRCode } from "@/app/lib/utils/qr-generator";

export async function POST(request: NextRequest) {
  try {
    // Authenticate superadmin
    const { user, error } = await authMiddleware(request, "superadmin");
    if (error) return error;

    await connectDB();

    const body = await request.json();

    // Log received data
    console.log("Received property data:", JSON.stringify(body, null, 2));

    // Validate required fields
    if (
      !body.name ||
      typeof body.name !== "string" ||
      body.name.trim().length < 3
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Property name must be at least 3 characters",
        },
        { status: 400 }
      );
    }

    if (
      !body.type ||
      !["apartment", "warehouse", "rwa", "office"].includes(body.type)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid property type" },
        { status: 400 }
      );
    }

    if (!body.address || typeof body.address !== "object") {
      return NextResponse.json(
        { success: false, error: "Address is required" },
        { status: 400 }
      );
    }

    if (
      !body.address.street ||
      !body.address.city ||
      !body.address.state ||
      !body.address.pincode
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Complete address required (street, city, state, pincode)",
        },
        { status: 400 }
      );
    }

    if (!/^[0-9]{6}$/.test(body.address.pincode)) {
      return NextResponse.json(
        { success: false, error: "Pincode must be 6 digits" },
        { status: 400 }
      );
    }

    // Create property data (without contact person requirement)
    const propertyData = {
      name: body.name.trim(),
      type: body.type,
      address: {
        street: body.address.street.trim(),
        city: body.address.city.trim(),
        state: body.address.state.trim(),
        pincode: body.address.pincode.trim(),
        country: body.address.country || "India",
      },
      contactPerson: {
        name: body.contactPerson?.name || "Admin",
        phone: body.contactPerson?.phone || "0000000000",
        email: body.contactPerson?.email || "admin@property.com",
      },
      totalUnits: body.totalUnits ? parseInt(body.totalUnits) : undefined,
      createdBy: user!.id,
      isActive: true,
    };

    console.log(
      "Creating property with data:",
      JSON.stringify(propertyData, null, 2)
    );

    // Create property
    const property = await Property.create(propertyData);

    console.log("✅ Property created successfully:", property._id);

    // Generate QR code (non-critical)
    let qrCodeUrl = null;
    try {
      const qrResult = await generatePropertyQRCode(
        property._id.toString(),
        property.name
      );

      if (qrResult.success && qrResult.qrCodeUrl) {
        property.qrCode = qrResult.qrCodeUrl;
        await property.save();
        qrCodeUrl = qrResult.qrCodeUrl;
        console.log("✅ QR Code generated:", qrCodeUrl);
      }
    } catch (qrError) {
      console.error("⚠️ QR generation failed (non-critical):", qrError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Property created successfully",
        data: {
          propertyId: property._id.toString(),
          name: property.name,
          type: property.type,
          address: property.address,
          qrCode: qrCodeUrl,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Create property error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "Property name already exists" },
        { status: 400 }
      );
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        { success: false, error: messages.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create property",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
