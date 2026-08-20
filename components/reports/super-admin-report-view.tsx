"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Eye, Filter, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ALL_FORM_PATHS,
  REPORT_FORM_LEAVES,
  REPORT_ZONE_OPTIONS,
  QUICK_SELECT_OPTIONS,
  hostOrgsForState,
  kvksForHostOrg,
  resolveQuickSelectRange,
  statesForZone,
  type QuickSelectRange,
} from "@/lib/reports";
import { ReportHeaderBar } from "./report-header-bar";
import { SelectFormDropdown } from "./select-form-dropdown";

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
  const router = useRouter();
  const [zone, setZone] = useState(REPORT_ZONE_OPTIONS[0]);
  const [state, setState] = useState(ALL);
  const [hostOrg, setHostOrg] = useState(ALL);
  const [kvk, setKvk] = useState(ALL);
  const [selectedForms, setSelectedForms] = useState<Set<string>>(new Set(ALL_FORM_PATHS));
  const [fromDate, setFromDate] = useState(firstOfMonth());
  const [toDate, setToDate] = useState(today());
  const [quickSelect, setQuickSelect] = useState<QuickSelectRange>("custom");
  const [validationError, setValidationError] = useState<string | null>(null);

  const stateOptions = statesForZone(zone);
  const hostOrgOptions = state === ALL ? [] : hostOrgsForState(state);
  const kvkOptions = hostOrg === ALL ? [] : kvksForHostOrg(hostOrg);

  function onZoneChange(value: string) {
    setZone(value);
    setState(ALL);
    setHostOrg(ALL);
    setKvk(ALL);
  }
  function onStateChange(value: string) {
    setState(value);
    setHostOrg(ALL);
    setKvk(ALL);
  }
  function onHostOrgChange(value: string) {
    setHostOrg(value);
    setKvk(ALL);
  }
  function onKvkChange(value: string) {
    setKvk(value);
  }
  function onFormsChange(next: Set<string>) {
    setSelectedForms(next);
  }
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
      type: "admin",
      zone,
      state: state === ALL ? "All States" : state,
      hostOrg: hostOrg === ALL ? "All Host Organizations" : hostOrg,
      kvk: kvk === ALL ? "All KVKs" : kvk,
      form: selectedFormLabel,
      from: fromDate,
      to: toDate,
    });
    router.push(`/reports/preview?${query.toString()}`);
  }

  function resetFilters() {
    setZone(REPORT_ZONE_OPTIONS[0]);
    setState(ALL);
    setHostOrg(ALL);
    setKvk(ALL);
    setSelectedForms(new Set(ALL_FORM_PATHS));
    setFromDate(firstOfMonth());
    setToDate(today());
    setQuickSelect("custom");
    setValidationError(null);
  }

  const selectedFormLabel =
    selectedForms.size === ALL_FORM_PATHS.size
      ? "All Forms"
      : selectedForms.size === 0
        ? "No Forms Selected"
        : selectedForms.size === 1
          ? (REPORT_FORM_LEAVES.find((f) => selectedForms.has(f.path))?.label ?? "1 Form Selected")
          : `${selectedForms.size} Forms Selected`;

  return (
    <div className="space-y-4">
      <ReportHeaderBar title="SUPER ADMIN REPORTS" />

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

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Zone</label>
            <select
              value={zone}
              onChange={(e) => onZoneChange(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring"
            >
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

        <div className="mt-4 max-w-xs">
          <label className="text-xs font-medium text-muted-foreground">Select Form</label>
          <SelectFormDropdown selected={selectedForms} onChange={onFormsChange} />
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
            <CalendarDays className="size-3.5" />
            Date Range
          </div>
          <div className="mt-1.5 flex flex-wrap items-end gap-4">
            <div className="w-40 shrink-0">
              <label className="text-xs font-medium text-muted-foreground">From Date</label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => onDateInput(setFromDate, e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="w-40 shrink-0">
              <label className="text-xs font-medium text-muted-foreground">To Date</label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => onDateInput(setToDate, e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="text-xs font-medium text-muted-foreground">Quick Select</label>
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

      <div className="flex justify-end">
        <Button onClick={handleGenerate}>
          <Eye className="size-3.5" />
          Generate Preview
        </Button>
      </div>
    </div>
  );
}
