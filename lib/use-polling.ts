"use client";

import { useEffect, useRef } from "react";

/**
 * Re-runs `callback` on an interval so client-fetched views (Dashboard,
 * User/Role Management, Form Summary) show another KVK's real changes
 * without a manual refresh - same real-time goal as AutoRefresh, for pages
 * that fetch their own data client-side instead of via a Server Component.
 * Pauses while the tab is hidden so a background tab doesn't keep polling.
 * `callback` is read from a ref so callers don't need to memoize it.
 */
export function usePolling(callback: () => void, intervalMs = 20000) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") callbackRef.current();
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}
