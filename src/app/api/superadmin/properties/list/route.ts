import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import Property from "@/app/lib/db/models/Property";
import User from "@/app/lib/db/models/User"; // ← Import User model
import { authMiddleware } from "@/app/lib/auth/middleware";

export async function GET(request: NextRequest) {
  try {
    // Authenticate superadmin
    const { user, error } = await authMiddleware(request, "superadmin");
    if (error) return error;

    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build query
    const query: any = {};

    if (type && type !== "all") {
      query.type = type;
    }

    // Get total count
    const total = await Property.countDocuments(query);

    // Get properties with pagination
    // Don't populate createdBy to avoid schema issues
    const properties = await Property.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: {
          properties,
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
    console.error("List properties error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
