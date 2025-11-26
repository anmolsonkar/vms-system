"use client";

import React, { useEffect } from "react";
import { useNotifications } from "@/app/lib/hooks/useNotifications";
import Card from "../shared/Card";
import Badge from "../shared/Badge";
import LoadingSpinner from "../shared/LoadingSpinner";
import { format } from "date-fns";
import { Bell, CheckCircle } from "lucide-react";
import { clsx } from "clsx";

interface NotificationPanelProps {
  userId: string;
}

export default function NotificationPanel({ userId }: NotificationPanelProps) {
  const {
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications(userId);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getNotificationVariant = (type: string) => {
    switch (type) {
      case "visitor_request":
        return "warning";
      case "visitor_approved":
        return "success";
      case "visitor_rejected":
        return "danger";
      case "visitor_checked_in":
        return "info";
      case "visitor_exit_marked":
        return "default";
      default:
        return "default";
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading notifications..." />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification._id}
              className={clsx(
                "cursor-pointer transition-all",
                !notification.isRead && "bg-blue-50 border-blue-200"
              )}
              padding="md"
              hover
              onClick={() => markAsRead(notification._id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Badge variant={getNotificationVariant(notification.type)}>
                      {notification.type.replace(/_/g, " ").toUpperCase()}
                    </Badge>
                    {!notification.isRead && (
                      <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {notification.title}
                  </h3>

                  <p className="text-gray-600 mb-3">{notification.message}</p>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>
                      {format(new Date(notification.createdAt), "MMM dd, yyyy")}
                    </span>
                    <span>
                      {format(new Date(notification.createdAt), "HH:mm")}
                    </span>
                  </div>
                </div>

                {notification.isRead && (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 ml-4" />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
