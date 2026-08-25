"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AnalyticsFilterBar } from "@/components/dashboard/analytics-filter-bar";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ProgressChartCard, type ProgressChartRow } from "@/components/dashboard/progress-chart-card";

type TotalRow = { id: string; label: string; total: number };

/** Extension Activity has no ongoing/completed status column - same total-only mode as Training. */
function toTotalChartRows(rows: TotalRow[]): ProgressChartRow[] {
  return rows.map((r) => ({ id: r.id, label: r.label, ongoing: 0, completed: r.total }));
}

/** Real data - was a static `value: 0` placeholder and an empty chart. */
export default function ExtensionDetailedAnalyticsPage() {
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<ProgressChartRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/dashboard-stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setTotal(data.extension.total);
        setRows(toTotalChartRows(data.charts.extension));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

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
        Filter by year, zone, state, district, institute and KVK
      </p>

      <div className="mt-6">
        <AnalyticsFilterBar />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard label="Extension Activities" value={total} />
      </div>

      <div className="mt-4">
        <ProgressChartCard title="Extension Activities by Zone" description="Status" totalCount={total} rows={rows} mode="total" />
      </div>
    </div>
  );
}
