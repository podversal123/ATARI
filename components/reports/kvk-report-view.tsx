"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Eye, Filter, Info, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KVK_MASTER_ROWS } from "@/lib/masters";
import {
  ALL_FORM_PATHS,
  QUICK_SELECT_OPTIONS,
  REPORT_FORM_LEAVES,
  resolveQuickSelectRange,
  type QuickSelectRange,
} from "@/lib/reports";
import { ReportHeaderBar } from "./report-header-bar";
import { SelectFormDropdown } from "./select-form-dropdown";

function firstOfYear(): string {
  const now = new Date();
  return new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
}
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

type KvkReportViewProps = {
  /** The logged-in KVK's name, from the mock session (lib/session.tsx) - falls back to the first real KVK row if the session has none. */
  kvkName?: string;
};

/**
 * KVK Report screen. Deliberately the same layout as the Super Admin screen
 * (`super-admin-report-view.tsx`) - one Report Filters card with a Reset
 * action, a Date Range block with Quick Select pills, then Generate Preview -
 * per client direction that a KVK Admin's UI should look exactly like Super
 * Admin's, with only the *data* scoped to their own KVK.
 *
 * The one deliberate difference is the cascade: per the reports spec a KVK
 * user never selects Zone/State/Host Organisation/KVK, because their own KVK
 * is identified from the logged-in account and is never user-editable. That
 * row is replaced by a read-only notice showing which KVK they're reporting
 * on - a data-isolation rule, not a layout divergence.
 */
export function KvkReportView({ kvkName }: KvkReportViewProps) {
  const router = useRouter();
  const currentKvkName = kvkName ?? KVK_MASTER_ROWS[0].kvk;
  const [selectedForms, setSelectedForms] = useState<Set<string>>(
    new Set(ALL_FORM_PATHS),
  );
  const [fromDate, setFromDate] = useState(firstOfYear());
  const [toDate, setToDate] = useState(today());
  const [quickSelect, setQuickSelect] = useState<QuickSelectRange>("this-year");
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectedFormLabel =
    selectedForms.size === ALL_FORM_PATHS.size
      ? "All Forms"
      : selectedForms.size === 0
        ? "No Forms Selected"
        : selectedForms.size === 1
          ? (REPORT_FORM_LEAVES.find((f) => selectedForms.has(f.path))?.label ??
            "1 Form Selected")
          : `${selectedForms.size} Forms Selected`;

  function onQuickSelect(value: QuickSelectRange) {
    setQuickSelect(value);
    const range = resolveQuickSelectRange(value);
    if (range) {
      setFromDate(range.from);
      setToDate(range.to);
    }
  }

  function onDateInput(setter: (value: string) => void, value: string) {
    setter(value);
    setQuickSelect("custom");
  }

  function resetFilters() {
    setSelectedForms(new Set(ALL_FORM_PATHS));
    setFromDate(firstOfYear());
    setToDate(today());
    setQuickSelect("this-year");
    setValidationError(null);
  }

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

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
            <Filter className="size-3.5" />
            Report Filters
          </div>
          <Button variant="outline-primary" size="sm" onClick={resetFilters}>
            <RotateCcw className="size-3.5" />
            Reset Filters
          </Button>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              KVK
            </label>
            <div className="mt-1 flex h-9 w-full items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 text-sm text-muted-foreground">
              <Info className="size-3.5 shrink-0" />
              <span className="truncate">{currentKvkName}</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Select Form
            </label>
            <SelectFormDropdown
              selected={selectedForms}
              onChange={setSelectedForms}
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
            <CalendarDays className="size-3.5" />
            Date Range
          </div>
          <div className="mt-1.5 flex flex-wrap items-end gap-4">
            <div className="w-40 shrink-0">
              <label className="text-xs font-medium text-muted-foreground">
                From Date
              </label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => onDateInput(setFromDate, e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="w-40 shrink-0">
              <label className="text-xs font-medium text-muted-foreground">
                To Date
              </label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => onDateInput(setToDate, e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="text-xs font-medium text-muted-foreground">
              Quick Select
            </label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {QUICK_SELECT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onQuickSelect(option.value)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    quickSelect === option.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {validationError && (
          <p className="mt-3 text-xs text-destructive">{validationError}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleGenerate}>
          <Eye className="size-3.5" />
          Generate Preview
        </Button>
      </div>
    </div>
  );
}
