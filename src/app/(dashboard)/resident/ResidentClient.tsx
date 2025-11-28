"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/app/components/layout/DashboardLayout";
import ApprovalCard from "@/app/components/resident/ApprovalCard";
import Card from "@/app/components/shared/Card";
import LoadingSpinner from "@/app/components/shared/LoadingSpinner";
import { UserCheck, Clock, CheckCircle, Bell } from "lucide-react";
import axios from "axios";

export default function ResidentClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pendingVisitors, setPendingVisitors] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, checkedIn: 0 });
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const [pendingRes, historyRes] = await Promise.all([
        axios.get("/api/resident/visitors/pending"),
        axios.get("/api/resident/visitors/history?limit=100"),
      ]);

      if (pendingRes.data.success) {
        setPendingVisitors(pendingRes.data.data.visitors);
      }

      if (historyRes.data.success) {
        const visitors = historyRes.data.data.visitors;
        setStats({
          pending: pendingRes.data.data.visitors.length,
          approved: visitors.filter((v: any) => v.status === "approved").length,
          checkedIn: visitors.filter((v: any) => v.status === "checked_in")
            .length,
        });
      }
    } catch (error) {
      console.error("Fetch data error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get("/api/resident/notifications/unread-count");
      if (res.data.success) {
        setNotificationCount(res.data.count || 0);
      }
    } catch (error) {
      console.error("Notification fetch error:", error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
    fetchNotifications();
  }, [fetchData, fetchNotifications]);

  // Real-time polling
  useEffect(() => {
    const dataInterval = setInterval(fetchData, 5000); // Every 5 seconds
    const notifInterval = setInterval(fetchNotifications, 3000); // Every 3 seconds

    return () => {
      clearInterval(dataInterval);
      clearInterval(notifInterval);
    };
  }, [fetchData, fetchNotifications]);

  // Handle notification click - navigate to notifications page
  const handleNotificationClick = () => {
    router.push("/resident/notifications");
  };

  if (loading) {
    return (
      <DashboardLayout role="resident">
        <LoadingSpinner fullScreen text="Loading dashboard..." />
      </DashboardLayout>
    );
  }

  const statCards = [
    {
      label: "Pending Approvals",
      value: stats.pending,
      icon: Clock,
      color: "bg-yellow-500",
    },
    {
      label: "Approved Today",
      value: stats.approved,
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      label: "Currently Inside",
      value: stats.checkedIn,
      icon: UserCheck,
      color: "bg-purple-500",
    },
  ];

  return (
    <DashboardLayout role="resident">
      <div className="space-y-6">
        {/* Header with Notification Bell */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's your visitor overview.
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((stat) => {
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

        {/* Pending Approvals */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Pending Approvals ({pendingVisitors.length})
          </h2>

          {pendingVisitors.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No pending approvals</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingVisitors.map((visitor: any) => (
                <ApprovalCard
                  key={visitor._id}
                  visitor={visitor}
                  onApprove={fetchData}
                  onReject={fetchData}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
