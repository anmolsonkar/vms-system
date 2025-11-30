"use client";

import React, { useState, useEffect } from "react";
import Card from "../shared/Card";
import Badge from "../shared/Badge";
import Button from "../shared/Button";
import Select from "../shared/Select";
import LoadingSpinner from "../shared/LoadingSpinner";
import ExitButton from "./ExitButton";
import { format } from "date-fns";
import { User, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import {
  VISITOR_STATUS_LABELS,
  VISITOR_STATUS_COLORS,
} from "@/app/lib/constants/status";

interface Visitor {
  _id: string;
  name: string;
  phone?: string;
  photoUrl: string;
  purpose: string;
  status: string;
  vehicleNumber?: string;
  createdAt: string;
  checkInTime?: string;
  approvedAt?: string;
  rejectedAt?: string;
}

export default function VisitorHistory() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/resident/visitors/history", {
        params: { page, limit: 10, status: statusFilter },
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

  useEffect(() => {
    fetchHistory();
  }, [page, statusFilter]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "danger";
      case "checked_in":
        return "info";
      case "checked_out":
        return "default";
      default:
        return "default";
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading history..." />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Visitor History
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-0.5 sm:mt-1">
            View all your past visitors
          </p>
        </div>

        <Select
          options={[
            { value: "all", label: "All Status" },
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
            { value: "checked_in", label: "Checked In" },
            { value: "checked_out", label: "Checked Out" },
          ]}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-48"
        />
      </div>

      {/* Visitors List */}
      {visitors.length === 0 ? (
        <Card>
          <div className="text-center py-8 sm:py-12">
            <User className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-gray-500">
              No visitors found
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {visitors.map((visitor) => (
            <Card key={visitor._id} hover>
              <div className="flex gap-3 sm:gap-4">
                {/* Photo - Left aligned */}
                <img
                  src={visitor.photoUrl}
                  alt={visitor.name}
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg object-cover border-2 border-gray-200 shrink-0"
                />

                {/* Details - Right side, takes remaining space */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        {visitor.name}
                      </h3>
                      <Badge
                        variant={getStatusBadgeVariant(visitor.status)}
                        size="sm"
                        className="mt-1"
                      >
                        {
                          VISITOR_STATUS_LABELS[
                            visitor.status as keyof typeof VISITOR_STATUS_LABELS
                          ]
                        }
                      </Badge>
                    </div>

                    {visitor.status === "checked_in" && (
                      <div className="shrink-0">
                        <ExitButton
                          visitorId={visitor._id}
                          visitorName={visitor.name}
                          onExitMarked={fetchHistory}
                        />
                      </div>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">📅</span>
                      <span className="truncate">
                        {format(
                          new Date(visitor.createdAt),
                          "MMM dd, yyyy HH:mm"
                        )}
                      </span>
                    </div>

                    {visitor.vehicleNumber && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">🚗</span>
                        <span className="truncate">
                          {visitor.vehicleNumber}
                        </span>
                      </div>
                    )}

                    <div className="pt-1">
                      <span className="font-medium text-gray-700">
                        Purpose:{" "}
                      </span>
                      <span className="text-gray-600">{visitor.purpose}</span>
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
        <div className="flex items-center justify-center gap-3 sm:gap-4 pt-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-xs sm:text-sm text-gray-600 font-medium">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
