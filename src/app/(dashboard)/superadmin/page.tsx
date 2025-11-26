'use client';

import React from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import AnalyticsDashboard from '@/app/components/superadmin/AnalyticsDashboard';

export default function SuperAdminDashboardPage() {
  return (
    <DashboardLayout role="superadmin">
      <AnalyticsDashboard />
    </DashboardLayout>
  );
}