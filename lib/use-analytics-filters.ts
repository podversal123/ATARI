"use client";

import { useEffect, useState } from "react";
import { EMPTY_ANALYTICS_FILTERS, type AnalyticsFilters } from "@/components/dashboard/analytics-filter-bar";

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
 * uses (2026-08-27).
 */
export function useAnalyticsFilters(scope: "oft" | "fld" | "training" | "extension") {
  const [filters, setFilters] = useState<AnalyticsFilters>(EMPTY_ANALYTICS_FILTERS);
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ scope });
    if (filters.year !== "All") params.set("year", filters.year);
    if (filters.state !== "All") params.set("state", filters.state);
    if (filters.district !== "All") params.set("district", filters.district);
    if (filters.institute !== "All") params.set("institute", filters.institute);
    if (filters.kvk !== "All") params.set("kvk", filters.kvk);
    if (filters.groupBy) params.set("groupBy", filters.groupBy);

    fetch(`/api/dashboard-stats?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json) setData(json as AnalyticsData);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [scope, filters.year, filters.state, filters.district, filters.institute, filters.kvk, filters.groupBy]);

  return { filters, setFilters, data };
}
