"use client";

import { BarChart3, Users, FileText, GraduationCap, Activity, Tags, LayoutDashboard } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { ProgressChartCard } from "@/components/dashboard/progress-chart-card";
import { FilterSelect } from "@/components/dashboard/filter-select";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/session";
import { FORM_MANAGEMENT } from "@/lib/navigation";

const STATS = [
  { icon: BarChart3, label: "KVK", value: 0 },
  { icon: Users, label: "Total OFT", value: 0 },
  { icon: FileText, label: "Total FLD", value: 0 },
  { icon: GraduationCap, label: "Training", value: 0 },
  { icon: Activity, label: "Ext. Activity", value: 0 },
  { icon: Tags, label: "Total Staff", value: 0 },
];

/**
 * A KVK User's whole job is filling in Form Management for their own KVK —
 * unlike Super Admin/KVK Admin, who need cross-KVK oversight stats, a KVK
 * User needs to know one thing: what's still left to fill in. So their
 * Dashboard is the same per-form fill-status list as Form Summary's KVK
 * view, not the stat-card oversight dashboard.
 */
function KvkUserDashboard({ kvkName }: { kvkName?: string }) {
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <LayoutDashboard className="size-5 shrink-0 text-primary" />
          <h1 className="text-3xl font-semibold text-primary">My Pending Forms</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Track what still needs filling in for {kvkName ?? "your KVK"}
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-3">Form</th>
              <th className="px-4 py-3">Filled</th>
              <th className="px-4 py-3">Progress</th>
              <th className="px-4 py-3 text-right">%</th>
            </tr>
          </thead>
          <tbody>
            {FORM_MANAGEMENT.map((form) => (
              <tr key={form.slug} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-foreground">{form.label}</td>
                <td className="px-4 py-3 text-muted-foreground">Not filled</td>
                <td className="px-4 py-3">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-0 rounded-full bg-primary" />
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">0%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** A KVK's own dashboard has no reason to show a KVK count or let them pick a different KVK — both only make sense at the cross-KVK, Super Admin level. */
const KVK_SCOPED_STATS = STATS.filter((stat) => stat.label !== "KVK");

export default function DashboardPage() {
  const session = useSession();

  if (session.role === "kvk-user") {
    return <KvkUserDashboard kvkName={session.kvkName} />;
  }

  const isKvkAdmin = session.role === "kvk-admin";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <LayoutDashboard className="size-5 shrink-0 text-primary" />
            <h1 className="text-3xl font-semibold text-primary">Dashboard</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {isKvkAdmin
              ? `Overview for ${session.kvkName ?? "your KVK"}`
              : "Central overview of system activities and performance metrics"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <FilterSelect label="Year" options={["All"]} />
          {!isKvkAdmin && <FilterSelect label="KVK" options={["All"]} />}
          <Button variant="outline-primary" size="sm">
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {(isKvkAdmin ? KVK_SCOPED_STATS : STATS).map((stat) => (
          <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ProgressChartCard
          title="OFT Progress"
          description="Ongoing, completed; not started = KVK with no entries"
          defaultView="bar"
          totalCount={0}
          summary="0 of 0 KVKs with entries · 0 not started"
          showAllLabel="Show all (0)"
          detailedHref="/dashboard/analytics/oft"
        />
        <ProgressChartCard
          title="FLD Progress"
          description="Ongoing, completed; not started = KVK with no entries"
          defaultView="bar"
          totalCount={0}
          summary="0 of 0 KVKs with entries · 0 not started"
          showAllLabel="Show all (0)"
          detailedHref="/dashboard/analytics/fld"
        />
      </div>
    </div>
  );
}
