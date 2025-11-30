"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/app/lib/hooks/useNotifications";
import { usePolling } from "@/app/lib/hooks/usePolling";
import { clsx } from "clsx";
import { format } from "date-fns";

interface NotificationBellProps {
  userId: string;
}

export default function NotificationBell({ userId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
  } = useNotifications(userId);

  // Poll for new notifications every 5 seconds
  usePolling(
    () => {
      fetchUnreadCount();
    },
    { interval: 5000, enabled: true }
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            fetchNotifications();
          }
        }}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="h-5 w-5 sm:h-6 sm:w-6" />

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center h-4 w-4 sm:h-5 sm:w-5 text-[10px] sm:text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-16 sm:top-auto mt-0 sm:mt-2 w-auto sm:w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[calc(100vh-5rem)] sm:max-h-96 flex flex-col">
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-gray-200 shrink-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Notifications
            </h3>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification._id)}
                    className={clsx(
                      "p-3 sm:p-4 hover:bg-gray-50 cursor-pointer transition-colors",
                      !notification.isRead && "bg-purple-50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 wrap-break-word">
                          {notification.title}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 wrap-break-word">
                          {notification.message}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-400 mt-1.5 sm:mt-2">
                          {format(
                            new Date(notification.createdAt),
                            "MMM dd, yyyy HH:mm"
                          )}
                        </p>
                      </div>

                      {!notification.isRead && (
                        <span className="ml-2 h-2 w-2 bg-purple-600 rounded-full shrink-0 mt-1"></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 sm:p-3 border-t border-gray-200 text-center shrink-0">
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
