"use client";

import { useState } from "react";
import { LayoutGrid, Table2, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { FilterSelect } from "@/components/dashboard/filter-select";

const SUMMARY_STATS = [
  { label: "KVKs", value: "0" },
  { label: "Forms Tracked", value: "0" },
  { label: "Entries Filled", value: "0 / 0" },
  { label: "Overall Progress", value: "0%" },
];

type ViewMode = "kvk" | "matrix";

export default function FormSummaryPage() {
  const [view, setView] = useState<ViewMode>("kvk");

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Form Summary — All KVKs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track which KVKs have submitted each form
          </p>
        </div>
        <FilterSelect label="Reporting year" options={[String(new Date().getFullYear())]} />
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {SUMMARY_STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {stat.label}
              </p>
              <p
                className={cn(
                  "mt-1 text-2xl font-semibold tabular-nums",
                  stat.label === "Overall Progress" ? "text-primary" : "text-foreground"
                )}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-0 rounded-full bg-primary" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-md border border-border bg-muted/50 p-0.5">
          <button
            type="button"
            onClick={() => setView("kvk")}
            className={cn(
              "flex items-center gap-1.5 rounded-[calc(var(--radius-md)-2px)] px-3 py-1.5 text-sm font-medium transition-colors",
              view === "kvk"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="size-3.5" />
            By KVK
          </button>
          <button
            type="button"
            onClick={() => setView("matrix")}
            className={cn(
              "flex items-center gap-1.5 rounded-[calc(var(--radius-md)-2px)] px-3 py-1.5 text-sm font-medium transition-colors",
              view === "matrix"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Table2 className="size-3.5" />
            Matrix
          </button>
        </div>
        <Input placeholder="Filter KVKs..." className="w-64" />
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-3">
                <span className="flex items-center gap-1.5">
                  KVK <Filter className="size-3" />
                </span>
              </th>
              <th className="px-4 py-3">Filled</th>
              <th className="px-4 py-3">Progress</th>
              <th className="px-4 py-3 text-right">%</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="px-4 py-16 text-center text-muted-foreground">
                No KVKs yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
