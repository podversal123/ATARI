"use client";

import { useEffect, useState } from "react";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "04 Sep 2026 1:08 AM" - built by hand so it never shifts with the host's locale. */
function formatNow(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = d.getHours() >= 12 ? "PM" : "AM";
  const hour12 = d.getHours() % 12 || 12;
  return `${day} ${month} ${year}  ${hour12}:${minutes} ${ampm}`;
}

/**
 * Live wall-clock shown in the topbar (so it's on every dashboard page, both
 * roles). Renders a non-breaking space on the server / first client paint and
 * fills in the real time on mount, so the server and client markup match and
 * there's no hydration warning. Ticks every 15s - enough to keep the minute
 * accurate without a per-second re-render.
 */
export function LiveClock({ className }: { className?: string }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    // The current time is client-only - deriving it during render would
    // mismatch the server-rendered markup, so it's filled in here on mount.
    const tick = () => setLabel(formatNow(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={className} suppressHydrationWarning>
      {label || " "}
    </span>
  );
}
