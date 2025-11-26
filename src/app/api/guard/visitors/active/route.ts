import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db/mongoose';
import Visitor from '@/app/lib/db/models/Visitor';
import { authMiddleware } from '@/app/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error } = await authMiddleware(request, 'guard');
    if (error) return error;

    await connectDB();

    // Get checked-in visitors (currently inside)
    const visitors = await Visitor.find({
      propertyId: user!.propertyId,
      status: 'checked_in',
    })
      .populate('hostResidentId', 'name unitNumber phone')
      .sort({ checkInTime: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: {
          visitors,
          count: visitors.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get active visitors error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}