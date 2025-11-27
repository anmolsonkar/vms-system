import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db/mongoose';
import Visitor from '@/app/lib/db/models/Visitor';
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

    const userId = user!.id;
    console.log('🔍 Resident approving visitor:', { userId, visitorId });

    // Get visitor
    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return NextResponse.json(
        { success: false, error: 'Visitor not found' },
        { status: 404 }
      );
    }

    // Verify visitor belongs to this resident (compare with user ID directly)
    if (visitor.hostResidentId.toString() !== userId) {
      console.log('❌ Unauthorized:', {
        visitorHostId: visitor.hostResidentId.toString(),
        currentUserId: userId
      });
      return NextResponse.json(
        { success: false, error: 'Unauthorized - This visitor is not assigned to you' },
        { status: 403 }
      );
    }

    // Check if already processed
    if (visitor.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: `Visitor already ${visitor.status}` },
        { status: 400 }
      );
    }

    // Get resident details from User collection
    const residentUser = await User.findOne({
      _id: userId,
      role: 'resident',
      isActive: true
    });

    if (!residentUser) {
      return NextResponse.json(
        { success: false, error: 'Resident user not found' },
        { status: 404 }
      );
    }

    // Update visitor status
    visitor.status = 'approved';
    visitor.approvedBy = userId as any;
    visitor.approvedAt = new Date();
    await visitor.save();

    console.log('✅ Visitor approved successfully:', visitorId);

    // Get all guards at this property to notify
    const guards = await User.find({
      role: 'guard',
      propertyId: user!.propertyId,
      isActive: true,
    });

    console.log(`📢 Notifying ${guards.length} guards`);

    // Notify all guards
    for (const guard of guards) {
      try {
        await notifyGuardOfApproval(
          guard._id.toString(),
          user!.propertyId!,
          visitor._id.toString(),
          visitor.name,
          residentUser.fullName
        );
      } catch (error) {
        console.error('Guard notification error:', error);
      }
    }

    // Send SMS/WhatsApp to visitor
    if (visitor.phone) {
      try {
        await sendApprovalSMS(visitor.phone, visitor.name, residentUser.fullName);
        await sendVisitorApprovedNotification(visitor.phone, visitor.name, residentUser.fullName);
        console.log('✅ Notifications sent to visitor');
      } catch (error) {
        console.error('Visitor notification error:', error);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Visitor approved successfully',
        data: {
          visitorId: visitor._id.toString(),
          status: visitor.status,
          visitorName: visitor.name,
          approvedBy: residentUser.fullName,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Approve visitor error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}