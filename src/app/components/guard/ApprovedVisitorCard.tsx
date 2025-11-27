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
  hostResidentId: {
    name: string;
    unitNumber: string;
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

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await axios.post("/api/guard/visitors/check-in", {
        visitorId: visitor._id,
      });
      onCheckIn();
    } catch (error) {
      console.error("Check-in error:", error);
      alert("Failed to check-in visitor");
    } finally {
      setLoading(false);
    }
  };

  return (
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
              Approved: {format(new Date(visitor.approvedAt), "MMM dd, HH:mm")}
            </div>

            <div className="flex items-center text-gray-600">
              <Home className="h-4 w-4 mr-2" />
              Unit {visitor.hostResidentId?.unitNumber}
            </div>

            <div className="flex items-center text-gray-600">
              <User className="h-4 w-4 mr-2" />
              Host: {visitor.hostResidentId?.name}
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
          fullWidth
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Allow Entry & Check-In
        </Button>
      </div>
    </Card>
  );
}
