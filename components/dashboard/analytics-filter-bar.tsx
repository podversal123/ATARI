import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export type AnalyticsFilters = {
  year: string;
  state: string;
  district: string;
  kvk: string;
  groupBy: string;
};

export const EMPTY_ANALYTICS_FILTERS: AnalyticsFilters = {
  year: "All",
  state: "All",
  district: "All",
  kvk: "All",
  groupBy: "",
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
};

/**
 * Filter row for the OFT/FLD/Training/Extension "detailed analytics" pages.
 * Year/State/District/KVK/Group By are real and wired (2026-08-27) - each
 * re-fetches /api/dashboard-stats with the matching query param, same
 * pattern as the main Dashboard's own Year/KVK filter. Zone and Institute
 * show real data (a Super Admin session only ever has one real zone; the
 * Institute list is real master data) but can't actually filter - Zone
 * because the whole page is already scoped to that one zone, Institute
 * because nothing in the schema links a Kvk to an Institute row (confirmed:
 * no `kvks` back-reference, no `instituteId` on Kvk). Breakdown has only
 * one real value (Status) - Training/Extension Activity have no status
 * column at all, so there's nothing else to break down by.
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
}: AnalyticsFilterBarProps) {
  function set<K extends keyof AnalyticsFilters>(key: K, value: string) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        <div>
          <label className="text-[11px] font-semibold tracking-wide text-primary uppercase">Year</label>
          <select
            value={filters.year}
            onChange={(e) => set("year", e.target.value)}
            className="mt-1 h-8 w-full rounded-md border border-border bg-card px-2 text-sm text-foreground outline-none focus-visible:border-ring"
          >
            <option>All</option>
            {years.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
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
          <select
            value={filters.state}
            onChange={(e) => set("state", e.target.value)}
            className="mt-1 h-8 w-full rounded-md border border-border bg-card px-2 text-sm text-foreground outline-none focus-visible:border-ring"
          >
            <option>All</option>
            {states.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-semibold tracking-wide text-primary uppercase">District</label>
          <select
            value={filters.district}
            onChange={(e) => set("district", e.target.value)}
            className="mt-1 h-8 w-full rounded-md border border-border bg-card px-2 text-sm text-foreground outline-none focus-visible:border-ring"
          >
            <option>All</option>
            {districts.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-semibold tracking-wide text-primary uppercase">Institute</label>
          <select
            disabled
            value="All"
            title="Real master list, but no KVK in this system is linked to an Institute record, so it can't filter these numbers."
            className="mt-1 h-8 w-full rounded-md border border-border bg-card px-2 text-sm text-foreground outline-none disabled:opacity-70"
          >
            <option>All</option>
            {institutes.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-semibold tracking-wide text-primary uppercase">KVK</label>
          <select
            value={filters.kvk}
            onChange={(e) => set("kvk", e.target.value)}
            className="mt-1 h-8 w-full rounded-md border border-border bg-card px-2 text-sm text-foreground outline-none focus-visible:border-ring"
          >
            <option>All</option>
            {kvks.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
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
            <option value="kvk">KVK</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] font-semibold tracking-wide text-primary uppercase">Breakdown</label>
          <select
            disabled
            value="Status"
            className="mt-1 h-8 w-full rounded-md border border-border bg-card px-2 text-sm text-foreground outline-none disabled:opacity-70"
          >
            <option>Status</option>
          </select>
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
