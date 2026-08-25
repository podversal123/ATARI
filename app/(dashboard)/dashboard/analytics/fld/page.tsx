"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AnalyticsFilterBar } from "@/components/dashboard/analytics-filter-bar";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ProgressChartCard, type ProgressChartRow } from "@/components/dashboard/progress-chart-card";

type FldStats = { total: number; demonstrations: number; farmersCovered: number };

const EMPTY: FldStats = { total: 0, demonstrations: 0, farmersCovered: 0 };

/**
 * Real data (was a static `value: 0` placeholder for every metric and an
 * empty chart). "Quantity" has no matching field anywhere in Fld or
 * FldDemonstrationDetail's schema - shown as "-" rather than a guessed
 * number, same rule as OFT's Farmers Covered/Locations.
 */
export default function FldDetailedAnalyticsPage() {
  const [stats, setStats] = useState<FldStats>(EMPTY);
  const [rows, setRows] = useState<ProgressChartRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/dashboard-stats?scope=fld")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setStats({ total: data.fld.total, demonstrations: data.fld.demonstrations, farmersCovered: data.fld.farmersCovered });
        setRows(data.charts.fld);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

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
        <AnalyticsFilterBar />
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
        />
      </div>
    </div>
  );
}
