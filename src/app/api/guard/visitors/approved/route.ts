export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import Visitor from "@/app/lib/db/models/Visitor";
import { authMiddleware } from "@/app/lib/auth/middleware";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error } = await authMiddleware(request, "guard");
    if (error) return error;

    await connectDB();

    // Get approved visitors for this property (not yet checked in)
    const visitors = await Visitor.find({
      propertyId: user!.propertyId,
      status: "approved",
    })
      .populate("hostResidentId", "fullName unitNumber phoneNumber email") // ✅ Populate host resident
      .populate("propertyId", "name address") // ✅ Also populate property
      .sort({ approvedAt: -1 })
      .lean();

    // Format the data to ensure proper field mapping
    const formattedVisitors = visitors.map((visitor: any) => ({
      _id: visitor._id,
      name: visitor.name || "N/A",
      phone: visitor.phone || "N/A",
      photoUrl:
        visitor.photoUrl ||
        visitor.idCardImageUrl ||
        "/images/default-visitor-photo.png",
      assetPhotoUrl: visitor.assetPhotoUrl || null,
      assetDescription: visitor.assetDescription || null,
      purpose: visitor.purpose || "N/A",
      vehicleNumber: visitor.vehicleNumber || null,
      numberOfPersons: visitor.numberOfPersons || 1,
      status: visitor.status,
      approvedAt: visitor.approvedAt,
      approvedBy: visitor.approvedBy || null,
      isWalkIn: visitor.isWalkIn || false,
      phoneVerified: visitor.phoneVerified || false,
      otpVerified: visitor.otpVerified || false,
      createdAt: visitor.createdAt,
      hostResidentId: visitor.hostResidentId
        ? {
            _id: visitor.hostResidentId._id,
            fullName: visitor.hostResidentId.fullName || "N/A",
            unitNumber: visitor.hostResidentId.unitNumber || "N/A",
            phoneNumber: visitor.hostResidentId.phoneNumber || "N/A",
            email: visitor.hostResidentId.email || "N/A",
          }
        : null,
      property: visitor.propertyId
        ? {
            _id: visitor.propertyId._id,
            name: visitor.propertyId.name || "N/A",
            address: visitor.propertyId.address || "N/A",
          }
        : null,
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          visitors: formattedVisitors,
          count: formattedVisitors.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get approved visitors error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
