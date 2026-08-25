"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AnalyticsFilterBar } from "@/components/dashboard/analytics-filter-bar";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ProgressChartCard, type ProgressChartRow } from "@/components/dashboard/progress-chart-card";

type TotalRow = { id: string; label: string; total: number };

/** Training has no ongoing/completed status column - fold the single total into `completed` so the chart component's mode="total" can reuse it, same as the main Dashboard's own Training Progress card. */
function toTotalChartRows(rows: TotalRow[]): ProgressChartRow[] {
  return rows.map((r) => ({ id: r.id, label: r.label, ongoing: 0, completed: r.total }));
}

/** Real data - was a static `value: 0` placeholder and an empty chart. */
export default function TrainingDetailedAnalyticsPage() {
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<ProgressChartRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/dashboard-stats?scope=training")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setTotal(data.training.total);
        setRows(toTotalChartRows(data.charts.training));
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
        Training - detailed analytics
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Filter by year, zone, state, district, institute and KVK
      </p>

      <div className="mt-6">
        <AnalyticsFilterBar />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard label="Trainings" value={total} />
      </div>

      <div className="mt-4">
        <ProgressChartCard title="Training by Zone" description="Status" totalCount={total} rows={rows} mode="total" />
      </div>
    </div>
  );
}
