"use client";

import React from "react";
import { useAuth } from "@/app/lib/hooks/useAuth";
import { LogOut, Menu } from "lucide-react";
import NotificationBell from "./NotificationBell";

interface NavbarProps {
  onMenuClick?: () => void;
  showMenu?: boolean;
}

export default function Navbar({ onMenuClick, showMenu = true }: NavbarProps) {
  const { user, logout } = useAuth();

  const roleLabels = {
    superadmin: "Super Admin",
    resident: "Resident",
    guard: "Security Guard",
  };

  // Get display name - prioritize fullName, fallback to email
  const getDisplayName = () => {
    if (!user) return "";

    // If fullName exists, use it
    if (user.fullName) {
      return user.fullName;
    }

    // Otherwise, extract name from email
    const emailName = user.email.split("@")[0];
    return emailName.charAt(0).toUpperCase() + emailName.slice(1);
  };

  // Get initials for avatar
  const getInitials = () => {
    if (!user) return "U";

    if (user.fullName) {
      const nameParts = user.fullName.split(" ");
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      }
      return user.fullName.substring(0, 2).toUpperCase();
    }

    return user.email.charAt(0).toUpperCase();
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {showMenu && (
            <button
              onClick={onMenuClick}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}

          <div>
            <h1 className="text-xl font-bold text-purple-600">VMS</h1>
            <p className="text-xs text-gray-500">Visitor Management System</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications - Only show for non-superadmin */}
          {user && user.role !== "superadmin" && (
            <NotificationBell userId={user.id} />
          )}

          {/* User Info */}
          {user && (
            <div className="hidden md:flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {getDisplayName()}
                </p>
                <p className="text-xs text-gray-500">
                  {roleLabels[user.role as keyof typeof roleLabels]}
                </p>
              </div>

              <div className="h-10 w-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {getInitials()}
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={logout}
            className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
