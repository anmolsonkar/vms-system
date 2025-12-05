"use client";

import React, { useState, useEffect } from "react";
import Card from "../shared/Card";
import Button from "../shared/Button";
import Badge from "../shared/Badge";
import Modal from "../shared/Modal";
import {
  User,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  Car,
  Forward,
  Package,
} from "lucide-react";
import { format } from "date-fns";
import axios from "axios";

interface Visitor {
  _id: string;
  name: string;
  phone?: string;
  photoUrl: string;
  assetPhotoUrl?: string; // ✅ NEW
  assetDescription?: string; // ✅ NEW
  purpose: string;
  vehicleNumber?: string;
  numberOfPersons: number;
  createdAt: string;
  idCardType?: string;
  isForwarded?: boolean; // ✅ NEW
  forwardedFrom?: {
    _id: string;
    fullName: string;
  }; // ✅ NEW
  forwardingNote?: string; // ✅ NEW
}

interface Resident {
  _id: string;
  fullName: string;
  unitNumber: string;
  phoneNumber: string;
}

interface ApprovalCardProps {
  visitor: Visitor;
  onApprove: () => void;
  onReject: () => void;
}

export default function ApprovalCard({
  visitor,
  onApprove,
  onReject,
}: ApprovalCardProps) {
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false); // ✅ NEW
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false); // ✅ NEW
  const [rejectReason, setRejectReason] = useState("");
  const [residents, setResidents] = useState<Resident[]>([]); // ✅ NEW
  const [selectedResident, setSelectedResident] = useState(""); // ✅ NEW
  const [forwardNote, setForwardNote] = useState(""); // ✅ NEW

  // ✅ NEW: Fetch residents for forwarding
  useEffect(() => {
    if (showForwardModal) {
      fetchResidents();
    }
  }, [showForwardModal]);

  const fetchResidents = async () => {
    try {
      const response = await axios.get("/api/resident/residents/list");
      if (response.data.success) {
        setResidents(response.data.data.residents);
      }
    } catch (error) {
      console.error("Fetch residents error:", error);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      await axios.post("/api/resident/visitors/approve", {
        visitorId: visitor._id,
      });
      onApprove();
    } catch (error) {
      console.error("Approve error:", error);
      alert("Failed to approve visitor");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/resident/visitors/reject", {
        visitorId: visitor._id,
        reason: rejectReason,
      });
      setShowRejectModal(false);
      onReject();
    } catch (error) {
      console.error("Reject error:", error);
      alert("Failed to reject visitor");
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Handle forward
  const handleForward = async () => {
    if (!selectedResident) {
      alert("Please select a resident to forward to");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/resident/visitors/forward", {
        visitorId: visitor._id,
        forwardToResidentId: selectedResident,
        note: forwardNote,
      });
      setShowForwardModal(false);
      alert("Visitor request forwarded successfully!");
      onApprove(); // Refresh the list
    } catch (error: any) {
      console.error("Forward error:", error);
      alert(error.response?.data?.error || "Failed to forward visitor request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card hover shadow="md">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Photo */}
          <div
            className="shrink-0 cursor-pointer"
            onClick={() => setShowPhotoModal(true)}
          >
            <img
              src={visitor.photoUrl}
              alt={visitor.name}
              className="h-24 w-24 rounded-lg object-cover border-2 border-gray-200"
            />
          </div>

          {/* Details */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {visitor.name}
                </h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="warning" size="sm">
                    Pending Approval
                  </Badge>
                  {visitor.isForwarded && (
                    <Badge variant="info" size="sm">
                      <Forward className="h-3 w-3 mr-1" />
                      Forwarded
                    </Badge>
                  )}
                  {visitor.assetPhotoUrl && (
                    <Badge variant="default" size="sm">
                      <Package className="h-3 w-3 mr-1" />
                      Has Assets
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* ✅ NEW: Forwarding Info */}
            {visitor.isForwarded && visitor.forwardedFrom && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Forwarded by:</strong>{" "}
                  {visitor.forwardedFrom.fullName}
                </p>
                {visitor.forwardingNote && (
                  <p className="text-sm text-blue-700 mt-1">
                    <strong>Note:</strong> {visitor.forwardingNote}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {visitor.phone && (
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  {visitor.phone}
                </div>
              )}

              {visitor.idCardType && (
                <div className="flex items-center text-gray-600">
                  <FileText className="h-4 w-4 mr-2" />
                  {visitor.idCardType.toUpperCase()}
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

              {visitor.vehicleNumber && (
                <div className="flex items-center text-gray-600">
                  <Car className="h-4 w-4 mr-2" />
                  {visitor.vehicleNumber}
                </div>
              )}

              <div className="flex items-center text-gray-600">
                <User className="h-4 w-4 mr-2" />
                {visitor.numberOfPersons} Person(s)
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Purpose:</span> {visitor.purpose}
              </p>
            </div>

            {/* ✅ NEW: Asset Info */}
            {visitor.assetDescription && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Assets:</span>{" "}
                  {visitor.assetDescription}
                </p>
                {visitor.assetPhotoUrl && (
                  <button
                    onClick={() => setShowAssetModal(true)}
                    className="text-sm text-purple-600 hover:text-purple-700 mt-1"
                  >
                    View Asset Photo
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
          <Button
            variant="success"
            onClick={handleApprove}
            loading={loading}
            disabled={loading}
            fullWidth
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowForwardModal(true)}
            disabled={loading}
            fullWidth
          >
            <Forward className="h-4 w-4 mr-2" />
            Forward
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowRejectModal(true)}
            disabled={loading}
            fullWidth
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </div>
      </Card>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Visitor"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Please provide a reason for rejecting{" "}
            <strong>{visitor.name}</strong>
          </p>

          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter reason for rejection..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={4}
          />

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowRejectModal(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              loading={loading}
              fullWidth
            >
              Confirm Reject
            </Button>
          </div>
        </div>
      </Modal>

      {/* ✅ NEW: Forward Modal */}
      <Modal
        isOpen={showForwardModal}
        onClose={() => setShowForwardModal(false)}
        title="Forward Visitor Request"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Forward <strong>{visitor.name}</strong>'s request to another
            resident
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Resident <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedResident}
              onChange={(e) => setSelectedResident(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select a resident</option>
              {residents.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.fullName} - Unit {r.unitNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note (Optional)
            </label>
            <textarea
              value={forwardNote}
              onChange={(e) => setForwardNote(e.target.value)}
              placeholder="Add a note for the resident..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowForwardModal(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleForward}
              loading={loading}
              fullWidth
            >
              <Forward className="h-4 w-4 mr-2" />
              Forward Request
            </Button>
          </div>
        </div>
      </Modal>

      {/* Photo Modal */}
      <Modal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        title={visitor.name}
        size="lg"
      >
        <img
          src={visitor.photoUrl}
          alt={visitor.name}
          className="w-full rounded-lg"
        />
      </Modal>

      {/* ✅ NEW: Asset Photo Modal */}
      {visitor.assetPhotoUrl && (
        <Modal
          isOpen={showAssetModal}
          onClose={() => setShowAssetModal(false)}
          title="Asset Photo"
          size="lg"
        >
          <div className="space-y-3">
            <img
              src={visitor.assetPhotoUrl}
              alt="Asset"
              className="w-full rounded-lg"
            />
            {visitor.assetDescription && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">
                  Description:
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {visitor.assetDescription}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
