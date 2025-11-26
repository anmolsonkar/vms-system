import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import Visitor from "@/app/lib/db/models/Visitor";
import { verifyOTP } from "@/app/lib/utils/otp";
import { validate, otpVerificationSchema } from "@/app/lib/utils/validation";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate input
    const validation = validate(otpVerificationSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.errors?.join(", ") },
        { status: 400 }
      );
    }

    const { phone, otp } = validation.data!;

    // Find visitor by phone (most recent one with pending OTP)
    const visitor = await Visitor.findOne({
      phone,
      otpVerified: false,
    }).sort({ createdAt: -1 });

    if (!visitor || !visitor.otp || !visitor.otpExpiry) {
      return NextResponse.json(
        { success: false, error: "OTP not found. Please request a new OTP." },
        { status: 404 }
      );
    }

    // Verify OTP
    const isValid = verifyOTP(otp, visitor.otp, visitor.otpExpiry);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Mark OTP as verified
    visitor.otpVerified = true;
    visitor.phoneVerified = true;
    visitor.otp = undefined;
    visitor.otpExpiry = undefined;
    await visitor.save();

    return NextResponse.json(
      {
        success: true,
        message: "Phone number verified successfully",
        data: {
          visitorId: visitor._id.toString(),
          phoneVerified: true,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
