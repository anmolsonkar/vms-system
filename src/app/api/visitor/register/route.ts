import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db/mongoose';
import Visitor from '@/app/lib/db/models/Visitor';
import Resident from '@/app/lib/db/models/Resident';
import User from '@/app/lib/db/models/User';
import { validate, visitorRegistrationSchema } from '@/app/lib/utils/validation';
import { notifyResidentOfVisitor } from '@/app/lib/utils/notification';
import { sendVisitorApprovalRequest } from '@/app/lib/utils/whatsapp';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate input
    const validation = validate(visitorRegistrationSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.errors?.join(', ') },
        { status: 400 }
      );
    }

    const data = validation.data!;

    // Verify resident exists
    const resident = await Resident.findById(data.hostResidentId);
    if (!resident) {
      return NextResponse.json(
        { success: false, error: 'Resident not found' },
        { status: 404 }
      );
    }

    // Verify either phone is verified OR ID card is uploaded
    if (!data.phone && !data.idCardImageUrl) {
      return NextResponse.json(
        { success: false, error: 'Either phone number or ID card is required' },
        { status: 400 }
      );
    }

    // Create visitor
    const visitor = await Visitor.create({
      ...data,
      status: 'pending',
      isWalkIn: false,
      phoneVerified: !!data.phone,
    });

    // Get resident user to send notification
    const residentUser = await User.findOne({ _id: resident.userId });

    if (residentUser) {
      // Send notification to resident
      await notifyResidentOfVisitor(
        residentUser._id.toString(),
        data.propertyId,
        visitor._id.toString(),
        data.name,
        data.purpose
      );

      // Send WhatsApp notification (optional)
      try {
        await sendVisitorApprovalRequest(
          resident.phone,
          data.name,
          data.purpose,
          'Your Property'
        );
      } catch (error) {
        console.error('WhatsApp notification failed:', error);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Visitor registration submitted successfully',
        data: {
          visitorId: visitor._id.toString(),
          status: visitor.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Visitor registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}