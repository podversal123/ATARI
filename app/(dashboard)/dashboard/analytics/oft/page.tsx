"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AnalyticsFilterBar } from "@/components/dashboard/analytics-filter-bar";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ProgressChartCard, type ProgressChartRow } from "@/components/dashboard/progress-chart-card";
import { useAnalyticsFilters, type AnalyticsData } from "@/lib/use-analytics-filters";

type OftData = AnalyticsData & {
  oft: { total: number; quantity: number; cost: number; replications: number; farmersCovered: number };
  charts: { oft: ProgressChartRow[] };
};

/**
 * Real data (was a static `value: 0` placeholder for every metric and an
 * empty chart - never wired to /api/dashboard-stats, unlike the main
 * Dashboard). Farmers Covered is the real "Farmers Details" demographic sum
 * (General/OBC/SC/ST x M/F, added to Oft this session) - "Locations" still
 * has no confidently-matching field anywhere in the Oft schema, shown as
 * "-" rather than a guessed number. Year/State/District/KVK/Group By filters
 * are real now too (2026-08-27) - see lib/use-analytics-filters.ts.
 */
export default function OftDetailedAnalyticsPage() {
  const { filters, setFilters, data: raw } = useAnalyticsFilters("oft");
  const data = raw as unknown as OftData | null;
  const stats = data?.oft ?? { total: 0, quantity: 0, cost: 0, replications: 0, farmersCovered: 0 };
  const rows = data?.charts.oft ?? [];

  const metrics = [
    { label: "Trials", value: stats.total },
    { label: "Farmers Covered", value: stats.farmersCovered },
    { label: "Locations", value: "-" },
    { label: "Replications", value: stats.replications },
    { label: "Cost of OFT", value: stats.cost.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    { label: "Quantity", value: stats.quantity.toLocaleString("en-IN", { maximumFractionDigits: 2 }) },
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
        OFT - detailed analytics
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

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
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
          title="OFT by Zone"
          description="Status"
          totalCount={stats.total}
          rows={rows}
          resetKey={JSON.stringify(filters)}
        />
      </div>
    </div>
  );
}
