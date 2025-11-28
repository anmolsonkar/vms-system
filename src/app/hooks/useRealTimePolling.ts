// =============================================================================
// REAL-TIME POLLING HOOK
// File: src/app/hooks/useRealTimePolling.ts
// =============================================================================

import { useEffect, useRef, useCallback } from "react";

interface PollingOptions {
  interval?: number; // Milliseconds (default: 5000 = 5 seconds)
  enabled?: boolean; // Can pause polling
  onError?: (error: Error) => void;
}

export function useRealTimePolling(
  fetchFunction: () => Promise<void>,
  options: PollingOptions = {}
) {
  const {
    interval = 5000, // Default 5 seconds
    enabled = true,
    onError,
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const poll = useCallback(async () => {
    if (!isMountedRef.current || !enabled) return;

    try {
      await fetchFunction();
    } catch (error) {
      console.error("Polling error:", error);
      if (onError) {
        onError(error as Error);
      }
    }
  }, [fetchFunction, enabled, onError]);

  useEffect(() => {
    isMountedRef.current = true;

    if (!enabled) {
      // Clear interval if disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Fetch immediately
    poll();

    // Then poll at interval
    intervalRef.current = setInterval(poll, interval);

    // Cleanup
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [poll, interval, enabled]);
}

// =============================================================================
// SPECIALIZED HOOKS FOR EACH DASHBOARD
// =============================================================================

// For notification count (all roles)
export function useNotificationPolling(
  role: "admin" | "resident" | "guard",
  onUpdate?: (count: number) => void
) {
  const fetchNotifications = useCallback(async () => {
    const response = await fetch(`/api/${role}/notifications/unread-count`);
    if (response.ok) {
      const data = await response.json();
      if (onUpdate) onUpdate(data.count || 0);
    }
  }, [role, onUpdate]);

  useRealTimePolling(fetchNotifications, { interval: 3000 }); // 3 seconds for notifications
}

// For visitor lists
export function useVisitorPolling(
  endpoint: string,
  onUpdate?: (data: any) => void,
  interval: number = 5000
) {
  const fetchVisitors = useCallback(async () => {
    const response = await fetch(endpoint);
    if (response.ok) {
      const data = await response.json();
      if (onUpdate) onUpdate(data);
    }
  }, [endpoint, onUpdate]);

  useRealTimePolling(fetchVisitors, { interval });
}
