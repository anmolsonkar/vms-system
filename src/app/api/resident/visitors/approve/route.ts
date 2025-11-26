import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db/mongoose';
import Visitor from '@/app/lib/db/models/Visitor';
import Resident from '@/app/lib/db/models/Resident';
import User from '@/app/lib/db/models/User';
import { authMiddleware } from '@/app/lib/auth/middleware';
import { notifyGuardOfApproval } from '@/app/lib/utils/notification';
import { sendVisitorApprovedNotification } from '@/app/lib/utils/whatsapp';
import { sendApprovalSMS } from '@/app/lib/utils/sms';

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

    // Check if already processed
    if (visitor.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Visitor already processed' },
        { status: 400 }
      );
    }

    // Update visitor status
    visitor.status = 'approved';
    visitor.approvedBy = user!.id as any;
    visitor.approvedAt = new Date();
    await visitor.save();

    // Get all guards at this property to notify
    const guards = await User.find({
      role: 'guard',
      propertyId: user!.propertyId,
      isActive: true,
    });

    // Notify all guards
    for (const guard of guards) {
      await notifyGuardOfApproval(
        guard._id.toString(),
        user!.propertyId!,
        visitor._id.toString(),
        visitor.name,
        resident.name
      );
    }

    // Send SMS/WhatsApp to visitor
    if (visitor.phone) {
      try {
        await sendApprovalSMS(visitor.phone, visitor.name, resident.name);
        await sendVisitorApprovedNotification(visitor.phone, visitor.name, resident.name);
      } catch (error) {
        console.error('Notification send error:', error);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Visitor approved successfully',
        data: {
          visitorId: visitor._id.toString(),
          status: visitor.status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Approve visitor error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}