import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MultiFilterSelect } from "@/components/dashboard/multi-filter-select";

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

type AnalyticsFilterBarProps = {
  filters: AnalyticsFilters;
  onChange: (filters: AnalyticsFilters) => void;
  years: number[];
  zoneName: string | null;
  states: string[];
  districts: string[];
  kvks: string[];
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
  kvks,
  institutes,
  hasStatus = false,
}: AnalyticsFilterBarProps) {
  function set<K extends keyof AnalyticsFilters>(key: K, value: string) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
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
        <div>
          <label className="text-[11px] font-semibold tracking-wide text-primary uppercase">Zone</label>
          <select
            disabled
            value="All"
            title="This account only manages one zone - already applied to every card below."
            className="mt-1 h-8 w-full rounded-md border border-border bg-card px-2 text-sm text-foreground outline-none disabled:opacity-70"
          >
            <option>All</option>
            {zoneName && <option>{zoneName}</option>}
          </select>
        </div>
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
        <div>
          <label className="text-[11px] font-semibold tracking-wide text-primary uppercase">KVK</label>
          <MultiFilterSelect
            label="KVK"
            hideLabel
            options={kvks}
            selected={toSet(filters.kvk)}
            onChange={(next) => set("kvk", fromSet(next))}
            className="mt-1"
            triggerClassName="w-full"
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold tracking-wide text-primary uppercase">Group By</label>
          <select
            value={filters.groupBy}
            onChange={(e) => set("groupBy", e.target.value)}
            className="mt-1 h-8 w-full rounded-md border border-border bg-card px-2 text-sm text-foreground outline-none focus-visible:border-ring"
          >
            <option value="">Select</option>
            <option value="zone">Zone</option>
            <option value="state">State</option>
            <option value="district">District</option>
            <option value="institute">Institute</option>
            <option value="kvk">KVK</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] font-semibold tracking-wide text-primary uppercase">Breakdown</label>
          {hasStatus ? (
            <select
              value={filters.breakdown}
              onChange={(e) => set("breakdown", e.target.value)}
              className="mt-1 h-8 w-full rounded-md border border-border bg-card px-2 text-sm text-foreground outline-none focus-visible:border-ring"
            >
              <option value="">Status (All)</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="notStarted">Not Started</option>
            </select>
          ) : (
            <select
              disabled
              value="Status"
              className="mt-1 h-8 w-full rounded-md border border-border bg-card px-2 text-sm text-foreground outline-none disabled:opacity-70"
            >
              <option>Status</option>
            </select>
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
