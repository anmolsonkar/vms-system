"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  Eye,
  LogOut,
} from "lucide-react";
import { format } from "date-fns";
import axios from "axios";

interface Visitor {
  _id: string;
  name: string;
  phone?: string;
  photoUrl: string;
  assetPhotoUrl?: string;
  assetDescription?: string;
  purpose: string;
  vehicleNumber?: string;
  numberOfPersons: number;
  status: string;
  createdAt: string;
  approvedAt?: string;
  checkInTime?: string;
  checkOutTime?: string;
  idCardType?: string;
  isForwarded?: boolean;
  forwardedFrom?: {
    _id: string;
    fullName: string;
    unitNumber: string;
  };
  forwardedTo?: {
    _id: string;
    fullName: string;
    unitNumber: string;
  };
  forwardingNote?: string;
  phoneVerified?: boolean;
  isWalkIn?: boolean;
}

interface Resident {
  _id: string;
  fullName: string;
  unitNumber: string;
  phoneNumber: string;
  email: string;
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
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [residents, setResidents] = useState<Resident[]>([]);
  const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
  const [selectedResident, setSelectedResident] = useState("");
  const [forwardNote, setForwardNote] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [markingExit, setMarkingExit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch residents for forwarding
  useEffect(() => {
    if (showForwardModal) {
      fetchResidents();
    }
  }, [showForwardModal]);

  // Filter residents based on search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredResidents(residents);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = residents.filter(
        (resident) =>
          resident.fullName.toLowerCase().includes(query) ||
          resident.unitNumber.toLowerCase().includes(query) ||
          resident.phoneNumber.includes(query) ||
          resident.email.toLowerCase().includes(query)
      );
      setFilteredResidents(filtered);
    }
  }, [searchQuery, residents]);

  const fetchResidents = async () => {
    try {
      const response = await axios.get("/api/resident/forward/residents");
      if (response.data.success) {
        setResidents(response.data.data.residents || []);
        setFilteredResidents(response.data.data.residents || []);
      }
    } catch (error) {
      console.error("Fetch residents error:", error);
      setError("Failed to load residents list");
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.post("/api/resident/visitors/approve", {
        visitorId: visitor._id,
      });
      setSuccess("Visitor approved successfully!");
      setTimeout(() => {
        onApprove();
      }, 1000);
    } catch (error: any) {
      console.error("Approve error:", error);
      setError(error.response?.data?.error || "Failed to approve visitor");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.post("/api/resident/visitors/reject", {
        visitorId: visitor._id,
        reason: rejectReason,
      });
      setShowRejectModal(false);
      setSuccess("Visitor rejected successfully!");
      setTimeout(() => {
        onReject();
      }, 1000);
    } catch (error: any) {
      console.error("Reject error:", error);
      setError(error.response?.data?.error || "Failed to reject visitor");
    } finally {
      setLoading(false);
    }
  };

  const handleForward = async () => {
    if (!selectedResident) {
      setError("Please select a resident to forward to");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.post("/api/resident/forward", {
        visitorId: visitor._id,
        forwardToResidentId: selectedResident,
        note: forwardNote,
      });
      setShowForwardModal(false);
      setSelectedResident("");
      setForwardNote("");
      setSearchQuery("");
      setSuccess("Visitor request forwarded successfully!");
      setTimeout(() => {
        onApprove();
      }, 1000);
    } catch (error: any) {
      console.error("Forward error:", error);
      setError(
        error.response?.data?.error || "Failed to forward visitor request"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMarkExit = async () => {
    if (!confirm("Are you sure you want to mark this visitor as exited?")) {
      return;
    }

    setMarkingExit(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post("/api/resident/visitors/mark-exit", {
        visitorId: visitor._id,
      });

      if (response.data.success) {
        setSuccess("Visitor marked as exited successfully!");
        setTimeout(() => {
          onApprove(); // Refresh the list
        }, 1000);
      }
    } catch (error: any) {
      console.error("Mark exit error:", error);
      setError(
        error.response?.data?.error || "Failed to mark visitor as exited"
      );
    } finally {
      setMarkingExit(false);
    }
  };

  // Determine if current user can mark exit
  const canMarkExit =
    visitor.status === "checked_in" &&
    (!visitor.isForwarded ||
      (visitor.forwardedTo && visitor.forwardedTo._id === session?.user?.id));

  return (
    <>
      {/* Alerts */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-lg flex items-start gap-2 text-sm">
          <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-3 py-2 rounded-lg flex items-start gap-2 text-sm">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

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
              className="h-24 w-24 rounded-lg object-cover border-2 border-gray-200 hover:border-purple-500 transition-all"
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
                  <Badge
                    variant={
                      visitor.status === "approved"
                        ? "success"
                        : visitor.status === "rejected"
                        ? "danger"
                        : visitor.status === "checked_in"
                        ? "info"
                        : visitor.status === "checked_out"
                        ? "default"
                        : "warning"
                    }
                    size="sm"
                  >
                    {visitor.status === "checked_in"
                      ? "CHECKED IN"
                      : visitor.status === "checked_out"
                      ? "CHECKED OUT"
                      : visitor.status === "pending"
                      ? "PENDING APPROVAL"
                      : visitor.status.toUpperCase()}
                  </Badge>
                  {visitor.isWalkIn && (
                    <Badge variant="info" size="sm">
                      Walk-in
                    </Badge>
                  )}
                  {visitor.phoneVerified && (
                    <Badge variant="success" size="sm">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
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

            {/* Forwarding Info */}
            {visitor.isForwarded && (
              <div className="space-y-2">
                {visitor.forwardedFrom && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <Forward className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Forwarded From</p>
                        <p>
                          {visitor.forwardedFrom.fullName} (Unit{" "}
                          {visitor.forwardedFrom.unitNumber})
                        </p>
                      </div>
                    </div>
                    {visitor.forwardingNote && (
                      <button
                        onClick={() => setShowNoteModal(true)}
                        className="text-xs text-blue-600 hover:underline mt-2"
                      >
                        View Forwarding Note
                      </button>
                    )}
                  </div>
                )}
                {visitor.forwardedTo && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-purple-800">
                      <Forward className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Forwarded To</p>
                        <p>
                          {visitor.forwardedTo.fullName} (Unit{" "}
                          {visitor.forwardedTo.unitNumber})
                        </p>
                      </div>
                    </div>
                  </div>
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

              {visitor.approvedAt && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approved:{" "}
                  {format(new Date(visitor.approvedAt), "MMM dd, HH:mm")}
                </div>
              )}

              {visitor.checkInTime && (
                <div className="flex items-center text-blue-600">
                  <User className="h-4 w-4 mr-2" />
                  Check-In:{" "}
                  {format(new Date(visitor.checkInTime), "MMM dd, HH:mm")}
                </div>
              )}

              {visitor.checkOutTime && (
                <div className="flex items-center text-gray-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Check-Out:{" "}
                  {format(new Date(visitor.checkOutTime), "MMM dd, HH:mm")}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Purpose:</span> {visitor.purpose}
              </p>
            </div>

            {/* Asset Info */}
            {visitor.assetDescription && (
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Assets:</span>{" "}
                      {visitor.assetDescription}
                    </p>
                  </div>
                  {visitor.assetPhotoUrl && (
                    <button
                      onClick={() => setShowAssetModal(true)}
                      className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      View Photo
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 pt-4 border-t border-gray-200">
          {visitor.status === "pending" && (
            <>
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
            </>
          )}

          {canMarkExit && (
            <Button
              variant="secondary"
              onClick={handleMarkExit}
              loading={markingExit}
              disabled={markingExit}
              fullWidth
            >
              <LogOut className="h-4 w-4 mr-2" />
              {markingExit ? "Marking Exit..." : "Mark Exit"}
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => setShowPhotoModal(true)}
            fullWidth
          >
            <Eye className="h-4 w-4 mr-2" />
            View Photo
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
              disabled={loading}
              fullWidth
            >
              Confirm Reject
            </Button>
          </div>
        </div>
      </Modal>

      {/* Forward Modal */}
      <Modal
        isOpen={showForwardModal}
        onClose={() => setShowForwardModal(false)}
        title="Forward Visitor Request"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">
              Forwarding request for:
            </p>
            <p className="font-semibold text-gray-900">{visitor.name}</p>
            <p className="text-sm text-gray-600">{visitor.phone}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Resident
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, unit, or phone..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Resident <span className="text-red-500">*</span>
            </label>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredResidents.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  No residents found
                </p>
              ) : (
                filteredResidents.map((resident) => (
                  <div
                    key={resident._id}
                    onClick={() => setSelectedResident(resident._id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedResident === resident._id
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
                    }`}
                  >
                    <p className="font-medium text-gray-900">
                      {resident.fullName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Unit {resident.unitNumber}
                    </p>
                    <p className="text-sm text-gray-500">
                      {resident.phoneNumber} • {resident.email}
                    </p>
                  </div>
                ))
              )}
            </div>
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
              disabled={loading || !selectedResident}
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

      {/* Asset Photo Modal */}
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

      {/* Forwarding Note Modal */}
      {showNoteModal && visitor.forwardingNote && (
        <Modal
          isOpen={showNoteModal}
          onClose={() => setShowNoteModal(false)}
          title="Forwarding Note"
          size="md"
        >
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-900">{visitor.forwardingNote}</p>
            </div>
            {visitor.forwardedFrom && (
              <div className="text-xs text-gray-500">
                From: {visitor.forwardedFrom.fullName} (Unit{" "}
                {visitor.forwardedFrom.unitNumber})
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
