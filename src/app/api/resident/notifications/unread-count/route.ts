import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db/mongoose';
import { authMiddleware } from '@/app/lib/auth/middleware';
import { getUnreadCount } from '@/app/lib/utils/notification';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error } = await authMiddleware(request);
    if (error) return error;

    await connectDB();

    const count = await getUnreadCount(user!.id);

    return NextResponse.json(
      {
        success: true,
        data: {
          count,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get unread count error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}