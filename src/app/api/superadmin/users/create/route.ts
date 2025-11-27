import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import User from "@/app/lib/db/models/User";
import bcrypt from "bcryptjs";
import { authMiddleware } from "@/app/lib/auth/middleware";

export async function POST(request: NextRequest) {
  try {
    // Authenticate superadmin
    const { user, error } = await authMiddleware(request, "superadmin");
    if (error) return error;

    await connectDB();

    const body = await request.json();
    console.log(
      "📥 Received user creation data:",
      JSON.stringify(body, null, 2)
    );

    // Validate required fields
    const {
      email,
      password,
      fullName,
      role,
      propertyId,
      unitNumber,
      phoneNumber,
    } = body;

    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        {
          success: false,
          error: "Email, password, full name, and role are required",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["resident", "guard"];
    if (!validRoles.includes(role.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: "Role must be either resident or guard" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 8 characters long",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Validate property assignment for non-superadmin roles
    if (!propertyId) {
      return NextResponse.json(
        {
          success: false,
          error: "Property is required for resident and guard roles",
        },
        { status: 400 }
      );
    }

    // Validate resident-specific fields
    if (role.toLowerCase() === "resident") {
      if (!unitNumber) {
        return NextResponse.json(
          { success: false, error: "Unit number is required for residents" },
          { status: 400 }
        );
      }
      if (!phoneNumber) {
        return NextResponse.json(
          { success: false, error: "Phone number is required for residents" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user data
    const userData: any = {
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName,
      role: role.toLowerCase(),
      propertyId,
    };

    // Add resident-specific fields
    if (role.toLowerCase() === "resident") {
      userData.unitNumber = unitNumber;
      userData.phoneNumber = phoneNumber;
    }

    console.log("✅ Creating user with data:", {
      ...userData,
      password: "[HIDDEN]",
    });

    // Create user
    const newUser = await User.create(userData);

    console.log("✅ User created successfully:", newUser._id);

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: newUser._id,
            email: newUser.email,
            fullName: newUser.fullName,
            role: newUser.role,
            propertyId: newUser.propertyId,
            unitNumber: newUser.unitNumber,
            phoneNumber: newUser.phoneNumber,
          },
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create user error:", error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors)
        .map((err: any) => err.message)
        .join(", ");
      return NextResponse.json(
        { success: false, error: messages },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
