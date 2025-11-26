import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db/mongoose';
import AuditLog from '@/app/lib/db/models/AuditLog';
import { authMiddleware } from '@/app/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    // Authenticate superadmin
    const { user, error } = await authMiddleware(request, 'superadmin');
    if (error) return error;

    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module');
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const propertyId = searchParams.get('propertyId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    const query: any = {};

    if (module && module !== 'all') {
      query.module = module;
    }

    if (action) {
      query.action = { $regex: action, $options: 'i' };
    }

    if (userId) {
      query.userId = userId;
    }

    if (propertyId) {
      query.propertyId = propertyId;
    }

    // Get total count
    const total = await AuditLog.countDocuments(query);

    // Get audit logs with pagination
    const logs = await AuditLog.find(query)
      .populate('userId', 'email role')
      .populate('propertyId', 'name type')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: {
          logs,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get audit logs error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}