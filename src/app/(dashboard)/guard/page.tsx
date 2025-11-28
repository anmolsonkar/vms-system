"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/layout/DashboardLayout";
import Card from "@/app/components/shared/Card";
import LoadingSpinner from "@/app/components/shared/LoadingSpinner";
import { Clock, CheckCircle, UserCheck, AlertCircle, Bell } from "lucide-react";
import axios from "axios";

export default function GuardDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    active: 0,
    exitMarked: 0,
  });
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);

  const fetchStats = useCallback(async () => {
    try {
      const [pendingRes, approvedRes, activeRes] = await Promise.all([
        axios.get("/api/guard/visitors/pending-approval"),
        axios.get("/api/guard/visitors/approved"),
        axios.get("/api/guard/visitors/active"),
      ]);

      const activeVisitors = activeRes.data.success
        ? activeRes.data.data.visitors
        : [];
      const exitMarked = activeVisitors.filter(
        (v: any) => v.markedExitAt
      ).length;

      setStats({
        pending: pendingRes.data.success
          ? pendingRes.data.data.visitors.length
          : 0,
        approved: approvedRes.data.success
          ? approvedRes.data.data.visitors.length
          : 0,
        active: activeVisitors.length,
        exitMarked,
      });
    } catch (error) {
      console.error("Fetch stats error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get("/api/guard/notifications/unread-count");
      if (res.data.success) {
        setNotificationCount(res.data.count || 0);
      }
    } catch (error) {
      console.error("Notification fetch error:", error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStats();
    fetchNotifications();
  }, [fetchStats, fetchNotifications]);

  // Real-time polling
  useEffect(() => {
    const statsInterval = setInterval(fetchStats, 5000); // Every 5 seconds
    const notifInterval = setInterval(fetchNotifications, 3000); // Every 3 seconds

    return () => {
      clearInterval(statsInterval);
      clearInterval(notifInterval);
    };
  }, [fetchStats, fetchNotifications]);

  // Handle notification click - navigate to notifications page
  const handleNotificationClick = () => {
    router.push("/guard/notifications");
  };

  if (loading) {
    return (
      <DashboardLayout role="guard">
        <LoadingSpinner fullScreen text="Loading dashboard..." />
      </DashboardLayout>
    );
  }

  const statCards = [
    {
      label: "Pending Approval",
      value: stats.pending,
      icon: Clock,
      color: "bg-yellow-500",
      description: "Waiting for resident approval",
    },
    {
      label: "Ready for Entry",
      value: stats.approved,
      icon: CheckCircle,
      color: "bg-green-500",
      description: "Approved visitors awaiting check-in",
    },
    {
      label: "Currently Inside",
      value: stats.active,
      icon: UserCheck,
      color: "bg-purple-500",
      description: "Checked-in visitors",
    },
    {
      label: "Exit Marked",
      value: stats.exitMarked,
      icon: AlertCircle,
      color: "bg-orange-500",
      description: "Verify at gate",
    },
  ];

  return (
    <DashboardLayout role="guard">
      <div className="space-y-6">
        {/* Header with Notification Bell */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Security Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor and manage visitor access
            </p>
          </div>

          {/* Notification Bell */}
          <button
            onClick={handleNotificationClick}
            className="relative p-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Bell className="h-6 w-6 text-gray-600" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} hover>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {stat.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/guard/pending"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <Clock className="h-8 w-8 text-gray-600 mb-2" />
              <h4 className="font-medium text-gray-900">View Pending</h4>
              <p className="text-sm text-gray-500 mt-1">
                Check visitors awaiting approval
              </p>
            </a>

            <a
              href="/guard/active-visitors"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <UserCheck className="h-8 w-8 text-gray-600 mb-2" />
              <h4 className="font-medium text-gray-900">Active Visitors</h4>
              <p className="text-sm text-gray-500 mt-1">
                See who's currently inside
              </p>
            </a>

            <a
              href="/guard/manual-entry"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <CheckCircle className="h-8 w-8 text-gray-600 mb-2" />
              <h4 className="font-medium text-gray-900">Manual Entry</h4>
              <p className="text-sm text-gray-500 mt-1">
                Register walk-in visitors
              </p>
            </a>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
