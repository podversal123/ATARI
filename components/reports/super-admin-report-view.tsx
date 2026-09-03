"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, CalendarDays, Eye, Filter, LandPlot, MapPin, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SimpleSelect } from "@/components/ui/simple-select";
import {
  ALL_FORM_PATHS,
  ALL_HOST_ORGS,
  ALL_HOST_ORG_DISTRICTS,
  ALL_STATES,
  REPORT_FORM_LEAVES,
  REPORT_ZONE_OPTIONS,
  QUICK_SELECT_OPTIONS,
  districtsForHostOrgs,
  hostOrgsForStates,
  kvksForHostOrgsAndDistricts,
  resolveQuickSelectRange,
  type QuickSelectRange,
} from "@/lib/reports";
import { ReportHeaderBar } from "./report-header-bar";
import { SelectFormDropdown } from "./select-form-dropdown";
import { SelectOrgKvksDropdown } from "./select-org-kvks-dropdown";
import { MultiSelectChecklist } from "./multi-select-checklist";

/** `YYYY-MM-DD` from local parts - `toISOString()` would shift a day either side of UTC (1 Jan local -> 31 Dec in India). */
function toLocalIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function firstOfYear(): string {
  return toLocalIso(new Date(new Date().getFullYear(), 0, 1));
}
function today(): string {
  return toLocalIso(new Date());
}

/**
 * Super Admin / Admin Report screen. State, Host Organisation and District
 * are all checkbox multi-selects that cascade into each other, same
 * collective-by-default / uncheck-to-go-selective interaction the KVK picker
 * already used: picking a State auto-checks every Host Organisation under
 * it, picking a Host Org auto-checks every District under it, and so on down
 * to KVK. Leaving every State checked (the default) naturally exposes every
 * real Host Org/District/KVK, matching the "select all states -> show All
 * Hosts/All Districts/All KVKs" requirement without a separate code path.
 */
export function SuperAdminReportView() {
  const router = useRouter();
  const [zone, setZone] = useState(REPORT_ZONE_OPTIONS[0]);
  const [selectedStates, setSelectedStates] = useState<Set<string>>(new Set(ALL_STATES));
  const [selectedHostOrgs, setSelectedHostOrgs] = useState<Set<string>>(new Set(ALL_HOST_ORGS));
  const [selectedDistricts, setSelectedDistricts] = useState<Set<string>>(
    new Set(ALL_HOST_ORG_DISTRICTS),
  );
  const [selectedKvks, setSelectedKvks] = useState<Set<string>>(
    new Set(kvksForHostOrgsAndDistricts(ALL_HOST_ORGS, ALL_HOST_ORG_DISTRICTS)),
  );
  const [selectedForms, setSelectedForms] = useState<Set<string>>(
    new Set(ALL_FORM_PATHS),
  );
  const [fromDate, setFromDate] = useState(firstOfYear());
  const [toDate, setToDate] = useState(today());
  const [quickSelect, setQuickSelect] = useState<QuickSelectRange>("this-year");
  const [validationError, setValidationError] = useState<string | null>(null);

  const hostOrgOptions = hostOrgsForStates(Array.from(selectedStates));
  const districtOptions = districtsForHostOrgs(Array.from(selectedHostOrgs));
  const kvkOptions = kvksForHostOrgsAndDistricts(
    Array.from(selectedHostOrgs),
    Array.from(selectedDistricts),
  );

  function onZoneChange(value: string) {
    setZone(value);
    // Only one real zone exists today, but keep the cascade consistent if that ever changes.
    setSelectedStates(new Set(ALL_STATES));
    setSelectedHostOrgs(new Set(ALL_HOST_ORGS));
    setSelectedDistricts(new Set(ALL_HOST_ORG_DISTRICTS));
    setSelectedKvks(new Set(kvksForHostOrgsAndDistricts(ALL_HOST_ORGS, ALL_HOST_ORG_DISTRICTS)));
  }
  function onStatesChange(next: Set<string>) {
    setSelectedStates(next);
    const orgs = hostOrgsForStates(Array.from(next));
    setSelectedHostOrgs(new Set(orgs));
    const districts = districtsForHostOrgs(orgs);
    setSelectedDistricts(new Set(districts));
    setSelectedKvks(new Set(kvksForHostOrgsAndDistricts(orgs, districts)));
  }
  function onHostOrgsChange(next: Set<string>) {
    setSelectedHostOrgs(next);
    const orgs = Array.from(next);
    const districts = districtsForHostOrgs(orgs);
    setSelectedDistricts(new Set(districts));
    setSelectedKvks(new Set(kvksForHostOrgsAndDistricts(orgs, districts)));
  }
  function onDistrictsChange(next: Set<string>) {
    setSelectedDistricts(next);
    setSelectedKvks(
      new Set(kvksForHostOrgsAndDistricts(Array.from(selectedHostOrgs), Array.from(next))),
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
    if (selectedKvks.size === 0) {
      setValidationError("Please select at least one KVK.");
      return;
    }
    setValidationError(null);

    const stateLabel =
      selectedStates.size === ALL_STATES.length ? "All States" : Array.from(selectedStates).join(", ");
    const hostOrgLabel =
      selectedHostOrgs.size === hostOrgOptions.length
        ? "All Host Organizations"
        : Array.from(selectedHostOrgs).join(", ");
    const districtLabel =
      selectedDistricts.size === districtOptions.length
        ? "All Districts"
        : Array.from(selectedDistricts).join(", ");
    const kvkLabel =
      selectedKvks.size === kvkOptions.length ? "All KVKs" : Array.from(selectedKvks).join(", ");

    const query = new URLSearchParams({
      type: "admin",
      zone,
      state: stateLabel,
      hostOrg: hostOrgLabel,
      district: districtLabel,
      kvk: kvkLabel,
      form: selectedFormLabel,
      from: fromDate,
      to: toDate,
    });
    router.push(`/reports/preview?${query.toString()}`);
  }

  function resetFilters() {
    setZone(REPORT_ZONE_OPTIONS[0]);
    setSelectedStates(new Set(ALL_STATES));
    setSelectedHostOrgs(new Set(ALL_HOST_ORGS));
    setSelectedDistricts(new Set(ALL_HOST_ORG_DISTRICTS));
    setSelectedKvks(new Set(kvksForHostOrgsAndDistricts(ALL_HOST_ORGS, ALL_HOST_ORG_DISTRICTS)));
    setSelectedForms(new Set(ALL_FORM_PATHS));
    setFromDate(firstOfYear());
    setToDate(today());
    setQuickSelect("this-year");
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
            <SimpleSelect
              value={zone}
              onValueChange={onZoneChange}
              options={REPORT_ZONE_OPTIONS.map((z) => ({ value: z, label: z }))}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              State
            </label>
            <div className="mt-1">
              <MultiSelectChecklist
                options={ALL_STATES}
                selected={selectedStates}
                onChange={onStatesChange}
                icon={MapPin}
                allLabel="All States"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Host Organisation
            </label>
            <div className="mt-1">
              <MultiSelectChecklist
                options={hostOrgOptions}
                selected={selectedHostOrgs}
                onChange={onHostOrgsChange}
                icon={Building2}
                allLabel="All Host Organizations"
                disabled={selectedStates.size === 0}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              District
            </label>
            <div className="mt-1">
              <MultiSelectChecklist
                options={districtOptions}
                selected={selectedDistricts}
                onChange={onDistrictsChange}
                icon={LandPlot}
                allLabel="All Districts"
                disabled={selectedHostOrgs.size === 0}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              KVK
            </label>
            <SelectOrgKvksDropdown
              kvks={kvkOptions}
              selected={selectedKvks}
              onChange={setSelectedKvks}
              disabled={selectedDistricts.size === 0}
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
