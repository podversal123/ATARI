"use client";

import { useState } from "react";
import { LayoutGrid, Table2, Filter, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { FilterSelect } from "@/components/dashboard/filter-select";
import { useSession } from "@/lib/session";
import { FORM_MANAGEMENT } from "@/lib/navigation";
import { REPORT_FORM_LEAVES } from "@/lib/reports";
import { KVKS } from "@/lib/rbac";

const SUMMARY_STATS = [
  { label: "KVKs", value: "0" },
  { label: "Forms Tracked", value: "0" },
  { label: "Entries Filled", value: "0 / 0" },
  { label: "Overall Progress", value: "0%" },
];

/** A KVK Admin's own stats drop the "KVKs" tile - there's only ever the one KVK, itself. */
const KVK_SUMMARY_STATS = SUMMARY_STATS.filter((stat) => stat.label !== "KVKs");

type ViewMode = "kvk" | "matrix";

export default function FormSummaryPage() {
  const session = useSession();
  const isKvk = session.role !== "super-admin";
  const [view, setView] = useState<ViewMode>("kvk");

  const matrixKvks = isKvk ? [session.kvkName ?? "My KVK"] : KVKS.map((kvk) => kvk.name);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ListChecks className="size-5 shrink-0 text-primary" />
            <h1 className="text-3xl font-semibold text-primary">
              {isKvk
                ? `Form Summary - ${session.kvkName ?? "My KVK"}`
                : "Form Summary - All KVKs"}
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {isKvk
              ? "Track which forms your KVK has submitted"
              : "Track which KVKs have submitted each form"}
          </p>
        </div>
        <FilterSelect
          label="Reporting year"
          options={[String(new Date().getFullYear())]}
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        {/* Same rule as the Dashboard: a KVK Admin has one tile fewer, so the column count follows the tile count instead of leaving a gap. */}
        <div
          className={cn(
            "grid grid-cols-2 gap-4",
            isKvk ? "sm:grid-cols-3" : "sm:grid-cols-4",
          )}
        >
          {(isKvk ? KVK_SUMMARY_STATS : SUMMARY_STATS).map((stat) => (
            <div key={stat.label}>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {stat.label}
              </p>
              <p
                className={cn(
                  "mt-1 text-2xl font-semibold tabular-nums",
                  stat.label === "Overall Progress"
                    ? "text-primary"
                    : "text-foreground",
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
        {/* Same control for both roles - only the primary view's label differs, since a KVK Admin lists their own forms where a Super Admin lists KVKs. */}
        <div className="flex items-center gap-1 rounded-md border border-border bg-muted/50 p-0.5">
          <button
            type="button"
            onClick={() => setView("kvk")}
            className={cn(
              "flex items-center gap-1.5 rounded-[calc(var(--radius-md)-2px)] px-3 py-1.5 text-sm font-medium transition-colors",
              view === "kvk"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutGrid className="size-3.5" />
            {isKvk ? "By Form" : "By KVK"}
          </button>
          <button
            type="button"
            onClick={() => setView("matrix")}
            className={cn(
              "flex items-center gap-1.5 rounded-[calc(var(--radius-md)-2px)] px-3 py-1.5 text-sm font-medium transition-colors",
              view === "matrix"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Table2 className="size-3.5" />
            Matrix
          </button>
        </div>
        <div className="flex items-center gap-3">
          <FilterSelect label="Progress" options={["All"]} />
          <Input
            placeholder={isKvk ? "Filter forms..." : "Filter KVKs..."}
            className="w-64"
          />
        </div>
      </div>

      {view === "kvk" ? (
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <th className="px-4 py-3">
                  <span className="flex items-center gap-1.5">
                    {isKvk ? "Form" : "KVK"} <Filter className="size-3" />
                  </span>
                </th>
                <th className="px-4 py-3">Filled</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3 text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {isKvk ? (
                FORM_MANAGEMENT.map((form) => (
                  <tr
                    key={form.slug}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 text-foreground">{form.label}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Not filled
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                        <div className="h-full w-0 rounded-full bg-primary" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      0%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-16 text-center text-muted-foreground"
                  >
                    No KVKs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /**
         * Matrix view: form (row) x KVK (column) completion grid, per the
         * client's reference layout - KVK names across the top each with a
         * percentage, form names down the left, a dash where nothing has
         * been filled. No submission data exists yet, so every cell reads
         * the honest "-" rather than a fabricated count.
         */
        <div className="mt-4 overflow-auto rounded-lg border border-border">
          {/*
           * "#" and "Form Name" render as ONE sticky cell (colSpan 2) with an
           * internal flex row splitting them, rather than two independently
           * sticky cells - two separate sticky columns need their offsets to
           * agree exactly, which table auto-layout's sub-pixel column widths
           * don't reliably do.
           *
           * The divider at the sticky cell's right edge is an inset
           * box-shadow, not a border. A `border-r` there depends on the
           * sticky cell's edge lining up pixel-for-pixel with the adjacent
           * (non-sticky) KVK column's own edge - `position: sticky` promotes
           * the cell to its own compositor layer, and that layer's edge can
           * round to a different sub-pixel than the normal-flow column next
           * to it, especially under fractional display scaling (125%/150%),
           * leaving a hairline gap that isn't caught by testing at 1x/2x/3x.
           * A box-shadow is painted entirely within the sticky cell's own
           * layer, so the divider line no longer depends on that alignment
           * at all.
           */}
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <th
                  colSpan={2}
                  className="sticky left-0 z-10 bg-muted p-0 shadow-[inset_-1px_0_0_0_var(--border)]"
                >
                  <div className="flex">
                    <div className="w-14 shrink-0 border-r border-border px-4 py-3">#</div>
                    <div className="min-w-52 flex-1 px-4 py-3">Form Name</div>
                  </div>
                </th>
                {matrixKvks.map((kvk) => (
                  <th
                    key={kvk}
                    className="min-w-28 border-r border-border bg-muted px-3 py-2 text-center last:border-r-0"
                  >
                    <div className="whitespace-nowrap normal-case">{kvk}</div>
                    <div className="mt-0.5 font-normal text-muted-foreground/70 normal-case">
                      0%
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {REPORT_FORM_LEAVES.map((form, index) => (
                <tr key={form.path} className="border-b border-border last:border-0">
                  <td
                    colSpan={2}
                    className="sticky left-0 z-10 bg-card p-0 shadow-[inset_-1px_0_0_0_var(--border)]"
                  >
                    <div className="flex">
                      <div className="w-14 shrink-0 border-r border-border px-4 py-2.5 text-muted-foreground">
                        {index + 1}
                      </div>
                      <div className="min-w-52 flex-1 px-4 py-2.5 text-foreground">
                        {form.label}
                      </div>
                    </div>
                  </td>
                  {matrixKvks.map((kvk) => (
                    <td
                      key={kvk}
                      className="border-r border-border px-3 py-2.5 text-center text-muted-foreground last:border-r-0"
                    >
                      —
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
