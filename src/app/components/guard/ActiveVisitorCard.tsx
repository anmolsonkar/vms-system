"use client";

import React from "react";
import Card from "../shared/Card";
import Badge from "../shared/Badge";
import { User, Clock, Home, AlertCircle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface Visitor {
  _id: string;
  name: string;
  phone?: string;
  photoUrl: string;
  checkInTime: string;
  markedExitAt?: string;
  hostResidentId: {
    name: string;
    unitNumber: string;
  };
}

interface ActiveVisitorCardProps {
  visitor: Visitor;
}

export default function ActiveVisitorCard({ visitor }: ActiveVisitorCardProps) {
  const duration = formatDistanceToNow(new Date(visitor.checkInTime), {
    addSuffix: false,
  });

  return (
    <Card
      hover
      className={visitor.markedExitAt ? "bg-yellow-50 border-yellow-300" : ""}
    >
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
              {visitor.markedExitAt ? (
                <Badge variant="warning" size="sm" className="mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Exit Marked - Verify at Gate
                </Badge>
              ) : (
                <Badge variant="info" size="sm" className="mt-1">
                  Currently Inside
                </Badge>
              )}
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
              <Clock className="h-4 w-4 mr-2" />
              Inside for: {duration}
            </div>

            <div className="flex items-center text-gray-600">
              <Home className="h-4 w-4 mr-2" />
              Unit {visitor.hostResidentId.unitNumber}
            </div>

            <div className="flex items-center text-gray-600">
              <User className="h-4 w-4 mr-2" />
              Host: {visitor.hostResidentId.name}
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200 text-sm text-gray-600">
            <p>
              <span className="font-medium">Check-in Time:</span>{" "}
              {format(new Date(visitor.checkInTime), "MMM dd, yyyy HH:mm")}
            </p>
            {visitor.markedExitAt && (
              <p className="mt-1 text-yellow-700">
                <span className="font-medium">Exit Marked:</span>{" "}
                {format(new Date(visitor.markedExitAt), "MMM dd, yyyy HH:mm")}
              </p>
            )}
          </div>
        </div>
      </div>

      {visitor.markedExitAt && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Resident has marked this visitor as exited. Please verify when
            they reach the gate.
          </p>
        </div>
      )}
    </Card>
  );
}
