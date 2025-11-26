import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import Notification from "@/app/lib/db/models/Notification";
import { authMiddleware } from "@/app/lib/auth/middleware";

export async function GET(request: NextRequest) {
  try {
    // Authenticate guard
    const { user, error } = await authMiddleware(request, "guard");
    if (error) return error;

    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    // Build query
    const query: any = {
      userId: user!.id,
    };

    if (unreadOnly) {
      query.isRead = false;
    }

    // Get notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: {
          notifications,
          count: notifications.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get guard notifications error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
