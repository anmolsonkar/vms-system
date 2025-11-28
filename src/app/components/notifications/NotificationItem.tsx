// =============================================================================
// NOTIFICATION ITEM WITH SMART NAVIGATION
// File: src/app/components/notifications/NotificationItem.tsx
// =============================================================================

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  AlertCircle,
  Bell,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NotificationItemProps {
  notification: {
    _id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    relatedId?: string;
  };
  role: "resident" | "guard" | "admin";
  onMarkAsRead: (id: string) => void;
}

export default function NotificationItem({
  notification,
  role,
  onMarkAsRead,
}: NotificationItemProps) {
  const router = useRouter();

  // Get icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case "visitor_request":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "visitor_approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "visitor_rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "visitor_checked_in":
        return <UserCheck className="h-5 w-5 text-purple-500" />;
      case "visitor_exit_marked":
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case "visitor_checked_out":
        return <UserCheck className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // Smart navigation based on notification type and role
  const handleClick = () => {
    // Mark as read
    onMarkAsRead(notification._id);

    // Navigate based on type and role
    if (role === "resident") {
      switch (notification.type) {
        case "visitor_request":
          router.push("/resident/approvals"); // Pending approvals page
          break;
        case "visitor_checked_in":
        case "visitor_checked_out":
          router.push("/resident/history"); // Visitor history
          break;
        default:
          router.push("/resident/dashboard");
      }
    } else if (role === "guard") {
      switch (notification.type) {
        case "visitor_approved":
          router.push("/guard/approved"); // Ready for check-in
          break;
        case "visitor_exit_marked":
          router.push("/guard/active-visitors"); // Active visitors to verify exit
          break;
        case "visitor_request":
          router.push("/guard/pending"); // Pending approvals
          break;
        default:
          router.push("/guard/dashboard");
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        notification.isRead
          ? "bg-white border-gray-200 hover:bg-gray-50"
          : "bg-purple-50 border-purple-200 hover:bg-purple-100"
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">{getIcon()}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  notification.isRead ? "text-gray-900" : "text-purple-900"
                }`}
              >
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>

            {!notification.isRead && (
              <span className="ml-2 h-2 w-2 bg-purple-500 rounded-full flex-shrink-0"></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
