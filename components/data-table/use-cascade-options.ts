"use client";

import { useEffect, useState } from "react";

/**
 * Cached fetch of one All Masters leaf's real saved rows via
 * /api/master-options?slug=<leaf> - shared by every live Zone/State/
 * District/Institute/Host Org picker in the app (this hook, and
 * MasterFormFields' own `sourceMaster` fields) so a form never re-fetches
 * the same master twice in one session. Not zone-scoped in the cache key
 * since the API itself already scopes rows to the caller's own zone.
 */
const masterOptionsCache = new Map<string, Promise<Record<string, string>[]>>();

export function fetchMasterOptions(slug: string): Promise<Record<string, string>[]> {
  let cached = masterOptionsCache.get(slug);
  if (!cached) {
    cached = fetch(`/api/master-options?slug=${encodeURIComponent(slug)}`)
      .then((res) => (res.ok ? res.json() : { rows: [] }))
      .then((data) => (data.rows ?? []) as Record<string, string>[])
      .catch(() => []);
    masterOptionsCache.set(slug, cached);
  }
  return cached;
}

/**
 * Live Zone->State->District->Host Organisation->Institute cascade, backed
 * by the real saved Zone/State/District/Institute/KVK Master rows -
 * replaces the old lib/reports.ts helpers, which read a hardcoded
 * lib/masters.ts snapshot instead of the database (real bug, 2026-09-03:
 * adding/editing a Zone, State, District, Institute, or KVK's Host Org
 * anywhere in the app never showed up in these dropdowns, since they
 * weren't reading the same rows the rest of the app writes to). Host
 * Organisations aren't their own state-scoped field on the
 * HostOrganization row itself - "which host orgs exist under a state" is
 * derived from the real KVK Master rows already linking hostOrg to state,
 * same derivation lib/reports.ts's own `hostOrgsForState` used, just off
 * live rows now.
 */
export function useCascadeOptions(enabled: boolean) {
  const [zoneRows, setZoneRows] = useState<Record<string, string>[]>([]);
  const [stateRows, setStateRows] = useState<Record<string, string>[]>([]);
  const [districtRows, setDistrictRows] = useState<Record<string, string>[]>([]);
  const [kvkRows, setKvkRows] = useState<Record<string, string>[]>([]);
  const [instituteRows, setInstituteRows] = useState<Record<string, string>[]>([]);
  const [hostOrgRows, setHostOrgRows] = useState<Record<string, string>[]>([]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    Promise.all([
      fetchMasterOptions("zone-master"),
      fetchMasterOptions("state-master"),
      fetchMasterOptions("district-master"),
      fetchMasterOptions("kvk-master"),
      fetchMasterOptions("institute-master"),
      fetchMasterOptions("host-master"),
    ]).then(([zones, states, districts, kvks, institutes, hostOrgs]) => {
      if (cancelled) return;
      setZoneRows(zones);
      setStateRows(states);
      setDistrictRows(districts);
      setKvkRows(kvks);
      setInstituteRows(institutes);
      setHostOrgRows(hostOrgs);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return {
    zoneOptions: zoneRows.map((r) => r.zoneName),
    instituteOptions: instituteRows.map((r) => r.instituteName),
    /** Full Host Master rows (name, phone, mobile, fax, email, address) - for auto-populating a host's own contact details once picked, not just the name list `hostOrgsForState` returns. */
    hostOrgDetails: hostOrgRows,
    statesForZone: (zoneName: string) =>
      stateRows.filter((r) => r.zoneName === zoneName).map((r) => r.stateName),
    districtsForState: (stateName: string) =>
      districtRows.filter((r) => r.stateName === stateName).map((r) => r.districtName),
    hostOrgsForState: (stateName: string) =>
      Array.from(new Set(kvkRows.filter((r) => r.stateName === stateName).map((r) => r.hostOrg))),
  };
}
