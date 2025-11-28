"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/app/components/layout/DashboardLayout";
import ApprovalCard from "@/app/components/resident/ApprovalCard";
import Card from "@/app/components/shared/Card";
import LoadingSpinner from "@/app/components/shared/LoadingSpinner";
import { UserCheck, Clock, CheckCircle } from "lucide-react";
import axios from "axios";

export default function ResidentDashboardPage() {
  const [pendingVisitors, setPendingVisitors] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, checkedIn: 0 });
  const [loading, setLoading] = useState(true);

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

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ✅ REAL-TIME POLLING - Refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

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
      color: "bg-blue-500",
    },
  ];

  return (
    <DashboardLayout role="resident">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's your visitor overview.
          </p>
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
