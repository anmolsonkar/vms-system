'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import ApprovalCard from '@/app/components/resident/ApprovalCard';
import Card from '@/app/components/shared/Card';
import LoadingSpinner from '@/app/components/shared/LoadingSpinner';
import { UserCheck } from 'lucide-react';
import axios from 'axios';

export default function ResidentApprovalsPage() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingVisitors();
  }, []);

  const fetchPendingVisitors = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/resident/visitors/pending');
      if (response.data.success) {
        setVisitors(response.data.data.visitors);
      }
    } catch (error) {
      console.error('Fetch pending visitors error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="resident">
        <LoadingSpinner text="Loading approvals..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="resident">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="text-gray-600 mt-1">Review and approve visitor requests</p>
        </div>

        {visitors.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No pending approvals</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {visitors.map((visitor: any) => (
              <ApprovalCard
                key={visitor._id}
                visitor={visitor}
                onApprove={fetchPendingVisitors}
                onReject={fetchPendingVisitors}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}