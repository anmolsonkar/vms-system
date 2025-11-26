'use client';

import React, { useState } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import Modal from '../shared/Modal';
import { User, Calendar, Clock, FileText, CheckCircle, XCircle, Car } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';

interface Visitor {
  _id: string;
  name: string;
  phone?: string;
  photoUrl: string;
  purpose: string;
  vehicleNumber?: string;
  numberOfPersons: number;
  createdAt: string;
  idCardType?: string;
}

interface ApprovalCardProps {
  visitor: Visitor;
  onApprove: () => void;
  onReject: () => void;
}

export default function ApprovalCard({ visitor, onApprove, onReject }: ApprovalCardProps) {
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await axios.post('/api/resident/visitors/approve', {
        visitorId: visitor._id,
      });
      onApprove();
    } catch (error) {
      console.error('Approve error:', error);
      alert('Failed to approve visitor');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/resident/visitors/reject', {
        visitorId: visitor._id,
        reason: rejectReason,
      });
      setShowRejectModal(false);
      onReject();
    } catch (error) {
      console.error('Reject error:', error);
      alert('Failed to reject visitor');
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
            className="flex-shrink-0 cursor-pointer"
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
                <Badge variant="warning" size="sm" className="mt-1">
                  Pending Approval
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

              {visitor.idCardType && (
                <div className="flex items-center text-gray-600">
                  <FileText className="h-4 w-4 mr-2" />
                  {visitor.idCardType.toUpperCase()}
                </div>
              )}

              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {format(new Date(visitor.createdAt), 'MMM dd, yyyy')}
              </div>

              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                {format(new Date(visitor.createdAt), 'HH:mm')}
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
            Please provide a reason for rejecting <strong>{visitor.name}</strong>
          </p>
          
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter reason for rejection..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    </>
  );
}