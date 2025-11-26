'use client';

import React, { useState } from 'react';
import Navbar from '../shared/Navbar';
import Sidebar from '../shared/Sidebar';
import ProtectedRoute from '../auth/ProtectedRoute';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'superadmin' | 'resident' | 'guard';
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute allowedRoles={[role]}>
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          showMenu={true}
        />

        <div className="flex">
          {/* Sidebar */}
          <Sidebar
            role={role}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Main Content */}
          <main className="flex-1 lg:ml-64 p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}