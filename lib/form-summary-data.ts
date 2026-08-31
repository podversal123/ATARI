import "server-only";
import { FORM_MANAGEMENT, type NavItem } from "./navigation";

export type TrackedLeaf = {
  path: string;
  label: string;
  topSection: string;
  model: string;
  /** SwachhtaObservance backs both "Sewa" and "Pakhwada" (kind enum), so those two leaves each need a real extra filter, not a plain per-model groupBy - every other leaf here has one model to itself. */
  extraWhere?: Record<string, string>;
  /** StaffTransfer's own per-KVK column is `toKvkId`, not `kvkId` (confirmed in lib/leaf-record-registry.ts's own delete handler for this leaf) - every other leaf here groups by `kvkId`. */
  kvkField?: "kvkId" | "toKvkId";
};

/**
 * path -> Prisma model name, mechanically extracted from every real
 * `prisma.<model>.create` call in lib/leaf-record-registry.ts's
 * LEAF_RECORD_REGISTRY (106 entries, not hand-typed - see
 * [[project_atari_ams_dashboard_reports_fixes_2026_08_25]] for the
 * extraction method), plus the 3 leaves that bypass that generic registry
 * for a bespoke Create flow instead (CFLD Technical Parameter, Technology
 * Week Celebration, World Soil Day) - each still backed by one real model.
 */
const LEAF_MODEL_MAP: Record<string, { model: string; extraWhere?: Record<string, string>; kvkField?: "kvkId" | "toKvkId" }> = {
  "about-kvk/basic/bank-account-details": { model: "bankAccount" },
  "about-kvk/employee/staff-transferred": { model: "staffTransfer", kvkField: "toKvkId" },
  "about-kvk/land-infrastructure/infrastructure-details": { model: "infrastructure" },
  "about-kvk/land-infrastructure/land-details": { model: "land" },
  "about-kvk/land-infrastructure/staff-quarters": { model: "staffQuarters" },
  "about-kvk/vehicles/view-vehicles": { model: "vehicle" },
  "about-kvk/vehicles/vehicle-details": { model: "vehicleStatus" },
  "about-kvk/equipments/view-equipments": { model: "equipment" },
  "about-kvk/equipments/equipment-details": { model: "equipmentStatus" },
  "about-kvk/employee/employee-details": { model: "staff" },
  "achievements/oft": { model: "oft" },
  "achievements/front-line-demonstration/view-fld": { model: "fld" },
  "achievements/front-line-demonstration/fld-extension-training": { model: "fldExtensionTraining" },
  "achievements/front-line-demonstration/fld-technical-feedback": { model: "fldTechnicalFeedback" },
  "achievements/trainings": { model: "training" },
  "achievements/extension/extension-activities": { model: "extensionActivity" },
  "achievements/extension/other-extension-activities": { model: "otherExtensionActivity" },
  "achievements/special-days/celebration-days": { model: "celebrationDay" },
  "achievements/swachhta-bharat-abhiyaan/sewa": { model: "swachhtaObservance", extraWhere: { kind: "SEWA" } },
  "achievements/swachhta-bharat-abhiyaan/pakhwada": { model: "swachhtaObservance", extraWhere: { kind: "PAKHWADA" } },
  "achievements/swachhta-bharat-abhiyaan/budget-expenditure": { model: "swachhtaBudgetExpenditure" },
  "achievements/special-days/poshan-maaha": { model: "poshanMaaha" },
  "achievements/production-supply": { model: "technologyProductProduction" },
  "achievements/soil-water/soil-testing-equipment": { model: "soilTestingEquipment" },
  "achievements/soil-water/soil-water-testing": { model: "soilWaterPlantAnalysis" },
  "achievements/special-days/world-soil-day": { model: "worldSoilDay" },
  "achievements/publications": { model: "publication" },
  "achievements/hrd": { model: "humanResourceDevelopment" },
  "achievements/awards/kvk": { model: "kvkAward" },
  "achievements/awards/scientist": { model: "scientistAward" },
  "achievements/awards/farmer": { model: "farmerAward" },
  "achievements/special-days/technology-week-celebration": { model: "technologyWeekCelebration" },
  "projects/cfld/technical-parameter": { model: "cfldTechnicalParameter" },
  "projects/cfld/extension-activity-cfld": { model: "cfldExtensionActivity" },
  "projects/cfld/budget-utilization": { model: "cfldBudgetUtilization" },
  "projects/cfld/crop-wise-images": { model: "cfldCropWiseImage" },
  "projects/nicra/basic-information": { model: "nicraBasicInformation" },
  "projects/nicra/details": { model: "nicraDetails" },
  "projects/nicra/training": { model: "nicraTraining" },
  "projects/nicra/extension-activity-nicra": { model: "nicraExtensionActivity" },
  "projects/nicra/others/intervention": { model: "nicraIntervention" },
  "projects/nicra/others/revenue-generated": { model: "nicraRevenueGenerated" },
  "projects/nicra/others/custom-hiring-farm-implement": { model: "nicraCustomHiringFarmImplement" },
  "projects/nicra/others/village-wise-vcrmc": { model: "nicraVillageWiseVcrmc" },
  "projects/nicra/others/soil-health-card": { model: "nicraSoilHealthCard" },
  "projects/nicra/others/convergence-programme": { model: "nicraConvergenceProgramme" },
  "projects/nicra/others/dignitaries-visited-nicra-villages": { model: "nicraDignitaryVisit" },
  "projects/nicra/others/pi-co-pi-list": { model: "nicraPiCoPi" },
  "projects/arya-safal/arya-safal-current-year": { model: "aryaCurrentYearDetail" },
  "projects/arya-safal/arya-safal-previous-year": { model: "aryaPreviousYearEvaluation" },
  "projects/natural-farming/nf-geographical": { model: "nfGeographicalInfo" },
  "projects/natural-farming/nf-physical": { model: "nfPhysicalInfo" },
  "projects/natural-farming/nf-demonstration": { model: "nfDemonstrationInfo" },
  "projects/natural-farming/nf-already-practicing": { model: "nfAlreadyPracticing" },
  "projects/natural-farming/nf-beneficiaries": { model: "nfBeneficiary" },
  "projects/natural-farming/nf-soil-data": { model: "nfSoilData" },
  "projects/natural-farming/nf-budget-expenditure": { model: "nfBudgetExpenditure" },
  "projects/tsp-scsp/view-sub-plan-activity": { model: "subPlanActivity" },
  "projects/nari/nari-nutrition-garden": { model: "nariNutritionGarden" },
  "projects/nari/nari-bio-fortified": { model: "nariBioFortified" },
  "projects/nari/nari-value-addition": { model: "nariValueAddition" },
  "projects/nari/nari-training": { model: "nariTraining" },
  "projects/nari/nari-extension": { model: "nariExtension" },
  "projects/agri-drone/agri-drone-introduction": { model: "agriDroneIntroduction" },
  "projects/agri-drone/agri-drone-demonstration": { model: "agriDroneDemonstration" },
  "projects/fpo-cbbo/fpo-cbbo-details": { model: "fpoCbboDetail" },
  "projects/fpo-cbbo/fpo-management": { model: "fpoManagement" },
  "projects/drmr/drmr-details": { model: "drmrDetail" },
  "projects/drmr/drmr-activity": { model: "drmrActivity" },
  "projects/cra/cra-details": { model: "craDetail" },
  "projects/cra/cra-extension-activity": { model: "craExtensionActivity" },
  "projects/csisa/csisa-details": { model: "csisaDetail" },
  "projects/seed-hub/seed-hub-program": { model: "seedHubProgram" },
  "projects/other-programmes/other-programme": { model: "otherProgramme" },
  "performance/impact/impact-of-kvk-activities": { model: "kvkActivityImpact" },
  "performance/impact/entrepreneurship-details": { model: "entrepreneurshipDetail" },
  "performance/impact/success-stories": { model: "successStory" },
  "performance/district-village-performance/district-level-data": { model: "districtLevelData" },
  "performance/district-village-performance/operational-area-details": { model: "operationalAreaDetail" },
  "performance/district-village-performance/village-adoption-programme": { model: "villageAdoptionProgramme" },
  "performance/district-village-performance/priority-thrust-area": { model: "priorityThrustArea" },
  "performance/infrastructure-performance/demonstration-units": { model: "demonstrationUnit" },
  "performance/infrastructure-performance/instructional-farm-crops": { model: "instructionalFarmCrop" },
  "performance/infrastructure-performance/production-units": { model: "productionUnit" },
  "performance/infrastructure-performance/instructional-farm-livestock": { model: "instructionalFarmLivestock" },
  "performance/infrastructure-performance/hostel-utilization": { model: "hostelUtilization" },
  "performance/infrastructure-performance/staff-quarters-performance": { model: "staffQuartersPerformance" },
  "performance/infrastructure-performance/rain-water-harvesting": { model: "rainWaterHarvesting" },
  "performance/financial-performance/budget-details": { model: "budgetDetail" },
  "performance/financial-performance/project-wise-budget-performance": { model: "projectWiseBudgetPerformance" },
  "performance/financial-performance/revolving-fund": { model: "revolvingFund" },
  "performance/financial-performance/revenue-generation": { model: "revenueGeneration" },
  "performance/financial-performance/resource-generation": { model: "resourceGeneration" },
  "performance/linkages/functional-linkage": { model: "functionalLinkage" },
  "performance/linkages/special-programmes": { model: "specialProgramme" },
  "meetings/sac-meetings": { model: "sacMeeting" },
  "meetings/other-meetings": { model: "otherMeeting" },
  "miscellaneous/prevalent-diseases-crops": { model: "prevalentDiseaseCrop" },
  "miscellaneous/prevalent-diseases-livestock": { model: "prevalentDiseaseLivestock" },
  "miscellaneous/nyk-training": { model: "nykTraining" },
  "miscellaneous/ppv-fra-sensitization/ppv-fra-training-programme": { model: "ppvFraTrainingProgramme" },
  "miscellaneous/ppv-fra-sensitization/ppv-fra-farmer-details": { model: "ppvFraFarmerDetail" },
  "miscellaneous/rawe-fet-fit-programme": { model: "raweFetFitProgramme" },
  "miscellaneous/vip-visitors": { model: "vipVisitor" },
  "miscellaneous/digital-information/digital-mobile-app": { model: "digitalMobileApp" },
  "miscellaneous/digital-information/digital-web-portal": { model: "digitalWebPortal" },
  "miscellaneous/digital-information/digital-kisan-sarathi": { model: "digitalKisanSarathi" },
  "miscellaneous/digital-information/digital-kmas": { model: "digitalKmas" },
  "miscellaneous/digital-information/digital-other-channels": { model: "digitalOtherChannel" },
};

function walk(items: NavItem[], pathSoFar: string[], topSection: string, out: TrackedLeaf[]) {
  for (const item of items) {
    const path = [...pathSoFar, item.slug].join("/");
    if (item.type === "leaf") {
      const mapped = LEAF_MODEL_MAP[path];
      if (mapped) out.push({ path, label: item.label, topSection, ...mapped });
    } else {
      walk(item.children, [...pathSoFar, item.slug], topSection, out);
    }
  }
}

/**
 * Every real, trackable Form Management leaf - "trackable" meaning it has
 * an actual Prisma model a KVK submits real rows to. Two real leaves are
 * deliberately excluded, not missed: "View KVKs" (a read-only KVK-master
 * listing, not something a KVK fills in) and "Technical Achievement
 * Summary" (a computed rollup of OFT/FLD/Training/etc, no `.create` calls
 * anywhere for it - there's nothing to submit).
 */
export function getTrackedLeaves(): TrackedLeaf[] {
  const out: TrackedLeaf[] = [];
  for (const top of FORM_MANAGEMENT) {
    if (top.type === "leaf") {
      const mapped = LEAF_MODEL_MAP[top.slug];
      if (mapped) out.push({ path: top.slug, label: top.label, topSection: top.label, ...mapped });
    } else {
      walk(top.children, [top.slug], top.label, out);
    }
  }
  return out;
}
