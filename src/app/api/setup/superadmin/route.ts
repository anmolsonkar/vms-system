import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db/mongoose';
import User from '@/app/lib/db/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Add a setup key check
    const { setupKey, email, password } = await request.json();

    // Change this secret key!
    const SETUP_SECRET = process.env.SETUP_SECRET || 'your-secret-setup-key-12345';

    if (setupKey !== SETUP_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Invalid setup key' },
        { status: 403 }
      );
    }

    await connectDB();

    // Check if superadmin already exists
    const existingAdmin = await User.findOne({ role: 'superadmin' });

    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: 'SuperAdmin already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create superadmin
    const superAdmin = await User.create({
      email: email || 'admin@vms.com',
      password: hashedPassword,
      role: 'superadmin',
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'SuperAdmin created successfully',
        data: {
          email: superAdmin.email,
          role: superAdmin.role,
          id: superAdmin._id,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create SuperAdmin' },
      { status: 500 }
    );
  }
}