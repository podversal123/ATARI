/**
 * Maps a Form Management leaf (its recordPath = URL slug segments joined by
 * "/") to the big "ATARI AMS REPORT" subsection it feeds. When such a leaf's
 * list page offers a report download, that download produces this
 * subsection's whole subtree - exactly what the Super Admin report shows for
 * that part (e.g. "2.2 On Farm Trial" with its 2.2.A / 2.2.B / 2.2.C tables)
 * - instead of a flat one-table export of just the list's own rows.
 *
 * `nums` are the subsection numbers in the two report trees (Super Admin and
 * the KVK-scoped variant share most numbering; a few section-5 subsections
 * differ, so more than one is listed). `titleIncludes` is an
 * order-independent title match used first, so a rename or a cross-tree
 * numbering drift still resolves. A subsection matches when its title
 * contains `titleIncludes` (case-insensitive) OR its number is in `nums`.
 */
export type ReportSubsectionRef = { nums: string[]; titleIncludes: string; label: string };

const G = (nums: string[], titleIncludes: string, label: string): ReportSubsectionRef => ({ nums, titleIncludes, label });

export const REPORT_SUBSECTION_BY_LEAF: Record<string, ReportSubsectionRef> = {
  // 1. About KVK
  "about-kvk/basic/view-kvks": G(["1.1"], "Basic Information", "Basic Information"),
  "about-kvk/basic/bank-account-details": G(["1.1"], "Basic Information", "Basic Information"),
  "about-kvk/employee/employee-details": G(["1.2"], "Employee Information", "Employee Information"),
  "about-kvk/employee/staff-transferred": G(["1.2"], "Employee Information", "Employee Information"),
  "about-kvk/land-infrastructure/infrastructure-details": G(["1.3"], "Infrastructure Information", "Land & Infrastructure Information"),
  "about-kvk/land-infrastructure/land-details": G(["1.3"], "Infrastructure Information", "Land & Infrastructure Information"),
  "about-kvk/land-infrastructure/staff-quarters": G(["1.3"], "Infrastructure Information", "Land & Infrastructure Information"),
  "about-kvk/vehicles/view-vehicles": G(["1.4"], "Vehicles Information", "Vehicles Information"),
  "about-kvk/vehicles/vehicle-details": G(["1.4"], "Vehicles Information", "Vehicles Information"),
  "about-kvk/equipments/view-equipments": G(["1.5"], "Equipments Information", "Equipments Information"),
  "about-kvk/equipments/equipment-details": G(["1.5"], "Equipments Information", "Equipments Information"),

  // 2. Achievements
  "achievements/technical-achievement": G(["2.1"], "Technical Achievement", "Technical Achievement"),
  "achievements/oft": G(["2.2"], "On Farm Trial", "On Farm Trial"),
  "achievements/front-line-demonstration/view-fld": G(["2.3"], "Front Line Demonstration", "Front Line Demonstration"),
  "achievements/front-line-demonstration/fld-extension-training": G(["2.3"], "Front Line Demonstration", "Front Line Demonstration"),
  "achievements/front-line-demonstration/fld-technical-feedback": G(["2.3"], "Front Line Demonstration", "Front Line Demonstration"),
  "achievements/trainings": G(["2.4"], "Training", "Training"),
  "achievements/extension/extension-activities": G(["2.5"], "Extension", "Extension"),
  "achievements/extension/other-extension-activities": G(["2.5"], "Extension", "Extension"),
  "achievements/special-days/technology-week-celebration": G(["2.6"], "Special Days", "Special Days"),
  "achievements/special-days/celebration-days": G(["2.6"], "Special Days", "Special Days"),
  "achievements/special-days/world-soil-day": G(["2.6"], "Special Days", "Special Days"),
  "achievements/special-days/poshan-maaha": G(["2.6"], "Special Days", "Special Days"),
  "achievements/swachhta-bharat-abhiyaan/sewa": G(["2.7"], "Swacha", "Swacha Bharat Abhiyan"),
  "achievements/swachhta-bharat-abhiyaan/pakhwada": G(["2.7"], "Swacha", "Swacha Bharat Abhiyan"),
  "achievements/swachhta-bharat-abhiyaan/budget-expenditure": G(["2.7"], "Swacha", "Swacha Bharat Abhiyan"),
  "achievements/production-supply": G(["2.8"], "Production", "Production & Supply"),
  "achievements/soil-water/soil-water-testing": G(["2.9"], "Soil and Water Testing", "Soil and Water Testing"),
  "achievements/publications": G(["2.10"], "Publications", "Publications"),
  "achievements/hrd": G(["2.11"], "Human Resources Development", "Human Resources Development"),
  "achievements/awards/kvk": G(["2.12"], "Award and Recognition", "Award and Recognition"),
  "achievements/awards/scientist": G(["2.12"], "Award and Recognition", "Award and Recognition"),
  "achievements/awards/farmer": G(["2.12"], "Award and Recognition", "Award and Recognition"),

  // 3. Projects
  "projects/cfld/technical-parameter": G(["3.1"], "CFLD", "CFLD"),
  "projects/cfld/extension-activity-cfld": G(["3.1"], "CFLD", "CFLD"),
  "projects/cfld/budget-utilization": G(["3.1"], "CFLD", "CFLD"),
  "projects/cfld/crop-wise-images": G(["3.1"], "CFLD", "CFLD"),
  "projects/nicra/basic-information": G(["3.2"], "NICRA", "NICRA"),
  "projects/nicra/details": G(["3.2"], "NICRA", "NICRA"),
  "projects/nicra/training": G(["3.2"], "NICRA", "NICRA"),
  "projects/nicra/extension-activity-nicra": G(["3.2"], "NICRA", "NICRA"),
  "projects/nicra/others/intervention": G(["3.3"], "NICRA Others", "NICRA Others"),
  "projects/nicra/others/revenue-generated": G(["3.3"], "NICRA Others", "NICRA Others"),
  "projects/nicra/others/custom-hiring-farm-implement": G(["3.3"], "NICRA Others", "NICRA Others"),
  "projects/nicra/others/village-wise-vcrmc": G(["3.3"], "NICRA Others", "NICRA Others"),
  "projects/nicra/others/soil-health-card": G(["3.3"], "NICRA Others", "NICRA Others"),
  "projects/nicra/others/convergence-programme": G(["3.3"], "NICRA Others", "NICRA Others"),
  "projects/nicra/others/dignitaries-visited-nicra-villages": G(["3.3"], "NICRA Others", "NICRA Others"),
  "projects/nicra/others/pi-co-pi-list": G(["3.3"], "NICRA Others", "NICRA Others"),
  "projects/arya-safal/arya-safal-current-year": G(["3.4"], "ARYA", "ARYA / SARAL"),
  "projects/arya-safal/arya-safal-previous-year": G(["3.4"], "ARYA", "ARYA / SARAL"),
  "projects/natural-farming/nf-geographical": G(["3.5"], "Natural Farming", "Natural Farming"),
  "projects/natural-farming/nf-physical": G(["3.5"], "Natural Farming", "Natural Farming"),
  "projects/natural-farming/nf-demonstration": G(["3.5"], "Natural Farming", "Natural Farming"),
  "projects/natural-farming/nf-already-practicing": G(["3.5"], "Natural Farming", "Natural Farming"),
  "projects/natural-farming/nf-beneficiaries": G(["3.5"], "Natural Farming", "Natural Farming"),
  "projects/natural-farming/nf-soil-data": G(["3.5"], "Natural Farming", "Natural Farming"),
  "projects/natural-farming/nf-budget-expenditure": G(["3.5"], "Natural Farming", "Natural Farming"),
  "projects/tsp-scsp/view-sub-plan-activity": G(["3.6"], "TSP/SCSP", "TSP/SCSP"),
  "projects/nari/nari-nutrition-garden": G(["3.7"], "NARI", "NARI"),
  "projects/nari/nari-bio-fortified": G(["3.7"], "NARI", "NARI"),
  "projects/nari/nari-value-addition": G(["3.7"], "NARI", "NARI"),
  "projects/nari/nari-training": G(["3.7"], "NARI", "NARI"),
  "projects/nari/nari-extension": G(["3.7"], "NARI", "NARI"),
  "projects/agri-drone/agri-drone-introduction": G(["3.8"], "Agri-Drone", "Agri-Drone"),
  "projects/agri-drone/agri-drone-demonstration": G(["3.8"], "Agri-Drone", "Agri-Drone"),
  "projects/fpo-cbbo/fpo-cbbo-details": G(["3.9"], "FPO and CBBO", "FPO and CBBO"),
  "projects/fpo-cbbo/fpo-management": G(["3.9"], "FPO and CBBO", "FPO and CBBO"),
  "projects/drmr/drmr-details": G(["3.10"], "DRMR", "DRMR"),
  "projects/drmr/drmr-activity": G(["3.10"], "DRMR", "DRMR"),
  "projects/cra/cra-details": G(["3.11"], "Climate Resilient Agriculture", "Climate Resilient Agriculture (CRA)"),
  "projects/cra/cra-extension-activity": G(["3.11"], "Climate Resilient Agriculture", "Climate Resilient Agriculture (CRA)"),
  "projects/csisa/csisa-details": G(["3.12"], "CSISA", "CSISA"),
  "projects/seed-hub/seed-hub-program": G(["3.13"], "Seed Hub Program", "Seed Hub Program"),
  "projects/other-programmes/other-programme": G(["3.14"], "Other Programmes", "Other Programmes"),

  // 4. Performance
  "performance/impact/impact-of-kvk-activities": G(["4.1"], "Impact", "Impact"),
  "performance/impact/entrepreneurship-details": G(["4.1"], "Impact", "Impact"),
  "performance/impact/success-stories": G(["4.1"], "Impact", "Impact"),
  "performance/district-village-performance/district-level-data": G(["4.2"], "District and Village Performance", "District and Village Performance"),
  "performance/district-village-performance/district-crop-productivity": G(["4.2"], "District and Village Performance", "District and Village Performance"),
  "performance/district-village-performance/district-livestock-production": G(["4.2"], "District and Village Performance", "District and Village Performance"),
  "performance/district-village-performance/operational-area-details": G(["4.2"], "District and Village Performance", "District and Village Performance"),
  "performance/district-village-performance/village-adoption-programme": G(["4.2"], "District and Village Performance", "District and Village Performance"),
  "performance/district-village-performance/priority-thrust-area": G(["4.2"], "District and Village Performance", "District and Village Performance"),
  "performance/infrastructure-performance/demonstration-units": G(["4.3"], "Infrastructure Performance", "Infrastructure Performance"),
  "performance/infrastructure-performance/instructional-farm-crops": G(["4.3"], "Infrastructure Performance", "Infrastructure Performance"),
  "performance/infrastructure-performance/production-units": G(["4.3"], "Infrastructure Performance", "Infrastructure Performance"),
  "performance/infrastructure-performance/instructional-farm-livestock": G(["4.3"], "Infrastructure Performance", "Infrastructure Performance"),
  "performance/infrastructure-performance/hostel-utilization": G(["4.3"], "Infrastructure Performance", "Infrastructure Performance"),
  "performance/infrastructure-performance/rain-water-harvesting": G(["4.3"], "Infrastructure Performance", "Infrastructure Performance"),
  "performance/infrastructure-performance/staff-quarters-performance": G(["4.3"], "Infrastructure Performance", "Infrastructure Performance"),
  "performance/financial-performance/budget-details": G(["4.4"], "Financial Performance", "Financial Performance"),
  "performance/financial-performance/project-wise-budget-performance": G(["4.4"], "Financial Performance", "Financial Performance"),
  "performance/financial-performance/revolving-fund": G(["4.4"], "Financial Performance", "Financial Performance"),
  "performance/financial-performance/revenue-generation": G(["4.4"], "Financial Performance", "Financial Performance"),
  "performance/financial-performance/resource-generation": G(["4.4"], "Financial Performance", "Financial Performance"),
  "performance/linkages/functional-linkage": G(["4.5"], "Linkages", "Linkages"),
  "performance/linkages/special-programmes": G(["4.5"], "Linkages", "Linkages"),

  // 5. Miscellaneous  (Super Admin and KVK trees number these differently - the
  // title match is tried first, so numbers are only a Super-Admin fallback)
  "miscellaneous/prevalent-diseases-crops": G([], "Prevalent Diseases", "Prevalent Diseases"),
  "miscellaneous/prevalent-diseases-livestock": G([], "Prevalent Diseases", "Prevalent Diseases"),
  "miscellaneous/ppv-fra-sensitization/ppv-fra-training-programme": G([], "PPV & FRA Sensitization", "PPV & FRA Sensitization"),
  "miscellaneous/ppv-fra-sensitization/ppv-fra-farmer-details": G([], "PPV & FRA Sensitization", "PPV & FRA Sensitization"),
  "miscellaneous/rawe-fet-fit-programme": G(["5.3"], "RAWE", "RAWE/FET & VIP Visitors"),
  "miscellaneous/vip-visitors": G(["5.3"], "VIP Visitors", "RAWE/FET & VIP Visitors"),
  "miscellaneous/digital-information/digital-mobile-app": G(["5.3"], "Digital Information", "Digital Information"),
  "miscellaneous/digital-information/digital-web-portal": G(["5.3"], "Digital Information", "Digital Information"),
  "miscellaneous/digital-information/digital-kisan-sarathi": G(["5.3"], "Digital Information", "Digital Information"),
  "miscellaneous/digital-information/digital-kmas": G(["5.3"], "Digital Information", "Digital Information"),
  "miscellaneous/digital-information/digital-other-channels": G(["5.3"], "Digital Information", "Digital Information"),

  // 6. Meetings
  "meetings/sac-meetings": G(["6.1"], "SAC Meetings", "SAC Meetings"),
  "meetings/other-meetings": G(["6.2"], "Other Meetings", "Other Meetings"),
};

export function reportSubsectionForLeaf(recordPath: string | undefined): ReportSubsectionRef | undefined {
  return recordPath ? REPORT_SUBSECTION_BY_LEAF[recordPath] : undefined;
}

type SubLike = { num: string; title: string };
type SecLike<S extends SubLike> = { subsections: S[] };

/** True when a built subsection is (probably) the one `ref` points at - title match, else number match. Used to attach a leaf's Module Images to the right subsection. */
export function subsectionMatchesRef(ref: ReportSubsectionRef, sub: SubLike): boolean {
  if (ref.titleIncludes && sub.title.toLowerCase().includes(ref.titleIncludes.toLowerCase())) return true;
  return ref.nums.includes(sub.num);
}

/**
 * Prunes a built report tree to just the subsection(s) `ref` points at. The
 * title match is tried across the whole tree first; only if nothing matches
 * by title does it fall back to the subsection numbers (which drift between
 * the Super Admin and KVK trees for section 5). Returns the sections that
 * still have at least one subsection - empty when the leaf's subsection does
 * not exist in this scope's tree (caller then does its own flat export).
 */
export function pruneToSubsection<S extends SubLike, T extends SecLike<S>>(
  sections: T[],
  ref: ReportSubsectionRef,
): T[] {
  const byTitle = (sub: SubLike) =>
    !!ref.titleIncludes && sub.title.toLowerCase().includes(ref.titleIncludes.toLowerCase());
  const byNum = (sub: SubLike) => ref.nums.includes(sub.num);
  const keep = (predicate: (sub: SubLike) => boolean) =>
    sections
      .map((sec) => ({ ...sec, subsections: sec.subsections.filter(predicate) }))
      .filter((sec) => sec.subsections.length > 0);
  const titled = keep(byTitle);
  return titled.length > 0 ? titled : keep(byNum);
}
