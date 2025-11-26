import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db/mongoose';
import Visitor from '@/app/lib/db/models/Visitor';
import Resident from '@/app/lib/db/models/Resident';
import { authMiddleware } from '@/app/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error } = await authMiddleware(request, 'resident');
    if (error) return error;

    await connectDB();

    // Get resident
    const resident = await Resident.findOne({ userId: user!.id });
    if (!resident) {
      return NextResponse.json(
        { success: false, error: 'Resident not found' },
        { status: 404 }
      );
    }

    // Get pending visitors for this resident
    const visitors = await Visitor.find({
      hostResidentId: resident._id,
      status: 'pending',
    })
      .sort({ createdAt: -1 })
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
    console.error('Get pending visitors error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}