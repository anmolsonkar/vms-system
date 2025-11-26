'use client';

import React from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import PropertyManager from '@/app/components/superadmin/PropertyManager';

export default function SuperAdminPropertiesPage() {
  return (
    <DashboardLayout role="superadmin">
      <PropertyManager />
    </DashboardLayout>
  );
}