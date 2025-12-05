'use client';

import React from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import ManualEntryForm from '@/app/components/guard/ManualEntryForm';

export default function GuardManualEntryPage() {
  return (
    <DashboardLayout role="guard">
      <ManualEntryForm isOpen={true} onClose={() => {}} onSuccess={() => {}} />
    </DashboardLayout>
  );
}