import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import Visitor from "@/app/lib/db/models/Visitor";
import { generateOTP, getOTPExpiry } from "@/app/lib/utils/otp";
import mongoose from "mongoose";

// Temporary OTP storage schema (for visitors without visitorId)
const TempOTPSchema = new mongoose.Schema({
  phone: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  otpExpiry: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // Auto-delete after 10 minutes
});

const TempOTP =
  mongoose.models.TempOTP || mongoose.model("TempOTP", TempOTPSchema);

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

    console.log(`📱 Generated OTP for ${phone}: ${otp}`);

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
    } else {
      // Store OTP temporarily for new registrations
      await TempOTP.findOneAndUpdate(
        { phone },
        { phone, otp, otpExpiry },
        { upsert: true, new: true }
      );
      console.log(`💾 Stored temporary OTP for ${phone}`);
    }

    // Send OTP via Twilio
    const smsSent = await sendTwilioOTP(phone, otp);

    if (!smsSent) {
      return NextResponse.json(
        { success: false, error: "Failed to send OTP. Please try again." },
        { status: 500 }
      );
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

async function sendTwilioOTP(phone: string, otp: string): Promise<boolean> {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.error("❌ Twilio credentials not configured");
      console.log(
        "⚠️  Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env"
      );

      // For development - log OTP
      if (process.env.NODE_ENV === "development") {
        console.log(`🔐 Development Mode - OTP for ${phone}: ${otp}`);
        return true; // Return success in dev mode
      }

      return false;
    }

    const message = `Your VMS verification code is: ${otp}. Valid for 10 minutes. Do not share with anyone.`;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    // Create URLSearchParams for form data
    const params = new URLSearchParams();
    params.append("To", `+91${phone}`);
    params.append("From", fromNumber);
    params.append("Body", message);

    console.log(`📤 Sending OTP to +91${phone} from ${fromNumber}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
      },
      body: params.toString(),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("❌ Twilio API error:", {
        status: response.status,
        statusText: response.statusText,
        error: responseData,
      });

      // Common error handling
      if (responseData.code === 21211) {
        throw new Error(
          "Invalid phone number. Please check the number and try again."
        );
      } else if (responseData.code === 21608) {
        throw new Error(
          "Phone number is not verified. For trial accounts, please verify the number first."
        );
      } else if (responseData.code === 20003) {
        throw new Error(
          "Twilio authentication failed. Please check your credentials."
        );
      }

      throw new Error(
        responseData.message || `Twilio API error: ${response.statusText}`
      );
    }

    console.log("✅ Twilio OTP sent successfully:", {
      sid: responseData.sid,
      to: responseData.to,
      status: responseData.status,
    });

    return true;
  } catch (error: any) {
    console.error("❌ Twilio SMS error:", error.message || error);

    // For development - log OTP as fallback
    if (process.env.NODE_ENV === "development") {
      console.log(`🔐 Development Mode Fallback - OTP for ${phone}: ${otp}`);
      return true; // Return success in dev mode
    }

    return false;
  }
}
