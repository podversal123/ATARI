import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AnalyticsFilterBar } from "@/components/dashboard/analytics-filter-bar";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ProgressChartCard } from "@/components/dashboard/progress-chart-card";

const METRICS = [
  { label: "Trials", value: 0 },
  { label: "Farmers Covered", value: 0 },
  { label: "Locations", value: 0 },
  { label: "Replications", value: 0 },
  { label: "Cost of OFT", value: 0 },
  { label: "Quantity", value: 0 },
];

export default function OftDetailedAnalyticsPage() {
  return (
    <div>
      <Link
        href="/dashboard"
        className="mb-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to dashboard
      </Link>

      <h1 className="text-2xl font-semibold text-primary">OFT — detailed analytics</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Filter by year, zone, state, district, institute and KVK
      </p>

      <div className="mt-6">
        <AnalyticsFilterBar />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {METRICS.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>

      <div className="mt-4">
        <ProgressChartCard
          title="OFT by Zone"
          description="Status"
          totalCount={0}
        />
      </div>
    </div>
  );
}
