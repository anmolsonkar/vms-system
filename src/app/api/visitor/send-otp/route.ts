import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import Visitor from "@/app/lib/db/models/Visitor";
import { generateOTP, getOTPExpiry } from "@/app/lib/utils/otp";
import { sendOTPSMS } from "@/app/lib/utils/sms";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { phone, visitorId } = body;

    // Validate phone number
    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number" },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    // If visitorId is provided, update existing visitor
    if (visitorId) {
      const visitor = await Visitor.findByIdAndUpdate(
        visitorId,
        {
          otp,
          otpExpiry,
          otpVerified: false,
        },
        { new: true }
      );

      if (!visitor) {
        return NextResponse.json(
          { success: false, error: "Visitor not found" },
          { status: 404 }
        );
      }
    }

    // Send OTP via SMS
    const smsSent = await sendOTPSMS(phone, otp);

    if (!smsSent) {
      return NextResponse.json(
        { success: false, error: "Failed to send OTP. Please try again." },
        { status: 500 }
      );
    }

    // For development - log OTP (remove in production)
    if (process.env.NODE_ENV === "development") {
      console.log(`OTP for ${phone}: ${otp}`);
    }

    return NextResponse.json(
      {
        success: true,
        message: "OTP sent successfully",
        data: {
          expiresIn: "10 minutes",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
