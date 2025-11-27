import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import Visitor from "@/app/lib/db/models/Visitor";
import User from "@/app/lib/db/models/User";
import { authMiddleware } from "@/app/lib/auth/middleware";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    // Authenticate guard
    const { user, error } = await authMiddleware(request, "guard");
    if (error) return error;

    await connectDB();

    const contentType = request.headers.get("content-type") || "";

    let visitorId: string | undefined;
    let visitorName: string | undefined;
    let visitorPhone: string | undefined;
    let hostResidentId: string | undefined;
    let purpose: string | undefined;
    let checkInMethod: string = "manual";
    let idCardImage: File | null = null;

    // Handle both JSON and FormData
    if (contentType.includes("application/json")) {
      // JSON Request
      const body = await request.json();
      visitorId = body.visitorId;
      visitorName = body.visitorName;
      visitorPhone = body.visitorPhone;
      hostResidentId = body.hostResidentId;
      purpose = body.purpose;
      checkInMethod = body.checkInMethod || "manual";
    } else {
      // FormData Request
      const formData = await request.formData();
      visitorId = (formData.get("visitorId") as string | null) || undefined;
      visitorName = (formData.get("visitorName") as string | null) || undefined;
      visitorPhone =
        (formData.get("visitorPhone") as string | null) || undefined;
      hostResidentId =
        (formData.get("hostResidentId") as string | null) || undefined;
      purpose = (formData.get("purpose") as string | null) || undefined;
      checkInMethod = (formData.get("checkInMethod") as string) || "manual";
      idCardImage = formData.get("idCardImage") as File | null;
    }

    console.log("📝 Check-in request:", {
      visitorId,
      visitorName,
      visitorPhone,
      hostResidentId,
    });

    // Case 1: Check-in existing approved visitor by visitorId
    if (visitorId) {
      const visitor = await Visitor.findById(visitorId);

      if (!visitor) {
        return NextResponse.json(
          { success: false, error: "Visitor not found" },
          { status: 404 }
        );
      }

      if (visitor.status !== "approved") {
        return NextResponse.json(
          { success: false, error: "Visitor is not approved yet" },
          { status: 400 }
        );
      }

      // Update visitor to checked_in
      visitor.status = "checked_in";
      visitor.checkInTime = new Date();
      visitor.checkInMethod = checkInMethod;
      await visitor.save();

      console.log("✅ Visitor checked in:", visitor._id);

      return NextResponse.json(
        {
          success: true,
          message: "Visitor checked in successfully",
          data: {
            visitor: {
              id: visitor._id,
              name: visitor.name,
              phone: visitor.phone,
              host: {
                name: visitor.hostResidentName,
                unit: visitor.hostUnitNumber,
              },
              checkInTime: visitor.checkInTime,
            },
          },
        },
        { status: 200 }
      );
    }

    // Case 2: Direct check-in (walk-in visitor)
    if (!visitorName || !visitorPhone || !hostResidentId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: visitorName, visitorPhone, hostResidentId",
        },
        { status: 400 }
      );
    }

    // Verify resident exists and is active (from User collection)
    const resident = await User.findOne({
      _id: hostResidentId,
      role: "resident",
      isActive: true,
    }).select("fullName unitNumber phoneNumber propertyId");

    if (!resident) {
      return NextResponse.json(
        { success: false, error: "Resident not found or inactive" },
        { status: 404 }
      );
    }

    console.log("✅ Resident found:", resident.fullName);

    // Handle ID card image upload if provided
    let idCardPath: string | undefined;

    if (idCardImage && idCardImage.size > 0) {
      try {
        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(
          process.cwd(),
          "public",
          "uploads",
          "id-cards"
        );
        await mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedPhone = visitorPhone.replace(/[^0-9]/g, "");
        const fileName = `id-${sanitizedPhone}-${timestamp}.jpg`;
        const filePath = path.join(uploadsDir, fileName);

        // Convert file to buffer and save
        const bytes = await idCardImage.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Store relative path for database
        idCardPath = `/uploads/id-cards/${fileName}`;
        console.log("✅ ID card image saved:", idCardPath);
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        idCardPath = undefined;
      }
    }

    // Create new visitor record with direct check-in
    const visitor = await Visitor.create({
      name: visitorName,
      phone: visitorPhone,
      hostResidentId: resident._id,
      hostResidentName: resident.fullName,
      hostUnitNumber: resident.unitNumber,
      hostPhone: resident.phoneNumber,
      propertyId: resident.propertyId,
      purpose: purpose || "Visit",
      checkInTime: new Date(),
      checkInMethod: checkInMethod,
      idCardImageUrl: idCardPath,
      photoUrl:
        idCardPath ||
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3ENo Photo%3C/text%3E%3C/svg%3E",
      status: "checked_in",
      phoneVerified: true,
    });

    console.log("✅ New visitor checked in:", visitor._id);

    return NextResponse.json(
      {
        success: true,
        message: "Visitor checked in successfully",
        data: {
          visitor: {
            id: visitor._id,
            name: visitor.name,
            phone: visitor.phone,
            host: {
              name: resident.fullName,
              unit: resident.unitNumber,
            },
            checkInTime: visitor.checkInTime,
            idCardImage: visitor.idCardImageUrl,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Check-in error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check in visitor" },
      { status: 500 }
    );
  }
}
