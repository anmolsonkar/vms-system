'use client';

import React from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import AuditLogTable from '@/app/components/superadmin/AuditLogTable';

export default function SuperAdminAuditLogsPage() {
  return (
    <DashboardLayout role="superadmin">
      <AuditLogTable />
    </DashboardLayout>
  );
}