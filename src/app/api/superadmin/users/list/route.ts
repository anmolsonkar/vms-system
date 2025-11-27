import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import User from "@/app/lib/db/models/User";
import Property from "@/app/lib/db/models/Property"; // ✅ Import Property model
import Resident from "@/app/lib/db/models/Resident";
import { authMiddleware } from "@/app/lib/auth/middleware";

export async function GET(request: NextRequest) {
  try {
    // Authenticate superadmin
    const { user, error } = await authMiddleware(request, "superadmin");
    if (error) return error;

    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const propertyId = searchParams.get("propertyId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build query
    const query: any = {};

    if (role && role !== "all") {
      query.role = role;
    }

    if (propertyId) {
      query.propertyId = propertyId;
    }

    // Get total count
    const total = await User.countDocuments(query);

    // Get users with pagination and populate
    const users = await User.find(query)
      .select("-password")
      .populate("propertyId", "name type")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // If role is resident, also get resident details
    if (role === "resident") {
      const usersWithDetails = await Promise.all(
        users.map(async (u) => {
          const resident = await Resident.findOne({ userId: u._id }).lean();
          return {
            ...u,
            residentDetails: resident,
            // Also add fields directly to user object for easier access
            fullName: resident?.name || u.fullName,
            unitNumber: resident?.unitNumber || u.unitNumber,
            phoneNumber: resident?.phone || u.phoneNumber,
          };
        })
      );

      return NextResponse.json(
        {
          success: true,
          data: {
            users: usersWithDetails,
            pagination: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit),
            },
          },
        },
        { status: 200 }
      );
    }

    // For non-resident roles, return users as-is
    return NextResponse.json(
      {
        success: true,
        data: {
          users,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("List users error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
