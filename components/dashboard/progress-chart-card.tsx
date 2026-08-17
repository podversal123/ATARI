"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { BarChart3, List, AreaChart, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type ChartView = "bar" | "list" | "area";

const VIEW_OPTIONS: { value: ChartView; label: string; icon: typeof BarChart3 }[] = [
  { value: "bar", label: "Bar", icon: BarChart3 },
  { value: "list", label: "List", icon: List },
  { value: "area", label: "Area", icon: AreaChart },
];

type ProgressChartCardProps = {
  title: string;
  description: string;
  defaultView?: ChartView;
  totalCount: number;
  /** "64 of 65 KVKs with entries · 1 not started" — omitted when there's nothing to summarize yet. */
  summary?: ReactNode;
  /** "Show all (65)" — rendered next to the summary line. */
  showAllLabel?: string;
  /** When set, "Detailed" navigates to the full analytics page instead of toggling a view. */
  detailedHref?: string;
  footer?: ReactNode;
  pageIndicator?: string;
};

/**
 * Shell for a KVK-level progress chart: title, view-toggle (Bar/List/Area,
 * plus an optional "Detailed" link out to the full analytics page), the
 * ongoing/completed/not-started legend, and a pagination footer. No backend
 * yet, so the plot area renders the real empty state instead of a
 * fabricated curve — the chart itself gets wired up once real submissions
 * exist (Step 3 of the build).
 */
export function ProgressChartCard({
  title,
  description,
  defaultView = "bar",
  totalCount,
  summary,
  showAllLabel,
  detailedHref,
  footer,
  pageIndicator,
}: ProgressChartCardProps) {
  const [view, setView] = useState<ChartView>(defaultView);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">{title}</p>
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
          {detailedHref && (
            <Link
              href={detailedHref}
              className="flex items-center gap-1 rounded-[calc(var(--radius-md)-2px)] px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowUpRight className="size-3.5" />
              Detailed
            </Link>
          )}
        </div>
      </div>

      {(summary || showAllLabel) && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          {summary && <span>{summary}</span>}
          {showAllLabel && (
            <button
              type="button"
              disabled
              className="text-primary underline-offset-2 hover:underline disabled:cursor-default disabled:text-muted-foreground disabled:no-underline"
            >
              {showAllLabel}
            </button>
          )}
        </div>
      )}

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

      <div className="relative mt-4 h-56 pl-6">
        <div className="absolute inset-y-0 right-0 left-6 flex flex-col justify-between">
          {[0, 1, 2, 3].map((line) => (
            <div key={line} className="w-full border-t border-dashed border-border" />
          ))}
        </div>
        <span className="absolute bottom-0 left-0 text-[10px] text-muted-foreground/70">0</span>
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
          {pageIndicator && <span className="text-xs">{pageIndicator}</span>}
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
