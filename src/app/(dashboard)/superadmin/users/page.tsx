"use client";

import React, { useState } from "react";
import DashboardLayout from "@/app/components/layout/DashboardLayout";
import UserTable from "@/app/components/superadmin/UserTable";
import CreateUserModal from "@/app/components/superadmin/CreateUserModal";
import Button from "@/app/components/shared/Button";
import { Plus } from "lucide-react";

export default function SuperAdminUsersPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <DashboardLayout role="superadmin">
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-0.5 sm:mt-1">
              Manage all users in the system
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="text-sm sm:text-base">Create User</span>
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
