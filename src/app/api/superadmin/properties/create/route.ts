import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db/mongoose';
import Property from '@/app/lib/db/models/Property';
import { authMiddleware } from '@/app/lib/auth/middleware';
import { validate, createPropertySchema } from '@/app/lib/utils/validation';
import { generatePropertyQRCode } from '@/app/lib/utils/qr-generator';

export async function POST(request: NextRequest) {
  try {
    // Authenticate superadmin
    const { user, error } = await authMiddleware(request, 'superadmin');
    if (error) return error;

    await connectDB();

    const body = await request.json();

    // Validate input
    const validation = validate(createPropertySchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.errors?.join(', ') },
        { status: 400 }
      );
    }

    const data = validation.data!;

    // Create property
    const property = await Property.create({
      ...data,
      createdBy: user!.id,
      isActive: true,
    });

    // Generate QR code for property
    const qrResult = await generatePropertyQRCode(
      property._id.toString(),
      property.name
    );

    if (qrResult.success) {
      property.qrCode = qrResult.qrCodeUrl;
      await property.save();
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Property created successfully',
        data: {
          propertyId: property._id.toString(),
          name: property.name,
          qrCode: property.qrCode,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create property error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}