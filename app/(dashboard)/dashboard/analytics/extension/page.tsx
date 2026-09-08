"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AnalyticsFilterBar, chartGroupingLabel } from "@/components/dashboard/analytics-filter-bar";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ProgressChartCard, type ProgressChartRow } from "@/components/dashboard/progress-chart-card";
import { useAnalyticsFilters, type AnalyticsData } from "@/lib/use-analytics-filters";
import { useSession } from "@/lib/session";

type TotalRow = { id: string; label: string; total: number };
type ExtensionData = AnalyticsData & {
  extension: { total: number };
  charts: { extension: TotalRow[] };
};

/** Extension Activity has no ongoing/completed status column - same total-only mode as Training. */
function toTotalChartRows(rows: TotalRow[]): ProgressChartRow[] {
  return rows.map((r) => ({ id: r.id, label: r.label, ongoing: 0, completed: r.total }));
}

/**
 * Real data - was a static `value: 0` placeholder and an empty chart.
 * Year/State/District/KVK/Group By filters are real now too (2026-08-27) -
 * see lib/use-analytics-filters.ts.
 */
export default function ExtensionDetailedAnalyticsPage() {
  const { filters, setFilters, data: raw } = useAnalyticsFilters("extension");
  const isKvkAdmin = useSession().role === "kvk-admin";
  const data = raw as unknown as ExtensionData | null;
  const total = data?.extension.total ?? 0;
  const rows = toTotalChartRows(data?.charts.extension ?? []);

  return (
    <div>
      <Link
        href="/dashboard"
        className="mb-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to dashboard
      </Link>

      <h1 className="text-3xl font-semibold text-primary">
        Extension Activities - detailed analytics
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isKvkAdmin ? "Filter by year" : "Filter by year, zone, state, district, institute and KVK"}
      </p>

      <div className="mt-6">
        <AnalyticsFilterBar
          filters={filters}
          onChange={setFilters}
          years={data?.years ?? []}
          zoneName={data?.zoneName ?? null}
          states={data?.stateOptions ?? []}
          districts={data?.districtOptions ?? []}
          kvkOptions={data?.kvkOptions ?? []}
          institutes={data?.instituteOptions ?? []}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard label="Extension Activities" value={total} />
      </div>

      <div className="mt-4">
        <ProgressChartCard title={isKvkAdmin ? "Extension Activities" : `Extension Activities by ${chartGroupingLabel(filters.groupBy)}`} description={isKvkAdmin ? "Total extension activities conducted" : "Total extension activities per KVK"} totalCount={total} rows={rows} mode="total" resetKey={JSON.stringify(filters)} />
      </div>
    </div>
  );
}
