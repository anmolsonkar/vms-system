import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import Visitor from "@/app/lib/db/models/Visitor";
import Resident from "@/app/lib/db/models/Resident";
import { authMiddleware } from "@/app/lib/auth/middleware";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    // Authenticate guard
    const { user, error } = await authMiddleware(request, "guard");
    if (error) return error;

    await connectDB();

    // Parse FormData
    const formData = await request.formData();
    const visitorName = formData.get("visitorName") as string;
    const visitorPhone = formData.get("visitorPhone") as string;
    const hostResidentId = formData.get("hostResidentId") as string;
    const purpose = (formData.get("purpose") as string) || "";
    const checkInMethod = (formData.get("checkInMethod") as string) || "manual";
    const idCardImage = formData.get("idCardImage") as File | null;

    // Validate required fields
    if (!visitorName || !visitorPhone || !hostResidentId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify resident exists and is active
    const resident = await Resident.findOne({
      _id: hostResidentId,
      isActive: true,
    });

    if (!resident) {
      return NextResponse.json(
        { success: false, error: "Resident not found or inactive" },
        { status: 404 }
      );
    }

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
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        // Continue without image if upload fails
        idCardPath = undefined;
      }
    }

    // Create visitor record
    const visitor = await Visitor.create({
      name: visitorName,
      phone: visitorPhone,
      hostResidentId: resident._id,
      propertyId: resident.propertyId,
      purpose: purpose || "Visit",
      checkInTime: new Date(),
      checkInMethod: checkInMethod,
      idCardImage: idCardPath,
      status: "checked-in",
      checkInBy: user?.id,
    });

    // Populate resident details for response
    await visitor.populate("hostResidentId", "name unitNumber phone");

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
              name: resident.name,
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
    console.error("Check-in error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check in visitor" },
      { status: 500 }
    );
  }
}

// Set config for file upload
export const config = {
  api: {
    bodyParser: false, // Disable default body parser for FormData
  },
};
