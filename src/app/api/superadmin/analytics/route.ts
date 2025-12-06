export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";

import Visitor from "@/app/lib/db/models/Visitor";
import User from "@/app/lib/db/models/User";
import Property from "@/app/lib/db/models/Property";

import { authMiddleware } from "@/app/lib/auth/middleware";

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authMiddleware(request, "superadmin");
    if (error) return error;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build base query
    const baseQuery: any = {};
    if (propertyId) baseQuery.propertyId = propertyId;

    // Build date filter
    let dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // End of day
        dateFilter.createdAt.$lte = end;
      }
    }

    // Combine filters
    const combinedQuery = { ...baseQuery, ...dateFilter };

    // Fetch visitor statistics with date filter
    const [
      totalVisitors,
      pendingVisitors,
      approvedVisitors,
      rejectedVisitors,
      checkedInVisitors,
      checkedOutVisitors,
    ] = await Promise.all([
      Visitor.countDocuments(combinedQuery),
      Visitor.countDocuments({ ...combinedQuery, status: "pending" }),
      Visitor.countDocuments({ ...combinedQuery, status: "approved" }),
      Visitor.countDocuments({ ...combinedQuery, status: "rejected" }),
      Visitor.countDocuments({ ...combinedQuery, status: "checked_in" }),
      Visitor.countDocuments({ ...combinedQuery, status: "checked_out" }),
    ]);

    // Time-based statistics (always calculated from absolute dates)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayVisitors, weekVisitors, monthVisitors] = await Promise.all([
      Visitor.countDocuments({
        ...baseQuery,
        createdAt: { $gte: today },
      }),
      Visitor.countDocuments({
        ...baseQuery,
        createdAt: { $gte: thisWeekStart },
      }),
      Visitor.countDocuments({
        ...baseQuery,
        createdAt: { $gte: thisMonthStart },
      }),
    ]);

    // Fetch user statistics
    const userQuery: any = {};
    if (propertyId) userQuery.propertyId = propertyId;

    const [totalResidents, totalGuards, activeUsers] = await Promise.all([
      User.countDocuments({ ...userQuery, role: "resident", isActive: true }),
      User.countDocuments({ ...userQuery, role: "guard", isActive: true }),
      User.countDocuments({ ...userQuery, isActive: true }),
    ]);

    // Fetch property statistics
    const totalProperties = await Property.countDocuments({});

    // Fetch recent visitors with full details and date filter
    const recentVisitors = await Visitor.find(combinedQuery)
      .populate("hostResidentId", "fullName unitNumber phoneNumber email")
      .populate("propertyId", "name address")
      .populate("forwardedFrom", "fullName unitNumber")
      .populate("forwardedTo", "fullName unitNumber")
      .sort({ createdAt: -1 })
      .limit(100) // Limit to 100 for pagination
      .lean();

    // Format visitor data with proper field mapping
    const formattedVisitors = recentVisitors.map((visitor: any) => ({
      _id: visitor._id,
      name: visitor.name || "-",
      phone: visitor.phone || "-",
      phoneVerified: visitor.phoneVerified || false,
      photoUrl:
        visitor.photoUrl ||
        visitor.idCardImageUrl ||
        "/images/default-visitor-photo.png",
      assetPhotoUrl: visitor.assetPhotoUrl || null,
      assetDescription: visitor.assetDescription || null,
      purpose: visitor.purpose || "-",
      vehicleNumber: visitor.vehicleNumber || null,
      numberOfPersons: visitor.numberOfPersons || 1,
      status: visitor.status || "pending",
      isWalkIn: visitor.isWalkIn || false,
      otpVerified: visitor.otpVerified || false,
      createdAt: visitor.createdAt,
      updatedAt: visitor.updatedAt,
      approvedAt: visitor.approvedAt || null,
      approvedBy: visitor.approvedBy || null,
      rejectedAt: visitor.rejectedAt || null,
      checkInTime: visitor.checkInTime || null,
      checkOutTime: visitor.checkOutTime || null,
      isForwarded: visitor.isForwarded || false,
      forwardedFrom: visitor.forwardedFrom || null,
      forwardedTo: visitor.forwardedTo || null,
      forwardingNote: visitor.forwardingNote || null,
      hostResident: visitor.hostResidentId
        ? {
            _id: visitor.hostResidentId._id,
            fullName: visitor.hostResidentId.fullName || "-",
            unitNumber: visitor.hostResidentId.unitNumber || "-",
            phoneNumber: visitor.hostResidentId.phoneNumber || "-",
            email: visitor.hostResidentId.email || "-",
          }
        : null,
      property: visitor.propertyId
        ? {
            _id: visitor.propertyId._id,
            name: visitor.propertyId.name || "-",
            address: visitor.propertyId.address || "-",
          }
        : null,
    }));

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
          recentActivity: formattedVisitors,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get analytics error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
