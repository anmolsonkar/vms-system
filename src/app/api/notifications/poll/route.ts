export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db/mongoose';
import Notification from '@/app/lib/db/models/Notification';
import { authMiddleware } from '@/app/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error } = await authMiddleware(request);
    if (error) return error;

    await connectDB();

    // Get unread notifications
    const notifications = await Notification.find({
      userId: user!.id,
      isRead: false,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      userId: user!.id,
      isRead: false,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          notifications,
          unreadCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Poll notifications error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}