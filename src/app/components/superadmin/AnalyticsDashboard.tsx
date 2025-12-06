"use client";

import React, { useState, useEffect, useCallback } from "react";
import Card from "../shared/Card";
import Badge from "../shared/Badge";
import LoadingSpinner from "../shared/LoadingSpinner";
import {
  Users,
  Building,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  Package,
  Eye,
  Download,
  Filter,
  RefreshCw,
  LogIn,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import axios from "axios";

interface Visitor {
  _id: string;
  name: string;
  phone: string;
  phoneVerified: boolean;
  photoUrl: string;
  assetPhotoUrl?: string;
  assetDescription?: string;
  purpose: string;
  vehicleNumber?: string;
  status: string;
  isWalkIn: boolean;
  otpVerified: boolean;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  checkInTime?: string;
  checkOutTime?: string;
  numberOfPersons?: number;
  isForwarded?: boolean;
  forwardedFrom?: {
    _id: string;
    fullName: string;
    unitNumber: string;
  };
  forwardedTo?: {
    _id: string;
    fullName: string;
    unitNumber: string;
  };
  hostResident?: {
    _id: string;
    fullName: string;
    unitNumber: string;
    phoneNumber: string;
    email: string;
  };
  property?: {
    _id: string;
    name: string;
    address: string;
  };
}

interface Analytics {
  visitors: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    checkedIn: number;
    checkedOut: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  users: {
    totalResidents: number;
    totalGuards: number;
    activeUsers: number;
  };
  properties: {
    total: number;
  };
  recentActivity: Visitor[];
}

const ITEMS_PER_PAGE = 10;

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [modalPhotoUrl, setModalPhotoUrl] = useState("");
  const [modalPhotoTitle, setModalPhotoTitle] = useState("");

  const fetchAnalytics = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const params: any = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await axios.get("/api/superadmin/analytics", {
          params,
        });

        if (response.data.success) {
          const apiData = response.data.data;

          setAnalytics({
            visitors: {
              total: apiData.visitors?.total || 0,
              pending: apiData.visitors?.pending || 0,
              approved: apiData.visitors?.approved || 0,
              rejected: apiData.visitors?.rejected || 0,
              checkedIn: apiData.visitors?.checkedIn || 0,
              checkedOut: apiData.visitors?.checkedOut || 0,
              today: apiData.visitors?.today || 0,
              thisWeek: apiData.visitors?.thisWeek || 0,
              thisMonth: apiData.visitors?.thisMonth || 0,
            },
            users: {
              totalResidents: apiData.users?.totalResidents || 0,
              totalGuards: apiData.users?.totalGuards || 0,
              activeUsers: apiData.users?.activeUsers || 0,
            },
            properties: {
              total: apiData.properties?.total || 0,
            },
            recentActivity: apiData.recentActivity || [],
          });
          setCurrentPage(1); // Reset to first page on new data
        }
      } catch (error: any) {
        console.error("Fetch analytics error:", error);
        setError(error.response?.data?.error || "Failed to load analytics");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [startDate, endDate]
  );

  // Initial fetch
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleDatePreset = (preset: "today" | "week" | "month" | "all") => {
    const now = new Date();

    switch (preset) {
      case "today":
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        setStartDate(format(todayStart, "yyyy-MM-dd"));
        setEndDate(format(new Date(), "yyyy-MM-dd"));
        break;
      case "week":
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        weekStart.setHours(0, 0, 0, 0);
        setStartDate(format(weekStart, "yyyy-MM-dd"));
        setEndDate(format(new Date(), "yyyy-MM-dd"));
        break;
      case "month":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        setStartDate(format(monthStart, "yyyy-MM-dd"));
        setEndDate(format(new Date(), "yyyy-MM-dd"));
        break;
      case "all":
        setStartDate("");
        setEndDate("");
        break;
    }
  };

  const handleViewDetails = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setShowDetailsModal(true);
  };

  const handleViewPhoto = (photoUrl: string, title: string = "Photo") => {
    setModalPhotoUrl(photoUrl);
    setModalPhotoTitle(title);
    setShowPhotoModal(true);
  };

  const exportToCSV = () => {
    if (!analytics?.recentActivity.length) return;

    const headers = [
      "Name",
      "Phone",
      "Phone Verified",
      "Purpose",
      "Vehicle",
      "Status",
      "Walk-in",
      "Forwarded",
      "Property",
      "Unit",
      "Resident",
      "Resident Phone",
      "Request Time",
      "Approval Time",
      "Approved By",
      "Rejection Time",
      "Check-In Time",
      "Check-Out Time",
      "Number of Persons",
      "Assets",
      "Last Updated",
    ];

    const rows = paginatedVisitors.map((visitor) => [
      visitor.name,
      visitor.phone,
      visitor.phoneVerified ? "Yes" : "No",
      visitor.purpose,
      visitor.vehicleNumber || "-",
      visitor.status.toUpperCase(),
      visitor.isWalkIn ? "Yes" : "No",
      visitor.isForwarded
        ? `Yes (${visitor.forwardedTo?.fullName || "N/A"})`
        : "No",
      visitor.property?.name || "-",
      visitor.hostResident?.unitNumber || "-",
      visitor.hostResident?.fullName || "-",
      visitor.hostResident?.phoneNumber || "-",
      format(new Date(visitor.createdAt), "MMM dd, yyyy HH:mm:ss"),
      visitor.approvedAt
        ? format(new Date(visitor.approvedAt), "MMM dd, yyyy HH:mm:ss")
        : "-",
      visitor.approvedBy || "-",
      visitor.rejectedAt
        ? format(new Date(visitor.rejectedAt), "MMM dd, yyyy HH:mm:ss")
        : "-",
      visitor.checkInTime
        ? format(new Date(visitor.checkInTime), "MMM dd, yyyy HH:mm:ss")
        : "-",
      visitor.checkOutTime
        ? format(new Date(visitor.checkOutTime), "MMM dd, yyyy HH:mm:ss")
        : "-",
      visitor.numberOfPersons || "1",
      visitor.assetDescription || "-",
      format(new Date(visitor.updatedAt), "MMM dd, yyyy HH:mm:ss"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visitors-export-${format(
      new Date(),
      "yyyy-MM-dd-HHmmss"
    )}.csv`;
    a.click();
  };

  if (loading) {
    return <LoadingSpinner text="Loading analytics..." />;
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-12">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchAnalytics()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-gray-500">No analytics data available</p>
        </div>
      </Card>
    );
  }

  // Pagination logic
  const totalVisitors = analytics.recentActivity.length;
  const totalPages = Math.ceil(totalVisitors / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedVisitors = analytics.recentActivity.slice(
    startIndex,
    endIndex
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const stats = [
    {
      label: "Total Visitors",
      value: analytics.visitors.total,
      icon: Users,
      color: "bg-purple-500",
    },
    {
      label: "Properties",
      value: analytics.properties.total,
      icon: Building,
      color: "bg-blue-500",
    },
    {
      label: "Total Residents",
      value: analytics.users.totalResidents,
      icon: UserCheck,
      color: "bg-green-500",
    },
    {
      label: "Security Guards",
      value: analytics.users.totalGuards,
      icon: UserCheck,
      color: "bg-yellow-500",
    },
  ];

  const visitorStats = [
    {
      label: "Pending",
      value: analytics.visitors.pending,
      variant: "warning" as const,
      icon: Clock,
    },
    {
      label: "Approved",
      value: analytics.visitors.approved,
      variant: "success" as const,
      icon: CheckCircle,
    },
    {
      label: "Rejected",
      value: analytics.visitors.rejected,
      variant: "danger" as const,
      icon: XCircle,
    },
    {
      label: "Checked In",
      value: analytics.visitors.checkedIn,
      variant: "info" as const,
      icon: LogIn,
    },
    // ✅ ADD THIS:
    {
      label: "Checked Out",
      value: analytics.visitors.checkedOut,
      variant: "default" as const,
      icon: LogOut,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Analytics Dashboard
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              System-wide statistics and insights
            </p>
          </div>

          <button
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 text-sm"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Date Filter with Calendar */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <h3 className="text-sm font-semibold text-gray-900">
                Date Filter
              </h3>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleDatePreset("today")}
                className="px-3 py-1.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
              >
                Today
              </button>
              <button
                onClick={() => handleDatePreset("week")}
                className="px-3 py-1.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
              >
                This Week
              </button>
              <button
                onClick={() => handleDatePreset("month")}
                className="px-3 py-1.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
              >
                This Month
              </button>
              <button
                onClick={() => handleDatePreset("all")}
                className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                All Time
              </button>
            </div>

            {/* Custom Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {(startDate || endDate) && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  {startDate && endDate
                    ? `Showing: ${format(
                        new Date(startDate),
                        "MMM dd, yyyy"
                      )} - ${format(new Date(endDate), "MMM dd, yyyy")}`
                    : startDate
                    ? `From: ${format(new Date(startDate), "MMM dd, yyyy")}`
                    : `Until: ${format(new Date(endDate), "MMM dd, yyyy")}`}
                </p>
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} hover>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className={`${stat.color} p-2 sm:p-3 rounded-lg`}>
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {stat.label}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Visitor Status Breakdown */}
      <Card>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
          Visitor Status Breakdown
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {visitorStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex justify-center mb-2">
                  <Icon
                    className={`h-6 w-6 sm:h-8 sm:w-8 ${
                      stat.variant === "success"
                        ? "text-green-500"
                        : stat.variant === "danger"
                        ? "text-red-500"
                        : stat.variant === "info"
                        ? "text-blue-500"
                        : "text-yellow-500"
                    }`}
                  />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Visitor Details Table */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            All Visitors ({totalVisitors})
          </h3>
          <button
            onClick={exportToCSV}
            disabled={totalVisitors === 0}
            className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-xs sm:text-sm"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {totalVisitors === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No visitors found for selected date range
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Visitor
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Contact
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Property/Unit
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Purpose
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Request
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Approved
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Check-In
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Check-Out
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedVisitors.map((visitor) => (
                    <tr key={visitor._id} className="hover:bg-gray-50">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={visitor.photoUrl}
                            alt={visitor.name}
                            onClick={() =>
                              handleViewPhoto(visitor.photoUrl, "Visitor Photo")
                            }
                            className="h-10 w-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-purple-500"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {visitor.name}
                            </p>
                            <div className="flex items-center gap-1 text-xs">
                              {visitor.isWalkIn && (
                                <Badge variant="info" size="sm">
                                  Walk-in
                                </Badge>
                              )}
                              {visitor.vehicleNumber && (
                                <span className="text-gray-500">
                                  🚗 {visitor.vehicleNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-sm text-gray-900">{visitor.phone}</p>
                        {visitor.phoneVerified && (
                          <p className="text-xs text-green-600">✓ Verified</p>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {visitor.property?.name || "-"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Unit {visitor.hostResident?.unitNumber || "-"}
                          </p>
                          <p className="text-xs text-gray-600">
                            {visitor.hostResident?.fullName || "-"}
                          </p>
                          {visitor.isForwarded && (
                            <p className="text-xs text-purple-600 mt-1">
                              ↗ Forwarded to {visitor.forwardedTo?.fullName}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-sm text-gray-900 max-w-xs truncate">
                          {visitor.purpose}
                        </p>
                        {visitor.assetPhotoUrl && (
                          <div className="flex items-center gap-1 mt-1">
                            <Package className="h-3 w-3 text-purple-500" />
                            <span
                              className="text-xs text-purple-600 cursor-pointer hover:underline"
                              onClick={() =>
                                handleViewPhoto(
                                  visitor.assetPhotoUrl!,
                                  "Asset Photo"
                                )
                              }
                            >
                              {visitor.assetDescription || "View Asset"}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-xs text-gray-900">
                          {format(new Date(visitor.createdAt), "MMM dd")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(visitor.createdAt), "HH:mm")}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        {visitor.approvedAt ? (
                          <>
                            <p className="text-xs text-gray-900">
                              {format(new Date(visitor.approvedAt), "MMM dd")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(visitor.approvedAt), "HH:mm")}
                            </p>
                          </>
                        ) : visitor.rejectedAt ? (
                          <>
                            <p className="text-xs text-red-600">
                              {format(new Date(visitor.rejectedAt), "MMM dd")}
                            </p>
                            <p className="text-xs text-red-500">
                              {format(new Date(visitor.rejectedAt), "HH:mm")}
                            </p>
                          </>
                        ) : (
                          <span className="text-xs text-yellow-600">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {visitor.checkInTime ? (
                          <>
                            <p className="text-xs text-gray-900">
                              {format(new Date(visitor.checkInTime), "MMM dd")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(visitor.checkInTime), "HH:mm")}
                            </p>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {visitor.checkOutTime ? (
                          <>
                            <p className="text-xs text-gray-900">
                              {format(new Date(visitor.checkOutTime), "MMM dd")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(visitor.checkOutTime), "HH:mm")}
                            </p>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <Badge
                          variant={
                            visitor.status === "approved"
                              ? "success"
                              : visitor.status === "rejected"
                              ? "danger"
                              : visitor.status === "checked_in"
                              ? "info"
                              : visitor.status === "checked_out"
                              ? "default"
                              : "warning"
                          }
                          size="sm"
                        >
                          {visitor.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <button
                          onClick={() => handleViewDetails(visitor)}
                          className="text-purple-600 hover:text-purple-700 flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {paginatedVisitors.map((visitor) => (
                <div
                  key={visitor._id}
                  className="bg-gray-50 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={visitor.photoUrl}
                          alt={visitor.name}
                          onClick={() =>
                            handleViewPhoto(visitor.photoUrl, "Visitor Photo")
                          }
                          className="h-12 w-12 rounded-full object-cover cursor-pointer"
                        />
                        {visitor.assetPhotoUrl && (
                          <div
                            onClick={() =>
                              handleViewPhoto(
                                visitor.assetPhotoUrl!,
                                "Asset Photo"
                              )
                            }
                            className="absolute -bottom-1 -right-1 bg-purple-500 rounded-full p-1 cursor-pointer"
                          >
                            <Package className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {visitor.name}
                        </p>
                        <p className="text-xs text-gray-500">{visitor.phone}</p>
                        {visitor.isWalkIn && (
                          <Badge variant="info" size="sm">
                            Walk-in
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={
                        visitor.status === "approved"
                          ? "success"
                          : visitor.status === "rejected"
                          ? "danger"
                          : visitor.status === "checked_in"
                          ? "info"
                          : visitor.status === "checked_out"
                          ? "default"
                          : "warning"
                      }
                      size="sm"
                    >
                      {visitor.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">Property</p>
                      <p className="text-gray-900 font-medium">
                        {visitor.property?.name || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Unit</p>
                      <p className="text-gray-900 font-medium">
                        {visitor.hostResident?.unitNumber || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Request</p>
                      <p className="text-gray-900 font-medium">
                        {format(new Date(visitor.createdAt), "MMM dd, HH:mm")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Check-In</p>
                      <p className="text-gray-900 font-medium">
                        {visitor.checkInTime
                          ? format(
                              new Date(visitor.checkInTime),
                              "MMM dd, HH:mm"
                            )
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewDetails(visitor)}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Full Details
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(endIndex, totalVisitors)}
                  </span>{" "}
                  of <span className="font-medium">{totalVisitors}</span>{" "}
                  visitors
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-3 py-1 rounded-lg text-sm ${
                              currentPage === page
                                ? "bg-purple-600 text-white"
                                : "border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span key={page} className="px-2">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Photo Modal */}
      {showPhotoModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPhotoModal(false)}
        >
          <div className="relative max-w-4xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">
                {modalPhotoTitle}
              </h3>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="text-white hover:text-gray-300"
              >
                <XCircle className="h-8 w-8" />
              </button>
            </div>
            <img
              src={modalPhotoUrl}
              alt={modalPhotoTitle}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Visitor Details Modal */}
      {showDetailsModal && selectedVisitor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full my-8">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg z-10">
              <h3 className="text-xl font-bold text-gray-900">
                Complete Visitor Details
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Photos Section - UPDATED WITH DUAL PHOTOS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Visitor Photo */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">
                      Visitor Photo
                    </p>
                    <button
                      onClick={() =>
                        handleViewPhoto(
                          selectedVisitor.photoUrl,
                          "Visitor Photo"
                        )
                      }
                      className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      View Full
                    </button>
                  </div>
                  <img
                    src={selectedVisitor.photoUrl}
                    alt={selectedVisitor.name}
                    onClick={() =>
                      handleViewPhoto(selectedVisitor.photoUrl, "Visitor Photo")
                    }
                    className="w-full h-64 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-purple-500 transition-all"
                  />
                </div>

                {/* Asset Photo */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">
                      Asset Photo
                    </p>
                    {selectedVisitor.assetPhotoUrl && (
                      <button
                        onClick={() =>
                          handleViewPhoto(
                            selectedVisitor.assetPhotoUrl!,
                            "Asset Photo"
                          )
                        }
                        className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View Full
                      </button>
                    )}
                  </div>
                  {selectedVisitor.assetPhotoUrl ? (
                    <>
                      <img
                        src={selectedVisitor.assetPhotoUrl}
                        alt="Asset"
                        onClick={() =>
                          handleViewPhoto(
                            selectedVisitor.assetPhotoUrl!,
                            "Asset Photo"
                          )
                        }
                        className="w-full h-64 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-purple-500 transition-all"
                      />
                      {selectedVisitor.assetDescription && (
                        <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded">
                          <p className="text-xs font-medium text-purple-900">
                            Asset Description:
                          </p>
                          <p className="text-xs text-purple-700 mt-1">
                            {selectedVisitor.assetDescription}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No Asset Photo</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedVisitor.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedVisitor.phone}
                    {selectedVisitor.phoneVerified && (
                      <span className="ml-2 text-green-600">✓</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Entry Type</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedVisitor.isWalkIn ? "Walk-in" : "Pre-registered"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Property</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedVisitor.property?.name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Unit Number</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedVisitor.hostResident?.unitNumber || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Host Resident</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedVisitor.hostResident?.fullName || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Resident Phone</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedVisitor.hostResident?.phoneNumber || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Vehicle Number</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedVisitor.vehicleNumber || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Number of Persons</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedVisitor.numberOfPersons || 1}
                  </p>
                </div>
              </div>

              {/* Forwarding Info */}
              {selectedVisitor.isForwarded && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm font-semibold text-purple-900 mb-2">
                    Forwarding Information
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {selectedVisitor.forwardedFrom && (
                      <div>
                        <p className="text-xs text-purple-700">
                          Forwarded From
                        </p>
                        <p className="font-medium text-purple-900">
                          {selectedVisitor.forwardedFrom.fullName} (Unit{" "}
                          {selectedVisitor.forwardedFrom.unitNumber})
                        </p>
                      </div>
                    )}
                    {selectedVisitor.forwardedTo && (
                      <div>
                        <p className="text-xs text-purple-700">Forwarded To</p>
                        <p className="font-medium text-purple-900">
                          {selectedVisitor.forwardedTo.fullName} (Unit{" "}
                          {selectedVisitor.forwardedTo.unitNumber})
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Purpose */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Purpose of Visit</p>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {selectedVisitor.purpose}
                </p>
              </div>

              {/* Complete Timeline */}
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  Complete Activity Timeline
                </p>
                <div className="space-y-3">
                  {/* Request Sent */}
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="bg-blue-500 p-2 rounded-full">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-blue-900">
                        Request Sent
                      </p>
                      <p className="text-sm font-semibold text-blue-700">
                        {format(
                          new Date(selectedVisitor.createdAt),
                          "MMM dd, yyyy HH:mm:ss"
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Approved */}
                  {selectedVisitor.approvedAt && (
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="bg-green-500 p-2 rounded-full">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-green-900">
                          Approved
                        </p>
                        <p className="text-sm font-semibold text-green-700">
                          {format(
                            new Date(selectedVisitor.approvedAt),
                            "MMM dd, yyyy HH:mm:ss"
                          )}
                        </p>
                        {selectedVisitor.approvedBy && (
                          <p className="text-xs text-green-600 mt-1">
                            By: {selectedVisitor.approvedBy}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rejected */}
                  {selectedVisitor.rejectedAt && (
                    <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                      <div className="bg-red-500 p-2 rounded-full">
                        <XCircle className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-red-900">
                          Rejected
                        </p>
                        <p className="text-sm font-semibold text-red-700">
                          {format(
                            new Date(selectedVisitor.rejectedAt),
                            "MMM dd, yyyy HH:mm:ss"
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Check-In */}
                  {selectedVisitor.checkInTime && (
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="bg-purple-500 p-2 rounded-full">
                        <LogIn className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-purple-900">
                          Checked In
                        </p>
                        <p className="text-sm font-semibold text-purple-700">
                          {format(
                            new Date(selectedVisitor.checkInTime),
                            "MMM dd, yyyy HH:mm:ss"
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Check-Out / Exit */}
                  {selectedVisitor.checkOutTime && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="bg-gray-500 p-2 rounded-full">
                        <LogOut className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-900">
                          Checked Out / Exit
                        </p>
                        <p className="text-sm font-semibold text-gray-700">
                          {format(
                            new Date(selectedVisitor.checkOutTime),
                            "MMM dd, yyyy HH:mm:ss"
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Last Updated */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="bg-gray-400 p-2 rounded-full">
                      <RefreshCw className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-900">
                        Last Updated
                      </p>
                      <p className="text-sm font-semibold text-gray-700">
                        {format(
                          new Date(selectedVisitor.updatedAt),
                          "MMM dd, yyyy HH:mm:ss"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div className="flex items-center justify-center pt-4 border-t">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">Current Status</p>
                  <Badge
                    variant={
                      selectedVisitor.status === "approved"
                        ? "success"
                        : selectedVisitor.status === "rejected"
                        ? "danger"
                        : selectedVisitor.status === "checked_in"
                        ? "info"
                        : selectedVisitor.status === "checked_out"
                        ? "default"
                        : "warning"
                    }
                    size="lg"
                  >
                    {selectedVisitor.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
