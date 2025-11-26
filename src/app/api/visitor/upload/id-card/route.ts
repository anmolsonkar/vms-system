import { NextRequest, NextResponse } from 'next/server';
import { uploadBase64Image } from '@/app/lib/utils/upload';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { photoData } = body;

    if (!photoData) {
      return NextResponse.json(
        { success: false, error: 'Photo data is required' },
        { status: 400 }
      );
    }

    // Upload photo
    const result = await uploadBase64Image(photoData, 'photos');

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Photo uploaded successfully',
        data: {
          photoUrl: result.url,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload photo error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}