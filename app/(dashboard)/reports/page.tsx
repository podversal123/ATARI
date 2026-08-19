"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";
import { KvkReportView } from "@/components/reports/kvk-report-view";
import { SuperAdminReportView } from "@/components/reports/super-admin-report-view";

type ViewAs = "super-admin" | "kvk";

/**
 * Real login/RBAC doesn't exist yet (Phase 2/3), so which report screen a
 * user sees is normally decided by their session role. Until that lands,
 * this "Viewing as" toggle is the only way to reach both screens for review
 * — it's a Phase 1 preview aid, not a permission switch, and gets replaced
 * by the real session role once auth is wired up.
 */
export default function ReportsPage() {
  const [viewAs, setViewAs] = useState<ViewAs>("super-admin");

  return (
    <div>
      <PageHeader trail={[{ label: "Reports" }]} />

      <div className="mb-4 inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 p-1 text-xs">
        <span className="px-2 text-muted-foreground">Viewing as:</span>
        <button
          type="button"
          onClick={() => setViewAs("super-admin")}
          className={cn(
            "rounded px-2.5 py-1 font-medium transition-colors",
            viewAs === "super-admin" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          )}
        >
          Super Admin
        </button>
        <button
          type="button"
          onClick={() => setViewAs("kvk")}
          className={cn(
            "rounded px-2.5 py-1 font-medium transition-colors",
            viewAs === "kvk" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          )}
        >
          KVK Admin
        </button>
      </div>

      {viewAs === "super-admin" ? <SuperAdminReportView /> : <KvkReportView />}
    </div>
  );
}
