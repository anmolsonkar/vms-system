"use client";

import React, { useState } from "react";
import Card from "../shared/Card";
import Badge from "../shared/Badge";
import Button from "../shared/Button";
import { User, Calendar, Clock, Home, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import axios from "axios";

interface Visitor {
  _id: string;
  name: string;
  phone?: string;
  photoUrl: string;
  purpose: string;
  approvedAt: string;
  hostResidentId?: {
    _id: string;
    fullName?: string;
    name?: string;
    unitNumber?: string;
  };
}

interface ApprovedVisitorCardProps {
  visitor: Visitor;
  onCheckIn: () => void;
}

export default function ApprovedVisitorCard({
  visitor,
  onCheckIn,
}: ApprovedVisitorCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckIn = async () => {
    setLoading(true);
    setError(null);

    try {
      await axios.post("/api/guard/visitors/check-in", {
        visitorId: visitor._id,
      });
      onCheckIn();
    } catch (error: any) {
      console.error("Check-in error:", error);
      setError(error.response?.data?.error || "Failed to check-in visitor");
    } finally {
      setLoading(false);
    }
  };

  // Get host name - try fullName first, fallback to name
  const hostName =
    visitor.hostResidentId?.fullName || visitor.hostResidentId?.name || "N/A";
  const unitNumber = visitor.hostResidentId?.unitNumber || "N/A";

  return (
    <>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Card hover>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Photo */}
          <img
            src={visitor.photoUrl}
            alt={visitor.name}
            className="h-24 w-24 rounded-lg object-cover border-2 border-gray-200"
          />

          {/* Details */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {visitor.name}
                </h3>
                <Badge variant="success" size="sm" className="mt-1">
                  Approved - Ready for Entry
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {visitor.phone && (
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  {visitor.phone}
                </div>
              )}

              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                Approved:{" "}
                {format(new Date(visitor.approvedAt), "MMM dd, HH:mm")}
              </div>

              <div className="flex items-center text-gray-600">
                <Home className="h-4 w-4 mr-2" />
                Unit {unitNumber}
              </div>

              <div className="flex items-center text-gray-600">
                <User className="h-4 w-4 mr-2" />
                Host: {hostName}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Purpose:</span> {visitor.purpose}
              </p>
            </div>
          </div>
        </div>

        {/* Check-in Button */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button
            variant="success"
            onClick={handleCheckIn}
            loading={loading}
            disabled={loading}
            fullWidth
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Allow Entry & Check-In
          </Button>
        </div>
      </Card>
    </>
  );
}
