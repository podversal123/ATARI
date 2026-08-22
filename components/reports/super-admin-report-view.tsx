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
  districtsForHostOrg,
  hostOrgsForState,
  kvksForDistrict,
  kvksForHostOrg,
  resolveQuickSelectRange,
  statesForZone,
  type QuickSelectRange,
} from "@/lib/reports";
import { ReportHeaderBar } from "./report-header-bar";
import { SelectFormDropdown } from "./select-form-dropdown";
import { SelectOrgKvksDropdown } from "./select-org-kvks-dropdown";

const ALL = "all";

function firstOfMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
}
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Super Admin / Admin Report screen. Zone -> State -> Host Organisation
 * cascades as before. Once a Host Organisation is picked, every KVK under
 * it shows as a checklist instead of a single dropdown - leaving them all
 * checked gives a collective report across that organisation, unchecking
 * some gives a selective report for just those KVKs. Client direction:
 * "ek organisation se sare host show ho aur fir collective ya selective
 * report checkbox ke help se le sku."
 */
export function SuperAdminReportView() {
  const router = useRouter();
  const [zone, setZone] = useState(REPORT_ZONE_OPTIONS[0]);
  const [state, setState] = useState(ALL);
  const [hostOrg, setHostOrg] = useState(ALL);
  const [district, setDistrict] = useState(ALL);
  const [selectedKvks, setSelectedKvks] = useState<Set<string>>(new Set());
  const [selectedForms, setSelectedForms] = useState<Set<string>>(
    new Set(ALL_FORM_PATHS),
  );
  const [fromDate, setFromDate] = useState(firstOfMonth());
  const [toDate, setToDate] = useState(today());
  const [quickSelect, setQuickSelect] = useState<QuickSelectRange>("custom");
  const [validationError, setValidationError] = useState<string | null>(null);

  const stateOptions = statesForZone(zone);
  const hostOrgOptions = state === ALL ? [] : hostOrgsForState(state);
  const districtOptions = hostOrg === ALL ? [] : districtsForHostOrg(hostOrg);
  const kvkOptions =
    hostOrg === ALL
      ? []
      : district === ALL
        ? kvksForHostOrg(hostOrg)
        : kvksForDistrict(hostOrg, district);

  function onZoneChange(value: string) {
    setZone(value);
    setState(ALL);
    setHostOrg(ALL);
    setDistrict(ALL);
    setSelectedKvks(new Set());
  }
  function onStateChange(value: string) {
    setState(value);
    setHostOrg(ALL);
    setDistrict(ALL);
    setSelectedKvks(new Set());
  }
  function onHostOrgChange(value: string) {
    setHostOrg(value);
    setDistrict(ALL);
    // Defaults to every KVK under the newly picked organisation selected - a collective report out of the box.
    setSelectedKvks(value === ALL ? new Set() : new Set(kvksForHostOrg(value)));
  }
  function onDistrictChange(value: string) {
    setDistrict(value);
    // Narrowing to a district still defaults to every KVK inside it - collective within that narrower scope.
    setSelectedKvks(
      value === ALL
        ? new Set(kvksForHostOrg(hostOrg))
        : new Set(kvksForDistrict(hostOrg, value)),
    );
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
    if (hostOrg !== ALL && selectedKvks.size === 0) {
      setValidationError("Please select at least one KVK.");
      return;
    }
    setValidationError(null);

    const kvkLabel =
      hostOrg === ALL
        ? "All KVKs"
        : selectedKvks.size === kvkOptions.length
          ? "All KVKs"
          : Array.from(selectedKvks).join(", ");

    const query = new URLSearchParams({
      type: "admin",
      zone,
      state: state === ALL ? "All States" : state,
      hostOrg: hostOrg === ALL ? "All Host Organizations" : hostOrg,
      district: district === ALL ? "All Districts" : district,
      kvk: kvkLabel,
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
    setDistrict(ALL);
    setSelectedKvks(new Set());
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
          ? (REPORT_FORM_LEAVES.find((f) => selectedForms.has(f.path))?.label ??
            "1 Form Selected")
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

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Zone
            </label>
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
            <label className="text-xs font-medium text-muted-foreground">
              State
            </label>
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
            <label className="text-xs font-medium text-muted-foreground">
              Host Organisation
            </label>
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
            <label className="text-xs font-medium text-muted-foreground">
              District
            </label>
            <select
              value={district}
              onChange={(e) => onDistrictChange(e.target.value)}
              disabled={hostOrg === ALL}
              className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring disabled:opacity-50"
            >
              <option value={ALL}>All Districts</option>
              {districtOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              KVK
            </label>
            <SelectOrgKvksDropdown
              kvks={kvkOptions}
              selected={selectedKvks}
              onChange={setSelectedKvks}
              disabled={hostOrg === ALL}
            />
          </div>
        </div>

        <div className="mt-4 max-w-xs">
          <label className="text-xs font-medium text-muted-foreground">
            Select Form
          </label>
          <SelectFormDropdown
            selected={selectedForms}
            onChange={onFormsChange}
          />
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
