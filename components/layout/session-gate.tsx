"use client";

import { useSessionReady } from "@/lib/session";

/**
 * Holds back the whole role-dependent dashboard shell until the real session
 * has been read on the client.
 *
 * The session lives in sessionStorage (see lib/session.tsx), so a server
 * render can only ever assume the default Super Admin role. Rendering that
 * assumption and correcting it a frame later is what made a KVK Admin briefly
 * see Super Admin's sidebar and stats on every refresh. Gating here rather
 * than inside each page keeps the fix in one place - sidebar, topbar and page
 * body all appear together, already correct for the signed-in role.
 *
 * The placeholder deliberately mirrors the real layout's geometry (green
 * sidebar rail, header strip) so nothing shifts when the real chrome swaps in.
 */
export function SessionGate({ children }: { children: React.ReactNode }) {
  const ready = useSessionReady();

  if (!ready) {
    return (
      <div className="flex h-screen overflow-hidden bg-background" aria-hidden>
        <div className="w-64 shrink-0 bg-sidebar" />
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="h-16 shrink-0 border-b border-border bg-card" />
          <div className="flex-1" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
