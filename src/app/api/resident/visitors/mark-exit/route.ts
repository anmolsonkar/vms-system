import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db/mongoose';
import Visitor from '@/app/lib/db/models/Visitor';
import Resident from '@/app/lib/db/models/Resident';
import User from '@/app/lib/db/models/User';
import { authMiddleware } from '@/app/lib/auth/middleware';
import { notifyGuardOfExit } from '@/app/lib/utils/notification';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error } = await authMiddleware(request, 'resident');
    if (error) return error;

    await connectDB();

    const body = await request.json();
    const { visitorId } = body;

    if (!visitorId) {
      return NextResponse.json(
        { success: false, error: 'Visitor ID is required' },
        { status: 400 }
      );
    }

    // Get resident
    const resident = await Resident.findOne({ userId: user!.id });
    if (!resident) {
      return NextResponse.json(
        { success: false, error: 'Resident not found' },
        { status: 404 }
      );
    }

    // Get visitor
    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return NextResponse.json(
        { success: false, error: 'Visitor not found' },
        { status: 404 }
      );
    }

    // Verify visitor belongs to this resident
    if (visitor.hostResidentId.toString() !== resident._id.toString()) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if visitor is checked in
    if (visitor.status !== 'checked_in') {
      return NextResponse.json(
        { success: false, error: 'Visitor is not currently checked in' },
        { status: 400 }
      );
    }

    // Mark exit
    visitor.markedExitBy = resident._id as any;
    visitor.markedExitAt = new Date();
    await visitor.save();

    // Get all guards at this property to notify
    const guards = await User.find({
      role: 'guard',
      propertyId: user!.propertyId,
      isActive: true,
    });

    // Notify all guards
    for (const guard of guards) {
      await notifyGuardOfExit(
        guard._id.toString(),
        user!.propertyId!,
        visitor._id.toString(),
        visitor.name,
        resident.name
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Visitor exit marked successfully. Guard will verify at gate.',
        data: {
          visitorId: visitor._id.toString(),
          markedExitAt: visitor.markedExitAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Mark exit error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}