"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Users,
  Building,
  BarChart3,
  FileText,
  CheckCircle,
  Clock,
  History,
  UserPlus,
  Shield,
  Bell,
  X,
} from "lucide-react";

interface SidebarProps {
  role: "superadmin" | "resident" | "guard";
  isOpen?: boolean;
  onClose?: () => void;
}

const menuItems = {
  superadmin: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/superadmin" },
    { icon: Users, label: "Users", href: "/superadmin/users" },
    { icon: Building, label: "Properties", href: "/superadmin/properties" },
  ],
  resident: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/resident" },
    { icon: CheckCircle, label: "Approvals", href: "/resident/approvals" },
    { icon: History, label: "History", href: "/resident/history" },
    { icon: Bell, label: "Notifications", href: "/resident/notifications" },
  ],
  guard: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/guard" },
    { icon: Clock, label: "Pending", href: "/guard/pending" },
    { icon: Shield, label: "Active Visitors", href: "/guard/active-visitors" },
    { icon: UserPlus, label: "Manual Entry", href: "/guard/manual-entry" },
    { icon: History, label: "History", href: "/guard/history" },
  ],
};

export default function Sidebar({
  role,
  isOpen = true,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const items = menuItems[role];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed top-0 left-0 h-full bg-white border-r border-gray-200 transition-transform duration-300 z-50",
          "w-64 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose?.()}
                className={clsx(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-purple-50 text-purple-600 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
