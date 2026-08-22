"use client";

import { useState } from "react";
import { Target as TargetIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyDataTable } from "@/components/data-table/empty-data-table";
import { useSession } from "@/lib/session";
import { KVKS } from "@/lib/rbac";

/** Same four categories the Dashboard's own stat cards already track (Total OFT, Total FLD, Training, Ext. Activity). */
const CATEGORIES = ["OFT", "FLD", "Training", "Extension Activity"];

function reportingYearOptions(): string[] {
  const currentYear = new Date().getFullYear();
  return [currentYear + 1, currentYear, currentYear - 1, currentYear - 2].map(
    String,
  );
}

const SUPER_ADMIN_COLUMNS = [
  { key: "reportingYear", label: "Reporting Year" },
  { key: "kvk", label: "KVK" },
  { key: "category", label: "Category" },
  { key: "target", label: "Target" },
  { key: "achieved", label: "Achieved" },
  { key: "progress", label: "Progress" },
  { key: "status", label: "Status" },
];

/** KVK Admin's own view drops the KVK column - every row is already their own KVK. */
const KVK_COLUMNS = SUPER_ADMIN_COLUMNS.filter(
  (column) => column.key !== "kvk",
);

/**
 * No the reference exists anywhere in the client's materials for this
 * page, so this flow isn't lifted from a source - it's the sensible shape
 * given what a "target" means everywhere else in this app: the Dashboard's
 * OFT/FLD Progress cards already track each KVK against Ongoing / Completed
 * / Not started, and the KVK/category/year triple is how every achievement
 * form (Trainings, CFLD, etc.) already keys its rows. Super Admin assigns
 * the Target number per KVK+category+year here; Achieved/Progress/Status
 * fill in from whatever that KVK actually submits through Form Management -
 * so only Super Admin gets an assign form, a KVK Admin gets a read-only view
 * scoped to their own KVK, mirroring the Notifications page's send/receive split.
 */
export default function TargetsPage() {
  const session = useSession();
  const isKvk = session.role !== "super-admin";

  const years = reportingYearOptions();
  const [reportingYear, setReportingYear] = useState(years[1]);
  const [kvk, setKvk] = useState(KVKS[0]?.name ?? "");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [targetValue, setTargetValue] = useState("");

  return (
    <div>
      <PageHeader trail={[{ label: "Targets" }]} />

      {!isKvk && (
        <div className="mb-4 rounded-lg border border-border bg-card p-4">
          <p className="mb-3 text-xs font-semibold tracking-wide text-primary uppercase">
            Assign Target
          </p>
          <div className="grid gap-3 sm:grid-cols-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Reporting Year
              </label>
              <select
                value={reportingYear}
                onChange={(e) => setReportingYear(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                KVK
              </label>
              <select
                value={kvk}
                onChange={(e) => setKvk(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring"
              >
                {KVKS.map((k) => (
                  <option key={k.name} value={k.name}>
                    {k.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Target
              </label>
              <Input
                type="number"
                min="0"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="e.g. 25"
                className="mt-1"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <Button size="sm" disabled={!targetValue}>
              <TargetIcon className="size-3.5" />
              Assign Target
            </Button>
          </div>
        </div>
      )}

      <EmptyDataTable
        title="Targets"
        icon="targets"
        subtitle={
          isKvk
            ? `Targets assigned to ${session.kvkName ?? "your KVK"} and your progress against them`
            : "Targets assigned across all KVKs, tracked against what each KVK reports"
        }
        columns={isKvk ? KVK_COLUMNS : SUPER_ADMIN_COLUMNS}
      />
    </div>
  );
}
