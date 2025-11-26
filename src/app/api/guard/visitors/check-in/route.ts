import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db/mongoose';
import Visitor from '@/app/lib/db/models/Visitor';
import { authMiddleware } from '@/app/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error } = await authMiddleware(request, 'guard');
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

    // Get visitor
    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return NextResponse.json(
        { success: false, error: 'Visitor not found' },
        { status: 404 }
      );
    }

    // Verify visitor is approved
    if (visitor.status !== 'approved') {
      return NextResponse.json(
        { success: false, error: 'Visitor is not approved' },
        { status: 400 }
      );
    }

    // Verify visitor belongs to this property
    if (visitor.propertyId.toString() !== user!.propertyId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check in visitor
    visitor.status = 'checked_in';
    visitor.checkedInBy = user!.id as any;
    visitor.checkInTime = new Date();
    await visitor.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Visitor checked in successfully',
        data: {
          visitorId: visitor._id.toString(),
          status: visitor.status,
          checkInTime: visitor.checkInTime,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Check-in visitor error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}