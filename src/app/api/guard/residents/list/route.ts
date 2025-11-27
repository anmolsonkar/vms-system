import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import User from "@/app/lib/db/models/User";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const propertyId = searchParams.get("propertyId") || "";

    console.log(
      "🔍 Fetching residents - Search:",
      search,
      "PropertyId:",
      propertyId
    );

    let query: any = {
      role: "resident",
      isActive: true,
    };

    // Filter by property if provided
    if (propertyId) {
      query.propertyId = propertyId;
    }

    // Add search filter
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { unitNumber: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const residents = await User.find(query)
      .select("fullName phoneNumber unitNumber email propertyId")
      .sort({ fullName: 1 })
      .limit(200);

    console.log(`✅ Found ${residents.length} residents`);

    return NextResponse.json(
      {
        success: true,
        data: {
          residents: residents.map((r) => ({
            _id: r._id,
            fullName: r.fullName,
            phoneNumber: r.phoneNumber,
            unitNumber: r.unitNumber,
            email: r.email,
          })),
        },
        count: residents.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Fetch residents error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch residents",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
