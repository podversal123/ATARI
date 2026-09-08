"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SimpleSelect } from "@/components/ui/simple-select";
import { MultiFilterSelect } from "@/components/dashboard/multi-filter-select";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

/** A disabled, read-only filter field - what Zone always is, and what State / District / Institute / KVK become for a KVK Admin (their session already fixes all of them). */
function LockedField({ label, value, title }: { label: string; value: string; title: string }) {
  return (
    <div>
      <label className="text-[11px] font-semibold tracking-wide text-primary uppercase">{label}</label>
      <div
        title={title}
        className="mt-1 flex h-8 w-full cursor-not-allowed items-center truncate rounded-md border border-border bg-muted/40 px-2 text-sm text-muted-foreground"
      >
        {value}
      </div>
    </div>
  );
}

export type AnalyticsFilters = {
  /** Comma-joined when multiple values are picked ("All" = nothing selected) - same convention the checkbox multi-selects below use. */
  year: string;
  state: string;
  district: string;
  institute: string;
  kvk: string;
  groupBy: string;
  breakdown: string;
};

/** "All"/"" <-> Set<string>, at the boundary between this component's comma-joined filter strings and MultiFilterSelect's own Set-based selection. */
function toSet(value: string): Set<string> {
  return value === "All" || value === "" ? new Set() : new Set(value.split(","));
}
function fromSet(next: Set<string>): string {
  return next.size === 0 ? "All" : Array.from(next).join(",");
}

export const EMPTY_ANALYTICS_FILTERS: AnalyticsFilters = {
  year: "All",
  state: "All",
  district: "All",
  institute: "All",
  kvk: "All",
  groupBy: "",
  breakdown: "",
};

/** The real "Group By" dimensions - an empty selection keeps the chart's default one-row-per-KVK view. */
export const GROUP_BY_OPTIONS = [
  { value: "zone", label: "Zone" },
  { value: "state", label: "State" },
  { value: "district", label: "District" },
  { value: "institute", label: "Institute" },
  { value: "kvk", label: "KVK" },
] as const;

/** Chart-title suffix for the current "Group By" - the empty default buckets one row per KVK, so it reads as "by KVK". */
export function chartGroupingLabel(groupBy: string): string {
  return GROUP_BY_OPTIONS.find((o) => o.value === groupBy)?.label ?? "KVK";
}

type KvkOption = { name: string; state: string | null; district: string | null; institute: string | null };

type AnalyticsFilterBarProps = {
  filters: AnalyticsFilters;
  onChange: (filters: AnalyticsFilters) => void;
  years: number[];
  zoneName: string | null;
  states: string[];
  districts: string[];
  /** Each KVK with its State / District / Institute, so picking a KVK auto-selects its parents (data-driven, works for every KVK). */
  kvkOptions: KvkOption[];
  institutes: string[];
  /** OFT/FLD carry a real TrialStatus (Ongoing/Completed/Not started) - Training/Extension Activity have no status column anywhere in the schema, so Breakdown stays a single fixed "Status" value for those. */
  hasStatus?: boolean;
};

/**
 * Filter row for the OFT/FLD/Training/Extension "detailed analytics" pages.
 * Year/State/District/Institute/KVK/Group By are all real and wired
 * (2026-08-27) - each re-fetches /api/dashboard-stats with the matching
 * query param, same pattern as the main Dashboard's own Year/KVK filter.
 * Institute filters/groups via the real Kvk.instituteId link added this
 * session - KVKs seeded before that link existed show up under "Not set"
 * until a Super Admin edits them in KVK Master. Zone stays disabled - a
 * Super Admin session only ever has one real zone, already applied to
 * every card below, so there's nothing a second option could filter to.
 * Breakdown has only one real value (Status) - Training/Extension Activity
 * have no status column at all, so there's nothing else to break down by.
 */
export function AnalyticsFilterBar({
  filters,
  onChange,
  years,
  zoneName,
  states,
  districts,
  kvkOptions,
  institutes,
  hasStatus = false,
}: AnalyticsFilterBarProps) {
  const session = useSession();
  // A KVK Admin session is fixed to one Zone / State / District / Institute /
  // KVK - show all five as locked values (like Zone always was), not filters.
  const isKvkAdmin = session.role === "kvk-admin";
  const kvks = kvkOptions.map((k) => k.name);

  function set<K extends keyof AnalyticsFilters>(key: K, value: string) {
    onChange({ ...filters, [key]: value });
  }

  /**
   * Picking KVK(s) auto-selects their State / District / Institute (the union
   * across every picked KVK), so the chain reads top-down like the Zone does.
   * Clearing the KVK selection leaves the parents where they are.
   */
  function onKvkChange(next: Set<string>) {
    if (next.size === 0) {
      set("kvk", "All");
      return;
    }
    const picked = kvkOptions.filter((k) => next.has(k.name));
    const uniq = (xs: (string | null)[]) => Array.from(new Set(xs.filter((x): x is string => Boolean(x))));
    onChange({
      ...filters,
      kvk: fromSet(next),
      state: fromSet(new Set(uniq(picked.map((k) => k.state)))),
      district: fromSet(new Set(uniq(picked.map((k) => k.district)))),
      institute: fromSet(new Set(uniq(picked.map((k) => k.institute)))),
    });
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {/* A KVK Admin has no "Group By" - every dimension (zone/state/district/institute/kvk) collapses to their one KVK, so the column is dropped and the grid narrows to 7. */}
      <div className={cn("grid grid-cols-2 gap-4 sm:grid-cols-4", isKvkAdmin ? "lg:grid-cols-7" : "lg:grid-cols-8")}>
        <div>
          <label className="text-[11px] font-semibold tracking-wide text-primary uppercase">Year</label>
          <MultiFilterSelect
            label="Year"
            hideLabel
            options={years.map(String)}
            selected={toSet(filters.year)}
            onChange={(next) => set("year", fromSet(next))}
            className="mt-1"
            triggerClassName="w-full"
          />
        </div>
        {/* Not a real `<select>` - a session only ever has one real zone, so showing it directly is more informative than a fake "All" (client report 2026-08-30). */}
        <LockedField
          label="Zone"
          value={zoneName ?? "All"}
          title="This account only manages one zone - already applied to every card below."
        />
        {isKvkAdmin ? (
          <LockedField label="State" value={states[0] ?? "All"} title="Your KVK's state - fixed for this account." />
        ) : (
          <div>
            <label className="text-[11px] font-semibold tracking-wide text-primary uppercase">State</label>
            <MultiFilterSelect
              label="State"
              hideLabel
              options={states}
              selected={toSet(filters.state)}
              onChange={(next) => set("state", fromSet(next))}
              className="mt-1"
              triggerClassName="w-full"
            />
          </div>
        )}
        {isKvkAdmin ? (
          <LockedField label="District" value={districts[0] ?? "All"} title="Your KVK's district - fixed for this account." />
        ) : (
          <div>
            <label className="text-[11px] font-semibold tracking-wide text-primary uppercase">District</label>
            <MultiFilterSelect
              label="District"
              hideLabel
              options={districts}
              selected={toSet(filters.district)}
              onChange={(next) => set("district", fromSet(next))}
              className="mt-1"
              triggerClassName="w-full"
            />
          </div>
        )}
        {isKvkAdmin ? (
          <LockedField label="Institute" value={institutes[0] ?? "Not set"} title="Your KVK's host institute - fixed for this account." />
        ) : (
          <div>
            <label className="text-[11px] font-semibold tracking-wide text-primary uppercase">Institute</label>
            <MultiFilterSelect
              label="Institute"
              hideLabel
              options={institutes}
              selected={toSet(filters.institute)}
              onChange={(next) => set("institute", fromSet(next))}
              className="mt-1"
              triggerClassName="w-full"
            />
          </div>
        )}
        {isKvkAdmin ? (
          <LockedField label="KVK" value={kvks[0] ?? session.kvkName ?? "Your KVK"} title="This account is scoped to one KVK." />
        ) : (
          <div>
            <label className="text-[11px] font-semibold tracking-wide text-primary uppercase">KVK</label>
            <MultiFilterSelect
              label="KVK"
              hideLabel
              options={kvks}
              selected={toSet(filters.kvk)}
              onChange={onKvkChange}
              className="mt-1"
              triggerClassName="w-full"
            />
          </div>
        )}
        {!isKvkAdmin && (
          <div>
            <label className="text-[11px] font-semibold tracking-wide text-primary uppercase">Group By</label>
            <SimpleSelect
              value={filters.groupBy}
              onValueChange={(v) => set("groupBy", v)}
              placeholder="Select"
              options={GROUP_BY_OPTIONS.map((o) => ({ ...o }))}
              className="mt-1 h-8"
            />
          </div>
        )}
        <div>
          <label className="text-[11px] font-semibold tracking-wide text-primary uppercase">Breakdown</label>
          {hasStatus ? (
            <SimpleSelect
              value={filters.breakdown}
              onValueChange={(v) => set("breakdown", v)}
              placeholder="Status (All)"
              options={[
                { value: "ongoing", label: "Ongoing" },
                { value: "completed", label: "Completed" },
                { value: "notStarted", label: "Not Started" },
              ]}
              className="mt-1 h-8"
            />
          ) : (
            <SimpleSelect
              disabled
              value="Status"
              onValueChange={() => {}}
              options={[{ value: "Status", label: "Status" }]}
              className="mt-1 h-8 disabled:opacity-70"
            />
          )}
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <Button variant="outline-primary" size="sm" onClick={() => onChange(EMPTY_ANALYTICS_FILTERS)}>
          <RotateCcw className="size-3.5" />
          Reset filters
        </Button>
      </div>
    </div>
  );
}
