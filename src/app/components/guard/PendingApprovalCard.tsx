"use client";

import React from "react";
import Card from "../shared/Card";
import Badge from "../shared/Badge";
import { User, Calendar, Clock, FileText, Home } from "lucide-react";
import { format } from "date-fns";

interface Visitor {
  _id: string;
  name: string;
  phone?: string;
  photoUrl: string;
  purpose: string;
  createdAt: string;
  hostResidentId: {
    name: string;
    unitNumber: string;
    phone: string;
  };
}

interface PendingApprovalCardProps {
  visitor: Visitor;
}

export default function PendingApprovalCard({
  visitor,
}: PendingApprovalCardProps) {
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
              <Badge variant="warning" size="sm" className="mt-1">
                Waiting for Approval
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
              {format(new Date(visitor.createdAt), "MMM dd, yyyy")}
            </div>

            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              {format(new Date(visitor.createdAt), "HH:mm")}
            </div>

            <div className="flex items-center text-gray-600">
              <Home className="h-4 w-4 mr-2" />
              Unit {visitor.hostResidentId?.unitNumber}
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Visiting:</span>{" "}
              {visitor.hostResidentId?.name}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Purpose:</span> {visitor.purpose}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
