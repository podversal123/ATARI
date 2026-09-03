"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AnalyticsFilterBar } from "@/components/dashboard/analytics-filter-bar";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ProgressChartCard, type ProgressChartRow } from "@/components/dashboard/progress-chart-card";
import { useAnalyticsFilters, type AnalyticsData } from "@/lib/use-analytics-filters";

type FldData = AnalyticsData & {
  fld: { total: number; demonstrations: number; farmersCovered: number };
  charts: { fld: ProgressChartRow[] };
};

/**
 * Real data (was a static `value: 0` placeholder for every metric and an
 * empty chart). "Quantity" has no matching field anywhere in Fld or
 * FldDemonstrationDetail's schema - shown as "-" rather than a guessed
 * number, same rule as OFT's Locations. Year/State/District/KVK/Group By
 * filters are real now too (2026-08-27) - see lib/use-analytics-filters.ts.
 */
export default function FldDetailedAnalyticsPage() {
  const { filters, setFilters, data: raw } = useAnalyticsFilters("fld");
  const data = raw as unknown as FldData | null;
  const stats = data?.fld ?? { total: 0, demonstrations: 0, farmersCovered: 0 };
  const rows = data?.charts.fld ?? [];

  const metrics = [
    { label: "FLDs", value: stats.total },
    { label: "Demonstrations", value: stats.demonstrations },
    { label: "Farmers Covered", value: stats.farmersCovered },
    { label: "Quantity", value: "-" },
  ];

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
        FLD - detailed analytics
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Filter by year, zone, state, district, institute and KVK
      </p>

      <div className="mt-6">
        <AnalyticsFilterBar
          filters={filters}
          onChange={setFilters}
          years={data?.years ?? []}
          zoneName={data?.zoneName ?? null}
          states={data?.stateOptions ?? []}
          districts={data?.districtOptions ?? []}
          kvks={(data?.kvkOptions ?? []).map((k) => k.name)}
          institutes={data?.instituteOptions ?? []}
          hasStatus
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
          />
        ))}
      </div>

      <div className="mt-4">
        <ProgressChartCard
          title="FLD by Zone"
          description="Status"
          totalCount={stats.total}
          rows={rows}
          resetKey={JSON.stringify(filters)}
        />
      </div>
    </div>
  );
}
