"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Polls `router.refresh()` on an interval so a Super Admin viewing a list
 * (Masters, Form Management) sees a KVK's real changes show up without a
 * manual page reload - re-runs this page's own server-side data fetch in
 * place, keeping any client-side UI state (open dropdowns, scroll position,
 * in-progress form input) intact, unlike a full navigation/reload would.
 * Pauses while the tab isn't visible so it doesn't burn requests in a
 * background tab nobody's looking at.
 */
export function AutoRefresh({ intervalMs = 20000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
