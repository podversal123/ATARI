import { BarChart3, Users, FileText, GraduationCap, Activity, Tags } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { ProgressChartCard } from "@/components/dashboard/progress-chart-card";
import { FilterSelect } from "@/components/dashboard/filter-select";
import { Button } from "@/components/ui/button";

const STATS = [
  { icon: BarChart3, label: "KVK", value: 0 },
  { icon: Users, label: "Total OFT", value: 0 },
  { icon: FileText, label: "Total FLD", value: 0 },
  { icon: GraduationCap, label: "Training", value: 0 },
  { icon: Activity, label: "Ext. Activity", value: 0 },
  { icon: Tags, label: "Total Staff", value: 0 },
];

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Central overview of system activities and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <FilterSelect label="Year" options={["All"]} />
          <FilterSelect label="KVK" options={["All"]} />
          <Button variant="secondary" size="sm">
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {STATS.map((stat) => (
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
