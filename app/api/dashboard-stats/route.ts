import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

/**
 * Real counts for the Dashboard's stat cards and progress-chart summaries.
 * Training/Extension Activity have no status column anywhere in the schema
 * (confirmed against schema.prisma), so their progress cards only ever get
 * a total + "KVKs with entries" breakdown, not an ongoing/completed split -
 * OFT and FLD do carry a real TrialStatus, so those get the full split.
 *
 * Every scalar total/count/kvksWithEntries below is DERIVED from the same
 * five groupBy queries the chart rows already need - it used to also run a
 * separate count()/count(status)/findMany(distinct) per metric (23 queries
 * total). Each Prisma call here is a real network round trip to Neon, so
 * cutting 23 down to 8 is a real latency win independent of anything about
 * function region - don't reintroduce the separate count queries.
 *
 * `?scope=oft|fld|training|extension` (used by the 4 dashboard analytics
 * detail pages, which each only ever read one of these) skips every query
 * the other sections would need - those pages were paying for all ~10
 * queries (main Dashboard's full payload) just to read one section's worth
 * of fields. No `scope` = unchanged full payload, still used by the main
 * Dashboard page itself.
 */
export async function GET(request: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const scopeParam = url.searchParams.get("scope");
  const needs = (key: "oft" | "fld" | "training" | "extension") => !scopeParam || scopeParam === key;

  const isKvkAdmin = auth.session.role === "KVK_ADMIN";
  const kvkId = isKvkAdmin ? auth.session.kvkId ?? undefined : undefined;

  /** Super Admin's own Year/State/District/KVK filter dropdowns - real query params now instead of the always-"All" placeholder they used to be. A KVK Admin is already scoped to their own KVK, so none of these apply to them. Dropdowns show names (not internal ids), so each resolves the selected name back to an id via the real State/District/Kvk tables - no guessed slugs. */
  const yearParam = url.searchParams.get("year");
  const reportingYear = yearParam && yearParam !== "All" ? Number(yearParam) : undefined;
  const kvkParam = !isKvkAdmin ? url.searchParams.get("kvk") : null;
  const stateParam = !isKvkAdmin ? url.searchParams.get("state") : null;
  const districtParam = !isKvkAdmin ? url.searchParams.get("district") : null;
  /** Real now (2026-08-27) - Kvk.instituteId was added (client request) after the real "Create KVK" reference form turned out to already have a required Institute field that was never wired to the backend. Existing KVKs seeded before that stay instituteless until edited. */
  const instituteParam = !isKvkAdmin ? url.searchParams.get("institute") : null;
  /** "Group By" on the analytics detail pages - re-buckets the same per-KVK counts by a different real dimension (Zone/State/District/Institute/KVK) instead of a new query per dimension. */
  const groupByParam = url.searchParams.get("groupBy");
  const groupBy: "zone" | "state" | "district" | "institute" | "kvk" =
    groupByParam === "zone" || groupByParam === "state" || groupByParam === "district" || groupByParam === "institute"
      ? groupByParam
      : "kvk";

  const [filterKvk, filterState, filterDistrict, filterInstitute] = await Promise.all([
    kvkParam && kvkParam !== "All"
      ? prisma.kvk.findFirst({ where: { zoneId: auth.session.zoneId, name: kvkParam }, select: { id: true } })
      : Promise.resolve(null),
    stateParam && stateParam !== "All"
      ? prisma.state.findFirst({ where: { zoneId: auth.session.zoneId, name: stateParam }, select: { id: true } })
      : Promise.resolve(null),
    districtParam && districtParam !== "All"
      ? prisma.district.findFirst({ where: { zoneId: auth.session.zoneId, name: districtParam }, select: { id: true } })
      : Promise.resolve(null),
    instituteParam && instituteParam !== "All"
      ? prisma.institute.findFirst({ where: { zoneId: auth.session.zoneId, name: instituteParam }, select: { id: true } })
      : Promise.resolve(null),
  ]);
  const filterKvkId = filterKvk?.id;

  /** Kvk-relation filter shared by every model below - flat `kvkId` when a KVK Admin or a specific KVK is picked (fastest, no join), otherwise a `kvk: {...}` relation filter once State/District/Institute narrows things, otherwise just the zone. */
  const kvkWhere: Record<string, unknown> =
    kvkId || filterKvkId
      ? { kvkId: kvkId ?? filterKvkId }
      : filterState || filterDistrict || filterInstitute
        ? {
            kvk: {
              zoneId: auth.session.zoneId,
              ...(filterState ? { stateId: filterState.id } : {}),
              ...(filterDistrict ? { districtId: filterDistrict.id } : {}),
              ...(filterInstitute ? { instituteId: filterInstitute.id } : {}),
            },
          }
        : { zoneId: auth.session.zoneId };

  const baseScope = kvkWhere;
  const scope = reportingYear ? { ...baseScope, reportingYear } : baseScope;
  /** FldDemonstrationDetail carries its own `zoneId` directly but no `kvkId`/`stateId`/`districtId`/`instituteId` of its own - only reachable through the parent `fld` relation. Zone-only case keeps the original flat-`zoneId` fast path; any KVK-level filter (KVK/State/District/Institute) routes through `fld` instead. */
  const fldDemoScope = kvkId || filterKvkId || filterState || filterDistrict || filterInstitute
    ? {
        fld: {
          ...(kvkId || filterKvkId
            ? { kvkId: kvkId ?? filterKvkId }
            : {
                kvk: {
                  zoneId: auth.session.zoneId,
                  ...(filterState ? { stateId: filterState.id } : {}),
                  ...(filterDistrict ? { districtId: filterDistrict.id } : {}),
                  ...(filterInstitute ? { instituteId: filterInstitute.id } : {}),
                },
              }),
          ...(reportingYear ? { reportingYear } : {}),
        },
      }
    : { zoneId: auth.session.zoneId, ...(reportingYear ? { fld: { reportingYear } } : {}) };
  /** `kvks` (row-building, narrowed by every active filter including the selected KVK) vs `kvkOptions` (the KVK dropdown's own option list - narrowed by State/District/Institute so picking Bihar only lists Bihar's KVKs, but never by the currently-selected KVK itself, otherwise picking one KVK would hide every other KVK from the dropdown). */
  const kvkListWhere = {
    ...(kvkId ? { id: kvkId } : filterKvkId ? { id: filterKvkId } : { zoneId: auth.session.zoneId }),
    ...(filterState ? { stateId: filterState.id } : {}),
    ...(filterDistrict ? { districtId: filterDistrict.id } : {}),
    ...(filterInstitute ? { instituteId: filterInstitute.id } : {}),
  };
  const kvkOptionsWhere = {
    ...(kvkId ? { id: kvkId } : { zoneId: auth.session.zoneId }),
    ...(filterState ? { stateId: filterState.id } : {}),
    ...(filterDistrict ? { districtId: filterDistrict.id } : {}),
    ...(filterInstitute ? { instituteId: filterInstitute.id } : {}),
  };

  const [
    kvks,
    kvkOptions,
    totalKvks,
    oftByKvkStatus,
    fldByKvkStatus,
    trainingByKvk,
    extensionByKvk,
    otherExtensionByKvk,
    staffByRoleGroups,
    oftAgg,
    fldDemoAgg,
    oftYears,
    fldYears,
    trainingYears,
    extensionYears,
    zone,
    states,
    districts,
    institutes,
  ] = await Promise.all([
    prisma.kvk.findMany({
      where: kvkListWhere,
      select: {
        id: true,
        name: true,
        zoneId: true,
        stateId: true,
        districtId: true,
        instituteId: true,
        zone: { select: { name: true } },
        state: { select: { name: true } },
        district: { select: { name: true } },
        institute: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    }),
    /** The KVK dropdown's own option list - every KVK in the zone (narrowed by State/District, never by the currently-selected KVK itself, otherwise picking a KVK would make every other KVK disappear from the dropdown). Also used by the `?scope=` analytics detail pages' own KVK filter, so this always runs regardless of scope. */
    prisma.kvk.findMany({
      where: kvkOptionsWhere,
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    scopeParam ? Promise.resolve(0) : prisma.kvk.count({ where: { zoneId: auth.session.zoneId } }),
    needs("oft") ? prisma.oft.groupBy({ by: ["kvkId", "status"], where: scope, _count: { _all: true } }) : Promise.resolve([]),
    needs("fld") ? prisma.fld.groupBy({ by: ["kvkId", "status"], where: scope, _count: { _all: true } }) : Promise.resolve([]),
    needs("training") ? prisma.training.groupBy({ by: ["kvkId"], where: scope, _count: { _all: true } }) : Promise.resolve([]),
    needs("extension") ? prisma.extensionActivity.groupBy({ by: ["kvkId"], where: scope, _count: { _all: true } }) : Promise.resolve([]),
    needs("extension") ? prisma.otherExtensionActivity.groupBy({ by: ["kvkId"], where: scope, _count: { _all: true } }) : Promise.resolve([]),
    scopeParam
      ? Promise.resolve([])
      : prisma.staff.groupBy({
          by: ["sanctionedPost"],
          where: kvkId ?? filterKvkId ? { kvkId: kvkId ?? filterKvkId } : { zoneId: auth.session.zoneId },
          _count: { _all: true },
        }),
    /** Real per-OFT fields (not just the ongoing/completed status split) for the "OFT - detailed analytics" page's Cost/Quantity/Replications stat cards. */
    needs("oft")
      ? prisma.oft.aggregate({
          where: scope,
          _sum: {
            quantity: true,
            costOfOft: true,
            noOfTrialReplicationFarmer: true,
            generalMale: true,
            generalFemale: true,
            obcMale: true,
            obcFemale: true,
            scMale: true,
            scFemale: true,
            stMale: true,
            stFemale: true,
          },
        })
      : Promise.resolve({
          _sum: {
            quantity: null,
            costOfOft: null,
            noOfTrialReplicationFarmer: null,
            generalMale: null,
            generalFemale: null,
            obcMale: null,
            obcFemale: null,
            scMale: null,
            scFemale: null,
            stMale: null,
            stFemale: null,
          },
        }),
    /** FLD's own model has no quantity/farmer/demonstration fields - those live on the child FldDemonstrationDetail rows, scoped via the parent FLD's kvkId since the child itself only carries zoneId. */
    needs("fld")
      ? prisma.fldDemonstrationDetail.aggregate({ where: fldDemoScope, _sum: { noOfDemonstrations: true, noOfFarmers: true } })
      : Promise.resolve({ _sum: { noOfDemonstrations: null, noOfFarmers: null } }),
    /**
     * Real distinct reporting years for the Year filter dropdown - merged
     * across the 4 models that carry one, rather than guessing a static
     * range. Unscoped by year/kvk (the dropdown itself must list every
     * year regardless of what's currently selected). This used to skip
     * entirely for `?scope=` requests (the 4 analytics detail pages) -
     * real bug, since those pages' own Year dropdown needs exactly this
     * and was showing only "All" as a result.
     */
    prisma.oft.findMany({ where: { zoneId: auth.session.zoneId }, select: { reportingYear: true }, distinct: ["reportingYear"] }),
    prisma.fld.findMany({ where: { zoneId: auth.session.zoneId }, select: { reportingYear: true }, distinct: ["reportingYear"] }),
    prisma.training.findMany({ where: { zoneId: auth.session.zoneId }, select: { reportingYear: true }, distinct: ["reportingYear"] }),
    prisma.extensionActivity.findMany({ where: { zoneId: auth.session.zoneId }, select: { reportingYear: true }, distinct: ["reportingYear"] }),
    /** Real Zone/State/District/Institute option lists for the analytics detail pages' filter bar - all scoped to the Super Admin's own zone (a session only ever belongs to one zone). Institute has no relation to Kvk anywhere in the schema, so its list is real but can't filter/group KVK-derived data (see the `groupBy` comment above). */
    prisma.zone.findUnique({ where: { id: auth.session.zoneId }, select: { name: true } }),
    prisma.state.findMany({ where: { zoneId: auth.session.zoneId }, select: { name: true }, orderBy: { name: "asc" } }),
    prisma.district.findMany({ where: { zoneId: auth.session.zoneId }, select: { name: true }, orderBy: { name: "asc" } }),
    prisma.institute.findMany({ where: { zoneId: auth.session.zoneId }, select: { name: true }, orderBy: { name: "asc" } }),
  ]);

  const years = Array.from(
    new Set([...oftYears, ...fldYears, ...trainingYears, ...extensionYears].map((r) => r.reportingYear)),
  ).sort((a, b) => b - a);

  const staffByRole = Object.fromEntries(
    staffByRoleGroups.map((g) => [g.sanctionedPost, g._count._all]),
  );
  const staffTotal = staffByRoleGroups.reduce((sum, g) => sum + g._count._all, 0);

  /** Ongoing/completed/total/kvksWithEntries, all read off one status-split groupBy result. */
  function statusSummary(groups: { kvkId: string; status: string; _count: { _all: number } }[]) {
    let ongoing = 0;
    let completed = 0;
    const kvkSet = new Set<string>();
    for (const g of groups) {
      if (g.status === "ONGOING") ongoing += g._count._all;
      else completed += g._count._all;
      kvkSet.add(g.kvkId);
    }
    return { total: ongoing + completed, ongoing, completed, kvksWithEntries: kvkSet.size };
  }

  /** Real dimension key/label for a KVK under the current "Group By" - Zone/State/District/Institute bucket several KVKs into one row; the default keeps one row per KVK. A KVK without an Institute set (most existing ones, seeded before this link existed) buckets under "Not set" rather than being silently dropped from the chart. */
  function dimension(k: (typeof kvks)[number]) {
    if (groupBy === "zone") return { id: k.zoneId, label: k.zone.name };
    if (groupBy === "state") return { id: k.stateId, label: k.state.name };
    if (groupBy === "district") return { id: k.districtId, label: k.district.name };
    if (groupBy === "institute") return { id: k.instituteId ?? "none", label: k.institute?.name ?? "Not set" };
    return { id: k.id, label: k.name };
  }

  /**
   * One row per KVK in scope (even KVKs with zero entries), sorted
   * busiest-first for the Bar/List/Area chart views, then re-bucketed by
   * the current Group By dimension. TrialStatus has a real third value
   * (TRANSFERRED, folded into "completed" the same way statusSummary above
   * does) - this must accumulate (+=) rather than assign (=), since a KVK
   * can have both a COMPLETED and a TRANSFERRED group and an assignment
   * would silently drop whichever is processed first (a real bug found
   * live: a KVK with COMPLETED=2 and TRANSFERRED=3 was showing
   * "completed: 3", not the real 5).
   */
  function buildStatusRows(groups: { kvkId: string; status: string; _count: { _all: number } }[]) {
    const byKvk = new Map<string, { ongoing: number; completed: number }>();
    for (const g of groups) {
      const row = byKvk.get(g.kvkId) ?? { ongoing: 0, completed: 0 };
      if (g.status === "ONGOING") row.ongoing += g._count._all;
      else row.completed += g._count._all;
      byKvk.set(g.kvkId, row);
    }
    const byDimension = new Map<string, { id: string; label: string; ongoing: number; completed: number }>();
    for (const k of kvks) {
      const dim = dimension(k);
      const counts = byKvk.get(k.id) ?? { ongoing: 0, completed: 0 };
      const row = byDimension.get(dim.id) ?? { id: dim.id, label: dim.label, ongoing: 0, completed: 0 };
      row.ongoing += counts.ongoing;
      row.completed += counts.completed;
      byDimension.set(dim.id, row);
    }
    return Array.from(byDimension.values()).sort((a, b) => b.ongoing + b.completed - (a.ongoing + a.completed));
  }

  function toCountMap(groups: { kvkId: string; _count: { _all: number } }[]) {
    return new Map(groups.map((g) => [g.kvkId, g._count._all]));
  }

  function buildTotalRows(...maps: Map<string, number>[]) {
    const combined = new Map<string, number>();
    for (const m of maps) for (const [id, count] of m) combined.set(id, (combined.get(id) ?? 0) + count);
    const byDimension = new Map<string, { id: string; label: string; total: number }>();
    for (const k of kvks) {
      const dim = dimension(k);
      const row = byDimension.get(dim.id) ?? { id: dim.id, label: dim.label, total: 0 };
      row.total += combined.get(k.id) ?? 0;
      byDimension.set(dim.id, row);
    }
    return Array.from(byDimension.values()).sort((a, b) => b.total - a.total);
  }

  /** Total entries + distinct-KVK count read off a plain groupBy(["kvkId"]) result, optionally merged with a second one (Extension = extensionActivity + otherExtensionActivity combined). */
  function countSummary(...groupsList: { kvkId: string; _count: { _all: number } }[][]) {
    let total = 0;
    const kvkSet = new Set<string>();
    for (const groups of groupsList) {
      for (const g of groups) {
        total += g._count._all;
        kvkSet.add(g.kvkId);
      }
    }
    return { total, kvksWithEntries: kvkSet.size };
  }

  const oft = statusSummary(oftByKvkStatus);
  const fld = statusSummary(fldByKvkStatus);
  const training = countSummary(trainingByKvk);
  const extension = countSummary(extensionByKvk, otherExtensionByKvk);

  return NextResponse.json({
    totalKvks,
    years,
    kvkOptions,
    zoneName: zone?.name ?? null,
    stateOptions: states.map((s) => s.name),
    districtOptions: districts.map((d) => d.name),
    instituteOptions: institutes.map((i) => i.name),
    oft: {
      ...oft,
      quantity: Number(oftAgg._sum.quantity ?? 0),
      cost: Number(oftAgg._sum.costOfOft ?? 0),
      replications: oftAgg._sum.noOfTrialReplicationFarmer ?? 0,
      /** Real "Farmers Details" breakdown (General/OBC/SC/ST x M/F) summed - the field the "OFT - detailed analytics" page's Farmers Covered card was missing before those columns existed on Oft. */
      farmersCovered:
        (oftAgg._sum.generalMale ?? 0) +
        (oftAgg._sum.generalFemale ?? 0) +
        (oftAgg._sum.obcMale ?? 0) +
        (oftAgg._sum.obcFemale ?? 0) +
        (oftAgg._sum.scMale ?? 0) +
        (oftAgg._sum.scFemale ?? 0) +
        (oftAgg._sum.stMale ?? 0) +
        (oftAgg._sum.stFemale ?? 0),
    },
    fld: {
      ...fld,
      demonstrations: fldDemoAgg._sum.noOfDemonstrations ?? 0,
      farmersCovered: fldDemoAgg._sum.noOfFarmers ?? 0,
    },
    training,
    extension,
    staff: { total: staffTotal },
    staffByRole,
    charts: {
      oft: buildStatusRows(oftByKvkStatus),
      fld: buildStatusRows(fldByKvkStatus),
      training: buildTotalRows(toCountMap(trainingByKvk)),
      extension: buildTotalRows(toCountMap(extensionByKvk), toCountMap(otherExtensionByKvk)),
    },
  });
}
