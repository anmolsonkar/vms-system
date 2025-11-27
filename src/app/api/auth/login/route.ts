import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import User from "@/app/lib/db/models/User";
import bcrypt from "bcryptjs";
import { generateToken } from "@/app/lib/auth/jwt";
import { validate, loginSchema } from "@/app/lib/utils/validation";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate input
    const validation = validate(loginSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.errors?.join(", ") },
        { status: 400 }
      );
    }

    const { email, password } = validation.data!;

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase(),
      isActive: true,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token with fullName
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      fullName: user.fullName, // ✅ Added fullName to token
      role: user.role,
      propertyId: user.propertyId?.toString(),
    });

    // Create response with cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user._id.toString(),
            email: user.email,
            fullName: user.fullName, // ✅ Added fullName to response
            role: user.role,
            propertyId: user.propertyId?.toString(),
          },
        },
      },
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
