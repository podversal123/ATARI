"use client";

import { useState } from "react";
import { CalendarDays, Eye, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  REPORT_FORM_OPTIONS,
  REPORT_ZONE_OPTIONS,
  QUICK_SELECT_OPTIONS,
  formatDisplayDate,
  hostOrgsForState,
  kvksForHostOrg,
  resolveQuickSelectRange,
  statesForZone,
  type QuickSelectRange,
} from "@/lib/reports";
import { useReportPreview } from "./use-report-preview";
import { ReportHeaderBar } from "./report-header-bar";
import { ReportPreviewCard } from "./report-preview-card";
import { DownloadReportButtons } from "./download-report-buttons";

const ALL = "all";

function firstOfMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Super Admin / Admin Report screen. The Zone -> State -> Host Organisation
 * -> KVK filters cascade strictly (each level's options depend on the level
 * above, "All" is always available so a report can be run collectively
 * across a whole scope or narrowed down to one specific KVK), and changing
 * any parent filter resets its descendants and invalidates the current
 * preview — both behaviours come directly from the spec's filter rules.
 */
export function SuperAdminReportView() {
  const [zone, setZone] = useState(ALL);
  const [state, setState] = useState(ALL);
  const [hostOrg, setHostOrg] = useState(ALL);
  const [kvk, setKvk] = useState(ALL);
  const [formSlug, setFormSlug] = useState(ALL);
  const [fromDate, setFromDate] = useState(firstOfMonth());
  const [toDate, setToDate] = useState(today());
  const [quickSelect, setQuickSelect] = useState<QuickSelectRange>("custom");

  const { phase, validationError, reportId, generatedAt, generate, markStale } = useReportPreview();

  const stateOptions = zone === ALL ? [] : statesForZone(zone);
  const hostOrgOptions = state === ALL ? [] : hostOrgsForState(state);
  const kvkOptions = hostOrg === ALL ? [] : kvksForHostOrg(hostOrg);

  function onZoneChange(value: string) {
    setZone(value);
    setState(ALL);
    setHostOrg(ALL);
    setKvk(ALL);
    markStale();
  }
  function onStateChange(value: string) {
    setState(value);
    setHostOrg(ALL);
    setKvk(ALL);
    markStale();
  }
  function onHostOrgChange(value: string) {
    setHostOrg(value);
    setKvk(ALL);
    markStale();
  }
  function onKvkChange(value: string) {
    setKvk(value);
    markStale();
  }
  function onFormChange(value: string) {
    setFormSlug(value);
    markStale();
  }
  function onQuickSelect(value: QuickSelectRange) {
    setQuickSelect(value);
    const range = resolveQuickSelectRange(value);
    if (range) {
      setFromDate(range.from);
      setToDate(range.to);
    }
    markStale();
  }
  function onDateInput(setter: (value: string) => void, value: string) {
    setter(value);
    setQuickSelect("custom");
    markStale();
  }

  function handleGenerate() {
    generate(() => {
      if (!fromDate || !toDate) return "Please select the required report filters.";
      if (fromDate > toDate) return "To Date cannot be earlier than From Date.";
      return null;
    });
  }

  const selectedFormLabel =
    formSlug === ALL ? "All Forms" : REPORT_FORM_OPTIONS.find((f) => f.slug === formSlug)?.label ?? "All Forms";

  return (
    <div className="space-y-4">
      <ReportHeaderBar title="SUPER ADMIN REPORTS" />

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
          <Filter className="size-3.5" />
          Report Filters
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Zone</label>
            <select
              value={zone}
              onChange={(e) => onZoneChange(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring"
            >
              <option value={ALL}>All Zones</option>
              {REPORT_ZONE_OPTIONS.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">State</label>
            <select
              value={state}
              onChange={(e) => onStateChange(e.target.value)}
              disabled={zone === ALL}
              className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring disabled:opacity-50"
            >
              <option value={ALL}>All States</option>
              {stateOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Host Organisation</label>
            <select
              value={hostOrg}
              onChange={(e) => onHostOrgChange(e.target.value)}
              disabled={state === ALL}
              className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring disabled:opacity-50"
            >
              <option value={ALL}>All Host Organizations</option>
              {hostOrgOptions.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">KVK</label>
            <select
              value={kvk}
              onChange={(e) => onKvkChange(e.target.value)}
              disabled={hostOrg === ALL}
              className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring disabled:opacity-50"
            >
              <option value={ALL}>All KVKs</option>
              {kvkOptions.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-muted-foreground">Select Form</label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onFormChange(ALL)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                formSlug === ALL
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              All Forms
            </button>
            {REPORT_FORM_OPTIONS.map((form) => (
              <button
                key={form.slug}
                type="button"
                onClick={() => onFormChange(form.slug)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  formSlug === form.slug
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {form.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
              <CalendarDays className="size-3.5" />
              Date Range
            </div>
            <div className="mt-1.5 grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">From Date</label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => onDateInput(setFromDate, e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">To Date</label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => onDateInput(setToDate, e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold tracking-wide text-primary uppercase">Quick Select</label>
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
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {validationError && <p className="mt-3 text-xs text-destructive">{validationError}</p>}
      </div>

      <div>
        <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
          <Eye className="size-3.5" />
          Report Preview
        </div>
        <ReportPreviewCard
          heading="REPORT SUMMARY"
          reportId={reportId}
          phase={phase}
          metaColumns={[
            [
              { label: "Zone", value: zone === ALL ? "All Zones" : zone },
              { label: "State", value: state === ALL ? "All States" : state },
              { label: "Host Organisation", value: hostOrg === ALL ? "All Host Organizations" : hostOrg },
            ],
            [
              { label: "KVK", value: kvk === ALL ? "All KVKs" : kvk },
              { label: "Form", value: selectedFormLabel },
            ],
            [
              { label: "From Date", value: formatDisplayDate(fromDate) },
              { label: "To Date", value: formatDisplayDate(toDate) },
              {
                label: "Generated On",
                value: generatedAt
                  ? `${formatDisplayDate(generatedAt.toISOString().slice(0, 10))} ${generatedAt.toLocaleTimeString(
                      "en-IN",
                      { hour: "2-digit", minute: "2-digit" }
                    )}`
                  : "",
              },
              { label: "Generated By", value: "Super Admin" },
            ],
          ]}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Download Report</p>
          <DownloadReportButtons enabled={false} />
        </div>
        <Button onClick={handleGenerate}>Generate Preview</Button>
      </div>
    </div>
  );
}
