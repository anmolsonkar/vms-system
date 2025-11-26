import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db/mongoose';
import Visitor from '@/app/lib/db/models/Visitor';
import Resident from '@/app/lib/db/models/Resident';
import { authMiddleware } from '@/app/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error } = await authMiddleware(request, 'resident');
    if (error) return error;

    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    // Get resident
    const resident = await Resident.findOne({ userId: user!.id });
    if (!resident) {
      return NextResponse.json(
        { success: false, error: 'Resident not found' },
        { status: 404 }
      );
    }

    // Build query
    const query: any = {
      hostResidentId: resident._id,
    };

    if (status && status !== 'all') {
      query.status = status;
    }

    // Get total count
    const total = await Visitor.countDocuments(query);

    // Get visitors with pagination
    const visitors = await Visitor.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: {
          visitors,
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
    console.error('Get visitor history error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}