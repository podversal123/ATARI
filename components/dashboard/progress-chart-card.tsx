"use client";

import { useState, type ReactNode } from "react";
import { BarChart3, List, AreaChart, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type ChartView = "bar" | "list" | "area" | "detailed";

const VIEW_OPTIONS: { value: ChartView; label: string; icon: typeof BarChart3 }[] = [
  { value: "bar", label: "Bar", icon: BarChart3 },
  { value: "list", label: "List", icon: List },
  { value: "area", label: "Area", icon: AreaChart },
  { value: "detailed", label: "Detailed", icon: Maximize2 },
];

type ProgressChartCardProps = {
  title: string;
  description: string;
  defaultView?: ChartView;
  totalCount: number;
  footer?: ReactNode;
};

/**
 * Shell for the Dashboard's OFT/FLD progress charts: title, view-toggle
 * (Bar/List/Area/Detailed), the ongoing/completed/not-started legend, and a
 * pagination footer. No backend yet, so the plot area renders the real
 * empty state instead of a fabricated curve — the chart itself gets wired
 * up once real submissions exist (Step 3 of the build).
 */
export function ProgressChartCard({
  title,
  description,
  defaultView = "bar",
  totalCount,
  footer,
}: ProgressChartCardProps) {
  const [view, setView] = useState<ChartView>(defaultView);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-foreground uppercase">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border bg-muted/50 p-0.5">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setView(option.value)}
              className={cn(
                "flex items-center gap-1 rounded-[calc(var(--radius-md)-2px)] px-2 py-1 text-xs font-medium transition-colors",
                view === option.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <option.icon className="size-3.5" />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#eaa624]" /> Ongoing
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-primary" /> Completed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-muted-foreground/40" /> Not started
        </span>
      </div>

      <div className="mt-4 flex h-56 items-end border-b border-dashed border-border">
        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
          No data yet
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
        <span>{footer ?? `Showing 0 of ${totalCount}`}</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Prev
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
