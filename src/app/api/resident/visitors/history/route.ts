export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import Visitor from "@/app/lib/db/models/Visitor";
import { authMiddleware } from "@/app/lib/auth/middleware";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error } = await authMiddleware(request, "resident");
    if (error) return error;

    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");

    const userId = user!.id;
    console.log("🔍 Fetching visitor history for resident:", userId);

    // ✅ FIXED: Build query to include visitors where user is either:
    // 1. Current host (hostResidentId matches)
    // 2. Original sender who forwarded (forwardedFrom matches)
    const query: any = {
      $or: [{ hostResidentId: userId }, { forwardedFrom: userId }],
    };

    if (status && status !== "all") {
      query.status = status;
    }

    // Get total count
    const total = await Visitor.countDocuments(query);

    // Get visitors with pagination and populate forwarding fields
    const visitors = await Visitor.find(query)
      .populate("forwardedFrom", "fullName unitNumber email phoneNumber")
      .populate("forwardedTo", "fullName unitNumber email phoneNumber")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    console.log(`✅ Found ${visitors.length} visitors (total: ${total})`);

    return NextResponse.json(
      {
        success: true,
        data: {
          visitors,
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
    console.error("❌ Get visitor history error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
