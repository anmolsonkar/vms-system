"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { format } from "date-fns";
import axios from "axios";

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
  recentActivity: any[];
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("/api/superadmin/analytics");

      if (response.data.success) {
        // Map the API response to match our interface
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
      }
    } catch (error: any) {
      console.error("Fetch analytics error:", error);
      setError(error.response?.data?.error || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
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
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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

  const stats = [
    {
      label: "Total Visitors",
      value: analytics.visitors.total,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Properties",
      value: analytics.properties.total,
      icon: Building,
      color: "bg-purple-500",
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
      label: "Pending Approval",
      value: analytics.visitors.pending,
      variant: "warning" as const,
    },
    {
      label: "Approved",
      value: analytics.visitors.approved,
      variant: "success" as const,
    },
    {
      label: "Rejected",
      value: analytics.visitors.rejected,
      variant: "danger" as const,
    },
    {
      label: "Checked In",
      value: analytics.visitors.checkedIn,
      variant: "info" as const,
    },
  ];

  const timeStats = [
    { label: "Today", value: analytics.visitors.today },
    { label: "This Week", value: analytics.visitors.thisWeek },
    { label: "This Month", value: analytics.visitors.thisMonth },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Analytics Dashboard
        </h2>
        <p className="text-gray-600 mt-1">
          System-wide statistics and insights
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} hover>
              <div className="flex items-center space-x-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Visitor Status Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {visitorStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <Badge variant={stat.variant} size="lg" className="mb-2">
                {stat.value}
              </Badge>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Time-based Stats */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Visitor Trends
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {timeStats.map((stat) => (
            <div key={stat.label} className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">visitors</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Visitors */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Visitors (Last 10)
        </h3>

        {analytics.recentActivity.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No recent visitors</p>
          </div>
        ) : (
          <div className="space-y-3">
            {analytics.recentActivity.map((visitor) => (
              <div
                key={visitor._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={visitor.photoUrl}
                    alt={visitor.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {visitor.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(visitor.createdAt), "MMM dd, HH:mm")}
                    </p>
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
                      : "warning"
                  }
                  size="sm"
                >
                  {visitor.status.toUpperCase().replace("_", " ")}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
