import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db/mongoose';
import Visitor from '@/app/lib/db/models/Visitor';
import Resident from '@/app/lib/db/models/Resident';
import { authMiddleware } from '@/app/lib/auth/middleware';
import { notifyResidentOfVisitor } from '@/app/lib/utils/notification';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error } = await authMiddleware(request, 'guard');
    if (error) return error;

    await connectDB();

    const body = await request.json();
    const {
      name,
      phone,
      photoUrl,
      idCardType,
      idCardNumber,
      idCardImageUrl,
      purpose,
      hostResidentId,
      vehicleNumber,
      numberOfPersons,
    } = body;

    // Validate required fields
    if (!name || !photoUrl || !purpose || !hostResidentId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify resident exists
    const resident = await Resident.findById(hostResidentId);
    if (!resident) {
      return NextResponse.json(
        { success: false, error: 'Resident not found' },
        { status: 404 }
      );
    }

    // Verify phone OR ID card is provided
    if (!phone && !idCardImageUrl) {
      return NextResponse.json(
        { success: false, error: 'Either phone number or ID card is required' },
        { status: 400 }
      );
    }

    // Create visitor (walk-in)
    const visitor = await Visitor.create({
      propertyId: user!.propertyId,
      name,
      phone,
      phoneVerified: !!phone,
      idCardType,
      idCardNumber,
      idCardImageUrl,
      photoUrl,
      purpose,
      hostResidentId,
      vehicleNumber,
      numberOfPersons: numberOfPersons || 1,
      status: 'pending',
      isWalkIn: true,
      createdBy: user!.id,
    });

    // Notify resident
    const residentUser = await Resident.findById(hostResidentId).populate('userId');
    if (residentUser && residentUser.userId) {
      await notifyResidentOfVisitor(
        (residentUser.userId as any)._id.toString(),
        user!.propertyId!,
        visitor._id.toString(),
        name,
        purpose
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Walk-in visitor registered. Awaiting resident approval.',
        data: {
          visitorId: visitor._id.toString(),
          status: visitor.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Manual entry error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}