"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Eye, Filter, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KVK_MASTER_ROWS } from "@/lib/masters";
import { ALL_FORM_PATHS, REPORT_FORM_LEAVES } from "@/lib/reports";
import { ReportHeaderBar } from "./report-header-bar";
import { SelectFormDropdown } from "./select-form-dropdown";

function firstOfMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

type KvkReportViewProps = {
  /** The logged-in KVK's name, from the mock session (lib/session.ts) — falls back to the first real KVK row if the session has none. */
  kvkName?: string;
};

/**
 * KVK Report screen. Per the spec, a KVK user never selects Zone/State/Host
 * Organisation/KVK — their own KVK is auto-identified from the logged-in
 * account, never a user-editable field. Generate Preview navigates to
 * /reports/preview (a real URL) instead of updating this page in-place.
 */
export function KvkReportView({ kvkName }: KvkReportViewProps) {
  const router = useRouter();
  const currentKvkName = kvkName ?? KVK_MASTER_ROWS[0].kvk;
  const [selectedForms, setSelectedForms] = useState<Set<string>>(new Set(ALL_FORM_PATHS));
  const [fromDate, setFromDate] = useState(firstOfMonth());
  const [toDate, setToDate] = useState(today());
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectedFormLabel =
    selectedForms.size === ALL_FORM_PATHS.size
      ? "All Forms"
      : selectedForms.size === 0
        ? "No Forms Selected"
        : selectedForms.size === 1
          ? (REPORT_FORM_LEAVES.find((f) => selectedForms.has(f.path))?.label ?? "1 Form Selected")
          : `${selectedForms.size} Forms Selected`;

  function handleGenerate() {
    if (selectedForms.size === 0 || !fromDate || !toDate) {
      setValidationError("Please select the required report filters.");
      return;
    }
    if (fromDate > toDate) {
      setValidationError("To Date cannot be earlier than From Date.");
      return;
    }
    setValidationError(null);

    const query = new URLSearchParams({
      type: "kvk",
      kvk: currentKvkName,
      form: selectedFormLabel,
      from: fromDate,
      to: toDate,
    });
    router.push(`/reports/preview?${query.toString()}`);
  }

  return (
    <div className="space-y-4">
      <ReportHeaderBar title="KVK REPORTS" />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,320px)_1fr]">
        <div className="space-y-4 rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
            <Filter className="size-3.5" />
            Report Filters
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Select Form</label>
            <SelectFormDropdown selected={selectedForms} onChange={setSelectedForms} />
          </div>

          <div className="flex items-start gap-2 rounded-md bg-accent px-3 py-2.5 text-xs text-accent-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            <span>
              You are viewing reports for KVK: <strong>{currentKvkName}</strong>
            </span>
          </div>

          {validationError && <p className="text-xs text-destructive">{validationError}</p>}

          <Button variant="outline" size="sm" className="w-full" onClick={handleGenerate}>
            <Eye className="size-3.5" />
            Generate Preview
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
            <CalendarDays className="size-3.5" />
            Date Range
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">From Date</label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">To Date</label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <Button className="mt-4 w-full" onClick={handleGenerate}>
            <Eye className="size-3.5" />
            Generate Preview
          </Button>
        </div>
      </div>
    </div>
  );
}
