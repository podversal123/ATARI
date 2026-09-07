/**
 * Every KVK is run by a host organization, and the Institute Master
 * (ICAR / CAU / SAU / NGO) is the standard ICAR taxonomy for what *kind*
 * of body that host organization is. The link was added to the Kvk model
 * later (Kvk.instituteId, 2026-08-27) but never backfilled for the 66
 * KVKs seeded before it, so "Group by Institute" and the Institute filter
 * on the dashboard analytics pages had every KVK falling into a single
 * "Not set" bucket.
 *
 * The classification is deterministic from the host organization's own
 * registered name, not a guess:
 *   - "ICAR-..." institutes                    -> ICAR
 *   - a Central Agricultural University         -> CAU  (DRPCAU, Pusa)
 *   - a State/Central Agricultural University
 *     or Animal Sciences University             -> SAU  (BAU Sabour, BAU Ranchi, BASU)
 *   - registered societies, trusts, missions,
 *     mandals, seva kendras, self-hosted KVKs   -> NGO  (the residual)
 *
 * Host organizations are written in short form in the KVK Master ("BAU
 * Ranchi", "DRPCAU"), so the abbreviations are matched explicitly rather
 * than relying on the expanded name being present.
 */
export type InstituteCategory = "ICAR" | "CAU" | "SAU" | "NGO";

export const INSTITUTE_CATEGORIES: InstituteCategory[] = ["ICAR", "CAU", "SAU", "NGO"];

export function classifyHostOrgToInstitute(hostOrgName: string): InstituteCategory {
  const name = hostOrgName.toLowerCase();

  if (name.includes("icar")) return "ICAR";

  // DRPCAU = Dr. Rajendra Prasad Central Agricultural University, Pusa.
  if (name.includes("central agricultural university") || /\bdrpcau\b/.test(name)) return "CAU";

  // BAU = Bihar Agricultural University (Sabour) / Birsa Agricultural
  // University (Ranchi); BASU = Bihar Animal Sciences University.
  if (
    name.includes("agricultural university") ||
    name.includes("animal sciences university") ||
    /\bbau\b/.test(name) ||
    /\bbasu\b/.test(name)
  ) {
    return "SAU";
  }

  return "NGO";
}
