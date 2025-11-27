"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/app/components/layout/DashboardLayout";
import Card from "@/app/components/shared/Card";
import Badge from "@/app/components/shared/Badge";
import Button from "@/app/components/shared/Button";
import Input from "@/app/components/shared/Input";
import LoadingSpinner from "@/app/components/shared/LoadingSpinner";
import { ChevronLeft, ChevronRight, History, Calendar } from "lucide-react";
import { format } from "date-fns";
import axios from "axios";

export default function GuardHistoryPage() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    fetchHistory();
  }, [page, date]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/guard/visitors/history", {
        params: { page, limit: 10, date },
      });

      if (response.data.success) {
        setVisitors(response.data.data.visitors);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Fetch history error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "checked_in":
        return "info";
      case "checked_out":
        return "default";
      default:
        return "warning";
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="guard">
        <LoadingSpinner text="Loading history..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="guard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Visitor History
            </h1>
            <p className="text-gray-600 mt-1">View past visitor records</p>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <Input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setPage(1);
              }}
              className="w-48"
            />
          </div>
        </div>

        {/* History Table */}
        {visitors.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No visitors found for this date</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {visitors.map((visitor: any) => (
              <Card key={visitor._id} hover>
                <div className="flex items-center gap-4">
                  <img
                    src={visitor.photoUrl}
                    alt={visitor.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {visitor.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Unit {visitor.hostResidentId?.unitNumber} •{" "}
                          {visitor.hostResidentId?.name}
                        </p>
                      </div>
                      <Badge
                        variant={getStatusBadgeVariant(visitor.status)}
                        size="sm"
                      >
                        {visitor.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Registered:</span>{" "}
                        {format(new Date(visitor.createdAt), "HH:mm")}
                      </div>
                      {visitor.checkInTime && (
                        <div>
                          <span className="font-medium">Check-in:</span>{" "}
                          {format(new Date(visitor.checkInTime), "HH:mm")}
                        </div>
                      )}

                      <div>
                        <span className="font-medium">Purpose:</span>{" "}
                        {visitor.purpose}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>

            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
