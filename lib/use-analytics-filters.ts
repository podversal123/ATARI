"use client";

import { useCallback, useEffect, useState } from "react";
import { EMPTY_ANALYTICS_FILTERS, type AnalyticsFilters } from "@/components/dashboard/analytics-filter-bar";
import { usePolling } from "@/lib/use-polling";

/** Shape every `/api/dashboard-stats?scope=...` response shares, regardless of which section it's scoped to. */
export type AnalyticsData = {
  years: number[];
  kvkOptions: { id: string; name: string }[];
  zoneName: string | null;
  stateOptions: string[];
  districtOptions: string[];
  instituteOptions: string[];
  [key: string]: unknown;
};

/**
 * Shared filter-state + fetch logic for the 4 "detailed analytics" pages
 * (OFT/FLD/Training/Extension) - each re-fetches `/api/dashboard-stats`
 * whenever Year/State/District/KVK/Group By changes, same real
 * query-param pattern the main Dashboard's own Year/KVK filter already
 * uses (2026-08-27). Also polls every ~20s (like the main Dashboard) so a
 * KVK's real changes show up without a manual reload; the chart's own
 * pagination is keyed on the row ids, not the array identity, so an
 * unchanged poll result never yanks a browsing user back to page 1.
 */
export function useAnalyticsFilters(scope: "oft" | "fld" | "training" | "extension") {
  const [filters, setFilters] = useState<AnalyticsFilters>(EMPTY_ANALYTICS_FILTERS);
  const [data, setData] = useState<AnalyticsData | null>(null);

  const load = useCallback(() => {
    let cancelled = false;
    const params = new URLSearchParams({ scope });
    if (filters.year !== "All") params.set("year", filters.year);
    if (filters.state !== "All") params.set("state", filters.state);
    if (filters.district !== "All") params.set("district", filters.district);
    if (filters.institute !== "All") params.set("institute", filters.institute);
    if (filters.kvk !== "All") params.set("kvk", filters.kvk);
    if (filters.groupBy) params.set("groupBy", filters.groupBy);
    if (filters.breakdown) params.set("breakdown", filters.breakdown);

    fetch(`/api/dashboard-stats?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json) setData(json as AnalyticsData);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [
    scope,
    filters.year,
    filters.state,
    filters.district,
    filters.institute,
    filters.kvk,
    filters.groupBy,
    filters.breakdown,
  ]);

  useEffect(() => load(), [load]);
  usePolling(load);

  return { filters, setFilters, data };
}
