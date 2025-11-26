'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import UserTable from '@/app/components/superadmin/UserTable';
import CreateUserModal from '@/app/components/superadmin/CreateUserModal';
import Button from '@/app/components/shared/Button';
import { Plus } from 'lucide-react';

export default function SuperAdminUsersPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <DashboardLayout role="superadmin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage all users in the system</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create User
          </Button>
        </div>

        <UserTable onRefresh={refreshKey > 0} />

        <CreateUserModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setRefreshKey((prev) => prev + 1);
          }}
        />
      </div>
    </DashboardLayout>
  );
}