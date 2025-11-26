'use client';

import React from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import NotificationPanel from '@/app/components/resident/NotificationPanel';
import { useAuth } from '@/app/lib/hooks/useAuth';

export default function ResidentNotificationsPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout role="resident">
      {user && <NotificationPanel userId={user.id} />}
    </DashboardLayout>
  );
}