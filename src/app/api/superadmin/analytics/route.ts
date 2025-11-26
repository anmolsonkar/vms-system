import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db/mongoose';
import Visitor from '@/app/lib/db/models/Visitor';
import User from '@/app/lib/db/models/User';
import Property from '@/app/lib/db/models/Property';
import { authMiddleware } from '@/app/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    // Authenticate superadmin
    const { user, error } = await authMiddleware(request, 'superadmin');
    if (error) return error;

    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    // Build base query
    const baseQuery: any = {};
    if (propertyId) {
      baseQuery.propertyId = propertyId;
    }

    // Get date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get visitor statistics
    const [
      totalVisitors,
      pendingVisitors,
      approvedVisitors,
      rejectedVisitors,
      checkedInVisitors,
      checkedOutVisitors,
      todayVisitors,
      weekVisitors,
      monthVisitors,
    ] = await Promise.all([
      Visitor.countDocuments(baseQuery),
      Visitor.countDocuments({ ...baseQuery, status: 'pending' }),
      Visitor.countDocuments({ ...baseQuery, status: 'approved' }),
      Visitor.countDocuments({ ...baseQuery, status: 'rejected' }),
      Visitor.countDocuments({ ...baseQuery, status: 'checked_in' }),
      Visitor.countDocuments({ ...baseQuery, status: 'checked_out' }),
      Visitor.countDocuments({ ...baseQuery, createdAt: { $gte: today } }),
      Visitor.countDocuments({ ...baseQuery, createdAt: { $gte: thisWeekStart } }),
      Visitor.countDocuments({ ...baseQuery, createdAt: { $gte: thisMonthStart } }),
    ]);

    // Get user statistics
    const userQuery: any = {};
    if (propertyId) {
      userQuery.propertyId = propertyId;
    }

    const [totalResidents, totalGuards, activeUsers] = await Promise.all([
      User.countDocuments({ ...userQuery, role: 'resident', isActive: true }),
      User.countDocuments({ ...userQuery, role: 'guard', isActive: true }),
      User.countDocuments({ ...userQuery, isActive: true }),
    ]);

    // Get property statistics
    const totalProperties = await Property.countDocuments({});

    // Get recent activity
    const recentVisitors = await Visitor.find(baseQuery)
      .populate('hostResidentId', 'name unitNumber')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: {
          visitors: {
            total: totalVisitors,
            pending: pendingVisitors,
            approved: approvedVisitors,
            rejected: rejectedVisitors,
            checkedIn: checkedInVisitors,
            checkedOut: checkedOutVisitors,
            today: todayVisitors,
            thisWeek: weekVisitors,
            thisMonth: monthVisitors,
          },
          users: {
            totalResidents,
            totalGuards,
            activeUsers,
          },
          properties: {
            total: totalProperties,
          },
          recentActivity: recentVisitors,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}