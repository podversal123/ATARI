"use client";

import { useState } from "react";
import { CalendarDays, Eye, Filter, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KVK_MASTER_ROWS } from "@/lib/masters";
import { REPORT_FORM_OPTIONS, formatDisplayDate } from "@/lib/reports";
import { useReportPreview } from "./use-report-preview";
import { ReportHeaderBar } from "./report-header-bar";
import { ReportPreviewCard } from "./report-preview-card";
import { DownloadReportButtons } from "./download-report-buttons";

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
 * account, never a user-editable field.
 */
export function KvkReportView({ kvkName }: KvkReportViewProps) {
  const currentKvkName = kvkName ?? KVK_MASTER_ROWS[0].kvk;
  const [formSlug, setFormSlug] = useState<string>("all");
  const [fromDate, setFromDate] = useState(firstOfMonth());
  const [toDate, setToDate] = useState(today());

  const { phase, validationError, reportId, generate, markStale } = useReportPreview();

  function handleFilterChange<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      markStale();
    };
  }

  function handleGenerate() {
    generate(() => {
      if (!fromDate || !toDate) return "Please select the required report filters.";
      if (fromDate > toDate) return "To Date cannot be earlier than From Date.";
      return null;
    });
  }

  const selectedFormLabel =
    formSlug === "all" ? "All Forms" : REPORT_FORM_OPTIONS.find((f) => f.slug === formSlug)?.label ?? "All Forms";

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
            <select
              value={formSlug}
              onChange={(e) => handleFilterChange(setFormSlug)(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring"
            >
              <option value="all">All Forms</option>
              {REPORT_FORM_OPTIONS.map((form) => (
                <option key={form.slug} value={form.slug}>
                  {form.label}
                </option>
              ))}
            </select>
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

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Download Report</p>
            <DownloadReportButtons enabled={false} />
          </div>
        </div>

        <div className="space-y-4">
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
                  onChange={(e) => handleFilterChange(setFromDate)(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">To Date</label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => handleFilterChange(setToDate)(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
              <Eye className="size-3.5" />
              Report Preview
            </div>
            <ReportPreviewCard
              heading="KVK REPORT PREVIEW"
              reportId={reportId}
              phase={phase}
              metaColumns={[
                [
                  { label: "KVK Name", value: currentKvkName },
                  { label: "Form", value: selectedFormLabel },
                ],
                [
                  { label: "From Date", value: formatDisplayDate(fromDate) },
                  { label: "To Date", value: formatDisplayDate(toDate) },
                ],
              ]}
            />
            <Button className="mt-3 w-full" onClick={handleGenerate}>
              Generate Preview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
