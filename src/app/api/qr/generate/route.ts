import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/app/lib/auth/middleware';
import { generatePropertyQRCode } from '@/app/lib/utils/qr-generator';

export async function POST(request: NextRequest) {
  try {
    // Authenticate superadmin
    const { user, error } = await authMiddleware(request, 'superadmin');
    if (error) return error;

    const body = await request.json();
    const { propertyId, propertyName } = body;

    if (!propertyId || !propertyName) {
      return NextResponse.json(
        { success: false, error: 'Property ID and name are required' },
        { status: 400 }
      );
    }

    // Generate QR code
    const result = await generatePropertyQRCode(propertyId, propertyName);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'QR code generated successfully',
        data: {
          qrCodeUrl: result.qrCodeUrl,
          qrCodeDataUrl: result.qrCodeDataUrl,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Generate QR code error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}