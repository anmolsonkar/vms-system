import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db/mongoose';
import { authMiddleware } from '@/app/lib/auth/middleware';
import { markNotificationAsRead } from '@/app/lib/utils/notification';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error } = await authMiddleware(request);
    if (error) return error;

    await connectDB();

    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const result = await markNotificationAsRead(notificationId);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Failed to mark notification as read' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Notification marked as read',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Mark notification read error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}