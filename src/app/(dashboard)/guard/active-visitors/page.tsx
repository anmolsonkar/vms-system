'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import ApprovedVisitorCard from '@/app/components/guard/ApprovedVisitorCard';
import ActiveVisitorCard from '@/app/components/guard/ActiveVisitorCard';
import Card from '@/app/components/shared/Card';
import LoadingSpinner from '@/app/components/shared/LoadingSpinner';
import { UserCheck } from 'lucide-react';
import axios from 'axios';

export default function GuardActiveVisitorsPage() {
  const [approvedVisitors, setApprovedVisitors] = useState([]);
  const [activeVisitors, setActiveVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const [approvedRes, activeRes] = await Promise.all([
        axios.get('/api/guard/visitors/approved'),
        axios.get('/api/guard/visitors/active'),
      ]);

      if (approvedRes.data.success) {
        setApprovedVisitors(approvedRes.data.data.visitors);
      }

      if (activeRes.data.success) {
        setActiveVisitors(activeRes.data.data.visitors);
      }
    } catch (error) {
      console.error('Fetch visitors error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="guard">
        <LoadingSpinner text="Loading visitors..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="guard">
      <div className="space-y-8">
        {/* Approved - Ready for Entry */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Ready for Entry ({approvedVisitors.length})
          </h2>

          {approvedVisitors.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <p className="text-gray-500">No approved visitors waiting</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {approvedVisitors.map((visitor: any) => (
                <ApprovedVisitorCard
                  key={visitor._id}
                  visitor={visitor}
                  onCheckIn={fetchVisitors}
                />
              ))}
            </div>
          )}
        </div>

        {/* Currently Inside */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Currently Inside ({activeVisitors.length})
          </h2>

          {activeVisitors.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No visitors currently inside</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeVisitors.map((visitor: any) => (
                <ActiveVisitorCard key={visitor._id} visitor={visitor} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}