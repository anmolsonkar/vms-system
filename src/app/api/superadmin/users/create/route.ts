import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db/mongoose';
import User from '@/app/lib/db/models/User';
import Resident from '@/app/lib/db/models/Resident';
import bcrypt from 'bcryptjs';
import { authMiddleware } from '@/app/lib/auth/middleware';
import { validate, createUserSchema, createResidentSchema } from '@/app/lib/utils/validation';

export async function POST(request: NextRequest) {
  try {
    // Authenticate superadmin
    const { user, error } = await authMiddleware(request, 'superadmin');
    if (error) return error;

    await connectDB();

    const body = await request.json();
    const { role } = body;

    // Validate based on role
    let validation;
    if (role === 'resident') {
      validation = validate(createResidentSchema, body);
    } else {
      validation = validate(createUserSchema, body);
    }

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.errors?.join(', ') },
        { status: 400 }
      );
    }

    const data = validation.data!;

    // Check if email already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const newUser = await User.create({
      email: data.email,
      password: hashedPassword,
      role: data.role,
      propertyId: data.propertyId,
      isActive: true,
      createdBy: user!.id,
    });

    // If resident, create resident profile
    if (role === 'resident') {
      await Resident.create({
        userId: newUser._id,
        propertyId: data.propertyId,
        unitNumber: (data as any).unitNumber,
        name: (data as any).name,
        phone: (data as any).phone,
        alternatePhone: (data as any).alternatePhone,
        email: data.email,
        numberOfMembers: (data as any).numberOfMembers || 1,
        vehicleNumbers: (data as any).vehicleNumbers || [],
        isActive: true,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully`,
        data: {
          userId: newUser._id.toString(),
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}