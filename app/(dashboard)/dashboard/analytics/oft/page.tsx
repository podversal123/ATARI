"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AnalyticsFilterBar } from "@/components/dashboard/analytics-filter-bar";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ProgressChartCard, type ProgressChartRow } from "@/components/dashboard/progress-chart-card";

type OftStats = {
  total: number;
  quantity: number;
  cost: number;
  replications: number;
};

const EMPTY: OftStats = { total: 0, quantity: 0, cost: 0, replications: 0 };

/**
 * Real data (was a static `value: 0` placeholder for every metric and an
 * empty chart - never wired to /api/dashboard-stats, unlike the main
 * Dashboard). "Farmers Covered" and "Locations" have no confidently-matching
 * field anywhere in the Oft schema (only `noOfTrialReplicationFarmer`, which
 * maps to Replications) - shown as "-" rather than a guessed number.
 */
export default function OftDetailedAnalyticsPage() {
  const [stats, setStats] = useState<OftStats>(EMPTY);
  const [rows, setRows] = useState<ProgressChartRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/dashboard-stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setStats({ total: data.oft.total, quantity: data.oft.quantity, cost: data.oft.cost, replications: data.oft.replications });
        setRows(data.charts.oft);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = [
    { label: "Trials", value: stats.total },
    { label: "Farmers Covered", value: "-" },
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
        <AnalyticsFilterBar />
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
        />
      </div>
    </div>
  );
}
