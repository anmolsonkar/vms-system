import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import Visitor from "@/app/lib/db/models/Visitor";
import { verifyOTP } from "@/app/lib/utils/otp";
import { validate, otpVerificationSchema } from "@/app/lib/utils/validation";
import mongoose from "mongoose";

// Temporary OTP storage schema (must match send-otp)
const TempOTPSchema = new mongoose.Schema({
  phone: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  otpExpiry: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 },
});

const TempOTP =
  mongoose.models.TempOTP || mongoose.model("TempOTP", TempOTPSchema);

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

    console.log(`🔍 Verifying OTP for phone: ${phone}`);

    // Try to find OTP in Visitor collection first (for existing visitors with visitorId)
    let visitor = await Visitor.findOne({
      phone,
      otpVerified: false,
    }).sort({ createdAt: -1 });

    let storedOTP: string | undefined;
    let otpExpiry: Date | undefined;
    let isFromTempStorage = false;

    if (visitor && visitor.otp && visitor.otpExpiry) {
      // Found in Visitor collection
      storedOTP = visitor.otp;
      otpExpiry = visitor.otpExpiry;
      console.log(`📋 Found OTP in Visitor collection`);
    } else {
      // Not found in Visitor, check TempOTP collection
      const tempOTP = await TempOTP.findOne({ phone }).sort({ createdAt: -1 });

      if (tempOTP && tempOTP.otp && tempOTP.otpExpiry) {
        storedOTP = tempOTP.otp;
        otpExpiry = tempOTP.otpExpiry;
        isFromTempStorage = true;
        console.log(`📋 Found OTP in TempOTP collection`);
      }
    }

    if (!storedOTP || !otpExpiry) {
      console.log(`❌ OTP not found for phone: ${phone}`);
      return NextResponse.json(
        { success: false, error: "OTP not found. Please request a new OTP." },
        { status: 404 }
      );
    }

    // Verify OTP
    const isValid = verifyOTP(otp, storedOTP, otpExpiry);

    if (!isValid) {
      console.log(`❌ Invalid or expired OTP for phone: ${phone}`);
      return NextResponse.json(
        { success: false, error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    console.log(`✅ OTP verified successfully for phone: ${phone}`);

    // Mark OTP as verified
    if (visitor && !isFromTempStorage) {
      // Update existing visitor
      visitor.otpVerified = true;
      visitor.phoneVerified = true;
      visitor.otp = undefined;
      visitor.otpExpiry = undefined;
      await visitor.save();
    } else if (isFromTempStorage) {
      // Delete temporary OTP after successful verification
      await TempOTP.deleteOne({ phone });
      console.log(`🗑️  Deleted temporary OTP for phone: ${phone}`);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Phone number verified successfully",
        data: {
          visitorId: visitor?._id?.toString(),
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
