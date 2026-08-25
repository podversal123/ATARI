import "server-only";
import { prisma } from "@/lib/prisma";

export type RecordContext = { kvkId: string; zoneId: string };

type CreateFn = (values: Record<string, string>, ctx: RecordContext) => Promise<unknown>;

/** Coercion helpers - every AddLeafPage field arrives as a plain string, these turn it into what Prisma actually expects. */
const str = (v: string | undefined) => (v?.trim() ? v.trim() : undefined);
const reqStr = (v: string | undefined) => v?.trim() ?? "";
const int = (v: string | undefined) => (v?.trim() ? parseInt(v, 10) : undefined);
const reqInt = (v: string | undefined) => parseInt(v ?? "0", 10) || 0;
const dec = (v: string | undefined) => (v?.trim() ? Number(v) : undefined);
const reqDec = (v: string | undefined) => Number(v) || 0;
const date = (v: string | undefined) => (v?.trim() ? new Date(v) : undefined);
const reqDate = (v: string | undefined) => new Date(v ?? Date.now());
const bool = (v: string | undefined) => v?.trim().toLowerCase() === "yes" || v?.trim().toLowerCase() === "true";

/**
 * One entry per Form Management leaf that uses the generic AddLeafPage
 * (columns -> plain-text fields). Keyed by the leaf's full nav path
 * ("achievements/oft") since several leaf slugs repeat across different
 * parents (e.g. "training" under NICRA vs. Achievements' own "trainings").
 * Leaves with a bespoke Add form (KVK Master, View KVKs, Employee Details,
 * CFLD Technical Parameter, event-demographic dialogs) are wired directly in
 * their own component instead of through this registry.
 */
export const LEAF_RECORD_REGISTRY: Record<string, CreateFn> = {
  // --- About KVK ---
  "about-kvk/basic/bank-account-details": (v, ctx) =>
    prisma.bankAccount.create({
      data: {
        ...ctx,
        accountType: reqStr(v.accountType),
        accountName: reqStr(v.accountName),
        bankName: reqStr(v.bankName),
        location: str(v.location),
        accountNumber: reqStr(v.accountNumber),
      },
    }),
  "about-kvk/employee/staff-transferred": async (v, ctx) => {
    const staff = await prisma.staff.findFirst({ where: { kvkId: ctx.kvkId, name: reqStr(v.staffName) } });
    const fromKvk = await prisma.kvk.findFirst({ where: { zoneId: ctx.zoneId, name: reqStr(v.kvkNameBeforeTransfer) } });
    const toKvk = await prisma.kvk.findFirst({ where: { zoneId: ctx.zoneId, name: reqStr(v.latestKvkName) } });
    if (!staff || !fromKvk || !toKvk) throw new Error("Staff or KVK not found");
    return prisma.staffTransfer.create({
      data: { staffId: staff.id, fromKvkId: fromKvk.id, toKvkId: toKvk.id, zoneId: ctx.zoneId, transferDate: new Date() },
    });
  },
  "about-kvk/infrastructure/infrastructure-details": (v, ctx) =>
    prisma.infrastructure.create({
      data: {
        ...ctx,
        infrastructureName: reqStr(v.infraMasterName),
        notYetStarted: bool(v.notYetStarted),
        completedPlinthLevel: bool(v.completedPlinthLevel),
        completedLintelLevel: bool(v.completedLintelLevel),
        completedRoofLevel: bool(v.completedRoofLevel),
        totallyCompleted: bool(v.totallyCompleted),
        plinthAreaSqM: dec(v.plinthAreaSqM),
        underUse: bool(v.underUse),
        sourceOfFunding: str(v.sourceOfFunding),
      },
    }),
  "about-kvk/infrastructure/land-details": (v, ctx) =>
    prisma.land.create({ data: { ...ctx, item: reqStr(v.item), areaHa: reqDec(v.areaHa) } }),
  "about-kvk/infrastructure/staff-quarters": (v, ctx) =>
    prisma.staffQuarters.create({
      data: { ...ctx, numberOfQuarters: reqInt(v.noOfStaffQuarters), dateOfCompletion: date(v.dateOfCompletion), remark: str(v.remark) },
    }),
  "about-kvk/vehicles/view-vehicles": (v, ctx) =>
    prisma.vehicle.create({
      data: { ...ctx, name: reqStr(v.vehicleName), registrationNo: reqStr(v.registrationNo), yearOfPurchase: reqInt(v.yearOfPurchase), cost: reqDec(v.totalCost) },
    }),
  "about-kvk/vehicles/vehicle-details": async (v, ctx) => {
    const vehicle = await prisma.vehicle.findFirst({ where: { kvkId: ctx.kvkId, name: reqStr(v.vehicleName) } });
    if (!vehicle) throw new Error("Vehicle not found");
    return prisma.vehicleStatus.create({
      data: { vehicleId: vehicle.id, zoneId: ctx.zoneId, reportingYear: reqInt(v.reportingYear), totalRunKmHrs: dec(v.totalRunKms) },
    });
  },
  "about-kvk/equipments/view-equipments": (v, ctx) =>
    prisma.equipment.create({
      data: { ...ctx, name: reqStr(v.equipmentName), yearOfPurchase: reqInt(v.yearOfPurchase), cost: reqDec(v.totalCost) },
    }),
  "about-kvk/equipments/equipment-details": async (v, ctx) => {
    const equipment = await prisma.equipment.findFirst({ where: { kvkId: ctx.kvkId, name: reqStr(v.equipmentName) } });
    if (!equipment) throw new Error("Equipment not found");
    return prisma.equipmentStatus.create({
      data: { equipmentId: equipment.id, zoneId: ctx.zoneId, reportingYear: reqInt(v.reportingYear), sourceOfFund: str(v.sourceOfFund) },
    });
  },

  "about-kvk/employee/employee-details": (v, ctx) =>
    prisma.staff.create({
      data: {
        ...ctx,
        sanctionedPost: reqStr(v.sanctionedPost),
        name: reqStr(v.name),
        mobile: str(v.mobile),
        email: str(v.email),
        payScale: str(v.payScale),
        discipline: str(v.discipline),
        dateOfBirth: date(v.dateOfBirth),
        dateOfJoining: date(v.dateOfJoining),
        jobType: str(v.jobType),
        allowances: str(v.allowances),
        category: str(v.casteCategory),
      },
    }),

  // --- Achievements ---
  "achievements/oft": (v, ctx) =>
    prisma.oft.create({
      data: {
        ...ctx,
        reportingYear: reqInt(v.reportingYear),
        discipline: reqStr(v.discipline),
        staff: reqStr(v.staff),
        thematicArea: reqStr(v.thematicArea),
        trialOnForm: reqStr(v.trialOnForm),
        problemDiagnosed: str(v.problemDiagnosed),
        sourceOfTechnology: str(v.sourceOfTechnology),
        productionSystem: str(v.productionSystem),
        performanceIndicators: str(v.performanceIndicators),
        finalRecommendation: str(v.finalRecommendation),
        constraintsIdentified: str(v.constraintsIdentified),
        farmersParticipationProcess: str(v.farmersParticipationProcess),
        quantity: dec(v.quantity),
        unit: str(v.unit),
        noOfTrialReplicationFarmer: int(v.noOfTrialReplicationFarmer),
        startMonth: date(v.startMonth),
        endMonth: date(v.endMonth),
        criticalInput: str(v.criticalInput),
        costOfOft: dec(v.costOfOft),
        fundingAgency: str(v.fundingAgency),
        status: v.status?.toLowerCase().includes("complet") ? "COMPLETED" : "ONGOING",
      },
    }),
  "achievements/front-line-demonstration/view-fld": (v, ctx) =>
    prisma.fld.create({
      data: {
        ...ctx,
        reportingYear: reqInt(v.reportingYear),
        startDate: date(v.startDate),
        endDate: date(v.endDate),
        category: reqStr(v.category),
        subCategory: reqStr(v.subCategory),
        technologyDemonstrated: reqStr(v.technologyDemonstrated),
        status: v.status?.toLowerCase().includes("complet") ? "COMPLETED" : "ONGOING",
      },
    }),
  "achievements/front-line-demonstration/fld-extension-training": async (v, ctx) => {
    const fld = await prisma.fld.findFirst({ where: { kvkId: ctx.kvkId, technologyDemonstrated: reqStr(v.fldName) } });
    if (!fld) throw new Error("FLD not found");
    return prisma.fldExtensionTraining.create({
      data: { fldId: fld.id, zoneId: ctx.zoneId, activity: reqStr(v.activity), date: reqDate(v.date), activityCount: reqInt(v.activityCount), participantCount: reqInt(v.participantCount), remark: str(v.remark) },
    });
  },
  "achievements/front-line-demonstration/fld-technical-feedback": async (v, ctx) => {
    const fld = await prisma.fld.findFirst({ where: { kvkId: ctx.kvkId, technologyDemonstrated: reqStr(v.fld) } });
    if (!fld) throw new Error("FLD not found");
    return prisma.fldTechnicalFeedback.create({
      data: { fldId: fld.id, zoneId: ctx.zoneId, crop: reqStr(v.crop), feedback: reqStr(v.feedback) },
    });
  },
  "achievements/trainings": (v, ctx) =>
    prisma.training.create({
      data: { ...ctx, reportingYear: reqInt(v.reportingYear), startDate: date(v.startDate), endDate: date(v.endDate), program: reqStr(v.program), title: reqStr(v.title), venue: str(v.venue), trainingDiscipline: str(v.trainingDiscipline), thematicArea: str(v.thematicArea) },
    }),
  "achievements/extension/extension-activities": (v, ctx) =>
    prisma.extensionActivity.create({
      data: { ...ctx, reportingYear: reqInt(v.reportingYear), startDate: date(v.startDate), endDate: date(v.endDate), natureOfExtensionActivity: reqStr(v.natureOfExtensionActivity), noOfActivities: reqInt(v.noOfActivities), noOfParticipants: reqInt(v.noOfParticipants) },
    }),
  "achievements/extension/other-extension-activities": (v, ctx) =>
    prisma.otherExtensionActivity.create({
      data: { ...ctx, reportingYear: reqInt(v.reportingYear), natureOfExtensionActivity: reqStr(v.natureOfExtensionActivity), noOfActivities: reqInt(v.noOfActivities) },
    }),
  "achievements/special-days/celebration-days": (v, ctx) =>
    prisma.celebrationDay.create({
      data: { ...ctx, importantDay: reqStr(v.importantDay), eventDate: reqDate(v.eventDate), noOfActivities: reqInt(v.noOfActivities) },
    }),
  "achievements/swachhta-bharat-abhiyaan/sewa": (v, ctx) =>
    prisma.swachhtaObservance.create({
      data: { ...ctx, kind: "SEWA", dateDurationOfObservation: reqStr(v.dateDurationOfObservation), totalNoOfActivitiesUndertaken: reqInt(v.totalNoOfActivitiesUndertaken), noOfStaffs: reqInt(v.noOfStaffs), noOfFarmers: reqInt(v.noOfFarmers) },
    }),
  "achievements/swachhta-bharat-abhiyaan/pakhwada": (v, ctx) =>
    prisma.swachhtaObservance.create({
      data: { ...ctx, kind: "PAKHWADA", dateDurationOfObservation: reqStr(v.dateDurationOfObservation), totalNoOfActivitiesUndertaken: reqInt(v.totalNoOfActivitiesUndertaken), noOfStaffs: reqInt(v.noOfStaffs), noOfFarmers: reqInt(v.noOfFarmers) },
    }),
  "achievements/swachhta-bharat-abhiyaan/budget-expenditure": (v, ctx) =>
    prisma.swachhtaBudgetExpenditure.create({
      data: { ...ctx, reportingYear: reqInt(v.reportingYear), vermicompostingVillagesCovered: reqInt(v.vermicompostingVillagesCovered), vermicompostingTotalExpenditure: reqDec(v.vermicompostingTotalExpenditure) },
    }),
  "achievements/special-days/poshan-maaha": (v, ctx) =>
    prisma.poshanMaaha.create({
      data: {
        ...ctx,
        activityDate: reqDate(v.activityDate),
        activitiesConducted: reqStr(v.activitiesConducted),
        eventName: reqStr(v.eventName),
        saplingsPlanted: reqInt(v.saplingsPlanted),
        vegetableKits: reqInt(v.vegetableKits),
        participantsGirls: reqInt(v.participantsGirls),
        participantsPublicRepresentatives: reqInt(v.participantsPublicRepresentatives),
        participantsFarmWoman: reqInt(v.participantsFarmWoman),
        participantsFarmers: reqInt(v.participantsFarmers),
        participantsAganwadiWorkers: reqInt(v.participantsAganwadiWorkers),
        participantsGovtOfficials: reqInt(v.participantsGovtOfficials),
        totalParticipants: reqInt(v.totalParticipants),
      },
    }),
  "achievements/production-supply": (v, ctx) =>
    prisma.technologyProductProduction.create({
      data: { ...ctx, category: reqStr(v.category), variety: reqStr(v.variety), quantity: reqDec(v.quantity) },
    }),
  "achievements/soil-water/soil-testing-equipment": (v, ctx) =>
    prisma.soilTestingEquipment.create({
      data: { ...ctx, analysis: reqStr(v.analysis), equipmentName: reqStr(v.equipmentName), quantity: reqInt(v.quantity) },
    }),
  "achievements/soil-water/soil-water-testing": (v, ctx) =>
    prisma.soilWaterPlantAnalysis.create({
      data: { ...ctx, startDate: reqDate(v.startDate), endDate: reqDate(v.endDate), analysis: reqStr(v.analysis), noOfSamplesAnalyzed: reqInt(v.noOfSamplesAnalyzed), noOfVillagesCovered: reqInt(v.noOfVillagesCovered), amountRealized: reqDec(v.amountRealized) },
    }),
  "achievements/publications": (v, ctx) =>
    prisma.publication.create({
      data: { ...ctx, itemName: reqStr(v.itemName), title: reqStr(v.title), authorName: reqStr(v.authorName), journalName: str(v.journalName) },
    }),
  "achievements/hrd": (v, ctx) =>
    prisma.humanResourceDevelopment.create({
      data: { ...ctx, staff: reqStr(v.staff), course: reqStr(v.course), startDate: date(v.startDate), endDate: date(v.endDate), venue: str(v.venue), organizer: str(v.organizer) },
    }),
  "achievements/awards/kvk": (v, ctx) =>
    prisma.kvkAward.create({
      data: { ...ctx, award: reqStr(v.award), amount: reqDec(v.amount), achievement: str(v.achievement), conferringAuthority: str(v.conferringAuthority) },
    }),
  "achievements/awards/scientist": (v, ctx) =>
    prisma.scientistAward.create({
      data: { ...ctx, headScientist: reqStr(v.headScientist), award: reqStr(v.award), amount: reqDec(v.amount), achievement: str(v.achievement), conferringAuthority: str(v.conferringAuthority) },
    }),
  "achievements/awards/farmer": (v, ctx) =>
    prisma.farmerAward.create({
      data: { ...ctx, farmerName: reqStr(v.farmerName), address: str(v.address), contactNumber: str(v.contactNumber), award: reqStr(v.award), amount: reqDec(v.amount), achievement: str(v.achievement), conferringAuthority: str(v.conferringAuthority) },
    }),

  // --- Projects ---
  "projects/cfld/extension-activity-cfld": (v, ctx) =>
    prisma.cfldExtensionActivity.create({
      data: { ...ctx, season: reqStr(v.season), activitiesOrganized: reqStr(v.activitiesOrganized), date: reqDate(v.date), placeOfActivity: reqStr(v.placeOfActivity), farmersAttended: reqInt(v.farmersAttended) },
    }),
  "projects/cfld/budget-utilization": (v, ctx) =>
    prisma.cfldBudgetUtilization.create({
      data: { ...ctx, crop: reqStr(v.crop), season: reqStr(v.season), overallFundAllocation: reqDec(v.overallFundAllocation) },
    }),
  "projects/cfld/crop-wise-images": (v, ctx) =>
    prisma.cfldCropWiseImage.create({ data: { ...ctx, crop: reqStr(v.crop), imageUrl: "" } }),
  "projects/nicra/basic-information": (v, ctx) =>
    prisma.nicraBasicInformation.create({
      data: { ...ctx, rfDistrictNormal: dec(v.rfDistrictNormal), rfDistrictReceived: dec(v.rfDistrictReceived), maxTemperature: dec(v.maxTemperature), minTemperature: dec(v.minTemperature) },
    }),
  "projects/nicra/details": (v, ctx) =>
    prisma.nicraDetails.create({
      data: { ...ctx, cropName: reqStr(v.cropName), seasonName: reqStr(v.seasonName), technologyDemonstration: reqStr(v.technologyDemonstration), noOfFarmers: reqInt(v.noOfFarmers) },
    }),
  "projects/nicra/training": (v, ctx) =>
    prisma.nicraTraining.create({
      data: { ...ctx, title: reqStr(v.title), startDate: reqDate(v.startDate), endDate: reqDate(v.endDate), farmersAttended: reqInt(v.farmersAttended) },
    }),
  "projects/nicra/extension-activity-nicra": (v, ctx) =>
    prisma.nicraExtensionActivity.create({
      data: { ...ctx, activityName: reqStr(v.activityName), places: reqStr(v.places), startDate: reqDate(v.startDate), endDate: reqDate(v.endDate), farmersAttended: reqInt(v.farmersAttended) },
    }),
  "projects/nicra/others/intervention": (v, ctx) =>
    prisma.nicraIntervention.create({
      data: { ...ctx, startDate: reqDate(v.startDate), endDate: reqDate(v.endDate), seedBankFodderBank: reqStr(v.seedBankFodderBank), crop: reqStr(v.crop), variety: reqStr(v.variety), quantityQuintal: reqDec(v.quantity) },
    }),
  "projects/nicra/others/revenue-generated": (v, ctx) =>
    prisma.nicraRevenueGenerated.create({
      data: { ...ctx, year: reqInt(v.year), revenue: reqDec(v.revenue), total: reqDec(v.total) },
    }),
  "projects/nicra/others/custom-hiring-farm-implement": (v, ctx) =>
    prisma.nicraCustomHiringFarmImplement.create({
      data: { ...ctx, farmImplementName: reqStr(v.farmImplementName), farmersUsed: reqInt(v.farmersUsed), areaCovered: reqDec(v.areaCovered), hoursUsed: reqDec(v.hoursUsed), revenueGenerated: reqDec(v.revenueGenerated), repairExpenditure: reqDec(v.repairExpenditure) },
    }),
  "projects/nicra/others/village-wise-vcrmc": (v, ctx) =>
    prisma.nicraVillageWiseVcrmc.create({
      data: { ...ctx, villageName: reqStr(v.villageName), constitutionDate: date(v.constitutionDate), members: reqInt(v.members), meetingsOrganized: reqInt(v.meetingsOrganized), meetingDate: date(v.meetingDate), secretaryName: str(v.secretaryName) },
    }),
  "projects/nicra/others/soil-health-card": (v, ctx) =>
    prisma.nicraSoilHealthCard.create({
      data: { ...ctx, startDate: reqDate(v.startDate), endDate: reqDate(v.endDate), samplesCollected: reqInt(v.samplesCollected), samplesAnalysed: reqInt(v.samplesAnalysed), shcIssued: reqInt(v.shcIssued), farmersBenefitted: reqInt(v.farmersBenefitted) },
    }),
  "projects/nicra/others/convergence-programme": (v, ctx) =>
    prisma.nicraConvergenceProgramme.create({
      data: { ...ctx, startDate: reqDate(v.startDate), endDate: reqDate(v.endDate), scheme: reqStr(v.scheme), natureOfWork: reqStr(v.natureOfWork), amount: reqDec(v.amount) },
    }),
  "projects/nicra/others/dignitaries-visited-nicra-villages": (v, ctx) =>
    prisma.nicraDignitaryVisit.create({
      data: { ...ctx, vipExperts: reqStr(v.vipExperts), name: reqStr(v.name), dateOfVisit: reqDate(v.dateOfVisit) },
    }),
  "projects/nicra/others/pi-co-pi-list": (v, ctx) =>
    prisma.nicraPiCoPi.create({
      data: { ...ctx, startDate: reqDate(v.startDate), endDate: reqDate(v.endDate), piCoPi: reqStr(v.piCoPi), name: reqStr(v.name) },
    }),
  "projects/arya-safal/arya-safal-current-year": (v, ctx) =>
    prisma.aryaCurrentYearDetail.create({
      data: { ...ctx, enterprise: reqStr(v.enterprise), viableUnits: reqInt(v.viableUnits), closedUnits: reqInt(v.closedUnits), startDate: reqDate(v.startDate), endDate: reqDate(v.endDate), groupsFormed: reqInt(v.groupsFormed), groupsActive: reqInt(v.groupsActive) },
    }),
  "projects/arya-safal/arya-safal-previous-year": (v, ctx) =>
    prisma.aryaPreviousYearEvaluation.create({
      data: { ...ctx, enterprise: reqStr(v.enterprise), totalClosed: reqInt(v.totalClosed), closingDate: date(v.closingDate), totalRestarted: reqInt(v.totalRestarted), restartedDate: date(v.restartedDate) },
    }),
  "projects/natural-farming/nf-geographical": (v, ctx) =>
    prisma.nfGeographicalInfo.create({
      data: { ...ctx, startDate: reqDate(v.startDate), endDate: reqDate(v.endDate), agroClimaticZone: reqStr(v.agroClimaticZone), farmingSituation: reqStr(v.farmingSituation), latitude: reqDec(v.latitude), longitude: reqDec(v.longitude) },
    }),
  "projects/natural-farming/nf-physical": (v, ctx) =>
    prisma.nfPhysicalInfo.create({
      data: { ...ctx, activityName: reqStr(v.activityName), trainingTitle: reqStr(v.trainingTitle), trainingDate: reqDate(v.trainingDate), venue: reqStr(v.venue), participants: reqInt(v.participants) },
    }),
  "projects/natural-farming/nf-demonstration": (v, ctx) =>
    prisma.nfDemonstrationInfo.create({
      data: { ...ctx, farmerName: reqStr(v.farmerName), activityName: reqStr(v.activityName), crop: reqStr(v.crop), variety: reqStr(v.variety) },
    }),
  "projects/natural-farming/nf-already-practicing": (v, ctx) =>
    prisma.nfAlreadyPracticing.create({
      data: { ...ctx, farmerName: reqStr(v.farmerName), address: str(v.address), normalCropsGrown: str(v.normalCropsGrown), practicingYear: reqInt(v.practicingYear) },
    }),
  "projects/natural-farming/nf-beneficiaries": (v, ctx) =>
    prisma.nfBeneficiary.create({
      data: { ...ctx, numberOfBlock: reqInt(v.numberOfBlock), numberOfVillage: reqInt(v.numberOfVillage), numberOfTraining: reqInt(v.numberOfTraining), farmersInfluenced: reqInt(v.farmersInfluenced) },
    }),
  "projects/natural-farming/nf-soil-data": (v, ctx) =>
    prisma.nfSoilData.create({
      data: { ...ctx, season: reqStr(v.season), type: reqStr(v.type), crop: reqStr(v.crop), beforePh: reqDec(v.beforePh), beforeEc: reqDec(v.beforeEc), beforeEcOc: reqDec(v.beforeEcOc), afterPh: reqDec(v.afterPh), afterEc: reqDec(v.afterEc), afterEcOc: reqDec(v.afterEcOc) },
    }),
  "projects/natural-farming/nf-budget-expenditure": (v, ctx) =>
    prisma.nfBudgetExpenditure.create({
      data: { ...ctx, activityName: reqStr(v.activityName), activitiesOrganised: reqInt(v.activitiesOrganised), budgetSanction: reqDec(v.budgetSanction), budgetExpenditure: reqDec(v.budgetExpenditure), totalBudgetExpenditure: reqDec(v.totalBudgetExpenditure) },
    }),
  "projects/tsp-scsp/view-sub-plan-activity": (v, ctx) =>
    prisma.subPlanActivity.create({
      data: { ...ctx, type: v.type?.toUpperCase() === "SCSP" ? "SCSP" : "TSP", activities: reqStr(v.activities), noOfTraining: reqInt(v.noOfTraining), beneficiaries: reqInt(v.beneficiaries) },
    }),
  "projects/nari/nari-nutrition-garden": (v, ctx) =>
    prisma.nariNutritionGarden.create({
      data: { ...ctx, nutriSmartVillage: reqStr(v.nutriSmartVillage), typeOfNutritionalGarden: reqStr(v.typeOfNutritionalGarden), numbers: reqInt(v.numbers), areaSqm: reqDec(v.areaSqm) },
    }),
  "projects/nari/nari-bio-fortified": (v, ctx) =>
    prisma.nariBioFortified.create({
      data: { ...ctx, nutriSmartVillage: reqStr(v.nutriSmartVillage), season: reqStr(v.season), activity: reqStr(v.activity), categoryOfCrop: reqStr(v.categoryOfCrop) },
    }),
  "projects/nari/nari-value-addition": (v, ctx) =>
    prisma.nariValueAddition.create({
      data: { ...ctx, nutriSmartVillage: reqStr(v.nutriSmartVillage), cropName: reqStr(v.cropName), valueAddedProduct: reqStr(v.valueAddedProduct), activity: reqStr(v.activity) },
    }),
  "projects/nari/nari-training": (v, ctx) =>
    prisma.nariTraining.create({
      data: { ...ctx, nutriSmartVillage: reqStr(v.nutriSmartVillage), areaOfTraining: reqStr(v.areaOfTraining), activity: reqStr(v.activity), titleOfTraining: reqStr(v.titleOfTraining) },
    }),
  "projects/nari/nari-extension": (v, ctx) =>
    prisma.nariExtension.create({
      data: { ...ctx, nutriSmartVillage: reqStr(v.nutriSmartVillage), activity: reqStr(v.activity), nameOfActivity: reqStr(v.nameOfActivity), noOfActivities: reqInt(v.noOfActivities) },
    }),
  "projects/agri-drone/agri-drone-introduction": (v, ctx) =>
    prisma.agriDroneIntroduction.create({
      data: { ...ctx, year: reqInt(v.year), centreName: reqStr(v.centreName), companyOfDrone: reqStr(v.companyOfDrone), modelOfDrone: reqStr(v.modelOfDrone), dronesSanctioned: reqInt(v.dronesSanctioned), dronesPurchased: reqInt(v.dronesPurchased), amountSanctioned: reqDec(v.amountSanctioned) },
    }),
  "projects/agri-drone/agri-drone-demonstration": (v, ctx) =>
    prisma.agriDroneDemonstration.create({
      data: { ...ctx, centreName: reqStr(v.centreName), district: reqStr(v.district), dateOfDemos: reqDate(v.dateOfDemos), placeOfDemos: reqStr(v.placeOfDemos), cropName: reqStr(v.cropName), noOfDemos: reqInt(v.noOfDemos), areaCovered: reqDec(v.areaCovered), noOfFarmers: reqInt(v.noOfFarmers) },
    }),
  "projects/fpo-cbbo/fpo-cbbo-details": (v, ctx) =>
    prisma.fpoCbboDetail.create({
      data: { ...ctx, noOfBlocksAllocated: reqInt(v.noOfBlocksAllocated), noOfFposRegistered: reqInt(v.noOfFposRegistered), trainingReceived: str(v.trainingReceived), businessPlanPrepared: bool(v.businessPlanPrepared), noOfFposDoingBusiness: reqInt(v.noOfFposDoingBusiness) },
    }),
  "projects/fpo-cbbo/fpo-management": (v, ctx) =>
    prisma.fpoManagement.create({
      data: { ...ctx, registrationNo: reqStr(v.registrationNo), dateOfRegistration: reqDate(v.dateOfRegistration), fpoName: reqStr(v.fpoName), fpoAddress: str(v.fpoAddress), totalBomMembers: reqInt(v.totalBomMembers), financialPosition: str(v.financialPosition) },
    }),
  "projects/drmr/drmr-details": (v, ctx) =>
    prisma.drmrDetail.create({
      data: { ...ctx, varietiesUsedInIp: reqStr(v.varietiesUsedInIp), situations: reqStr(v.situations), varietiesUsedInFp: reqStr(v.varietiesUsedInFp), netReturnImprovedPractice: reqDec(v.netReturnImprovedPractice), netReturnFarmerPractice: reqDec(v.netReturnFarmerPractice) },
    }),
  "projects/drmr/drmr-activity": (v, ctx) =>
    prisma.drmrActivity.create({
      data: { ...ctx, startDate: reqDate(v.startDate), endDate: reqDate(v.endDate), training: str(v.training), flds: str(v.flds), awarenessCamps: str(v.awarenessCamps), distributionOfLiterature: str(v.distributionOfLiterature) },
    }),
  "projects/cra/cra-details": (v, ctx) =>
    prisma.craDetail.create({
      data: { ...ctx, season: reqStr(v.season), technologyDemonstrated: reqStr(v.technologyDemonstrated), croppingSystem: reqStr(v.croppingSystem), areaHa: reqDec(v.areaHa), noOfFarmer: reqInt(v.noOfFarmer) },
    }),
  "projects/cra/cra-extension-activity": (v, ctx) =>
    prisma.craExtensionActivity.create({
      data: { ...ctx, extensionActivity: reqStr(v.extensionActivity), startDate: reqDate(v.startDate), endDate: reqDate(v.endDate), withinOrWithoutState: str(v.withinOrWithoutState), exposureVisits: reqInt(v.exposureVisits), farmersUnderExposure: reqInt(v.farmersUnderExposure) },
    }),
  "projects/csisa/csisa-details": (v, ctx) =>
    prisma.csisaDetail.create({
      data: { ...ctx, season: reqStr(v.season), villageCovered: reqInt(v.villageCovered), blockCovered: reqInt(v.blockCovered), districtCovered: reqInt(v.districtCovered) },
    }),
  "projects/seed-hub/seed-hub-program": (v, ctx) =>
    prisma.seedHubProgram.create({
      data: { ...ctx, season: reqStr(v.season), cropName: reqStr(v.cropName), variety: reqStr(v.variety), areaHa: reqDec(v.areaHa), yieldHa: reqDec(v.yieldHa) },
    }),
  "projects/other-programmes/other-programme": (v, ctx) =>
    prisma.otherProgramme.create({
      data: { ...ctx, programmeName: reqStr(v.programmeName), programmeDate: reqDate(v.programmeDate), venue: str(v.venue), purpose: str(v.purpose), participants: reqInt(v.participants) },
    }),

  // --- Performance Indicators ---
  "performance/impact/impact-of-kvk-activities": (v, ctx) =>
    prisma.kvkActivityImpact.create({
      data: { ...ctx, specificArea: reqStr(v.specificArea), briefDetails: str(v.briefDetails), farmersBenefitted: reqInt(v.farmersBenefitted), horizontalSpread: str(v.horizontalSpread), adoptionPercent: reqDec(v.adoptionPercent) },
    }),
  "performance/impact/entrepreneurship-details": (v, ctx) =>
    prisma.entrepreneurshipDetail.create({
      data: { ...ctx, entrepreneurOrEnterprise: reqStr(v.entrepreneurOrEnterprise), enterpriseType: reqStr(v.enterpriseType), membersAssociated: reqInt(v.membersAssociated), annualIncome: reqDec(v.annualIncome) },
    }),
  "performance/impact/success-stories": (v, ctx) =>
    prisma.successStory.create({
      data: { ...ctx, farmerOrEntrepreneur: reqStr(v.farmerOrEntrepreneur), experience: str(v.experience), majorAchievement: reqStr(v.majorAchievement), storyTitle: reqStr(v.storyTitle) },
    }),
  "performance/district-village-performance/district-level-data": (v, ctx) =>
    prisma.districtLevelData.create({
      data: { ...ctx, reportingYear: reqInt(v.reportingYear), items: reqStr(v.items), information: str(v.information) },
    }),
  "performance/district-village-performance/operational-area-details": (v, ctx) =>
    prisma.operationalAreaDetail.create({
      data: { ...ctx, reportingYear: reqInt(v.reportingYear), taluk: str(v.taluk), block: reqStr(v.block), village: reqStr(v.village), majorCrops: str(v.majorCrops), majorProblems: str(v.majorProblems), thrustAreas: str(v.thrustAreas) },
    }),
  "performance/district-village-performance/village-adoption-programme": (v, ctx) =>
    prisma.villageAdoptionProgramme.create({
      data: { ...ctx, reportingYear: reqInt(v.reportingYear), village: reqStr(v.village), block: reqStr(v.block), actionTaken: str(v.actionTaken) },
    }),
  "performance/district-village-performance/priority-thrust-area": (v, ctx) =>
    prisma.priorityThrustArea.create({
      data: { ...ctx, reportingYear: reqInt(v.reportingYear), thrustArea: reqStr(v.thrustArea) },
    }),
  "performance/infrastructure-performance/demonstration-units": (v, ctx) =>
    prisma.demonstrationUnit.create({
      data: { ...ctx, demoUnitName: reqStr(v.demoUnitName), yearOfEstt: reqInt(v.yearOfEstt), areaSqMt: reqDec(v.areaSqMt) },
    }),
  "performance/infrastructure-performance/instructional-farm-crops": (v, ctx) =>
    prisma.instructionalFarmCrop.create({
      data: { ...ctx, cropName: reqStr(v.cropName), areaHa: reqDec(v.areaHa) },
    }),
  "performance/infrastructure-performance/production-units": (v, ctx) =>
    prisma.productionUnit.create({
      data: { ...ctx, productName: reqStr(v.productName), qty: reqDec(v.qty) },
    }),
  "performance/infrastructure-performance/instructional-farm-livestock": (v, ctx) =>
    prisma.instructionalFarmLivestock.create({
      data: { ...ctx, animalName: reqStr(v.animalName), speciesBreed: str(v.speciesBreed), produceType: str(v.produceType) },
    }),
  "performance/infrastructure-performance/hostel-utilization": (v, ctx) =>
    prisma.hostelUtilization.create({
      data: { ...ctx, months: reqStr(v.months), traineesStayed: reqInt(v.traineesStayed), traineeDays: reqInt(v.traineeDays) },
    }),
  "performance/infrastructure-performance/staff-quarters-performance": (v, ctx) =>
    prisma.staffQuartersPerformance.create({
      data: { ...ctx, noOfStaffQuarters: reqInt(v.noOfStaffQuarters), dateOfCompletion: date(v.dateOfCompletion), remark: str(v.remark) },
    }),
  "performance/infrastructure-performance/rain-water-harvesting": (v, ctx) =>
    prisma.rainWaterHarvesting.create({
      data: { ...ctx, trainingProgrammes: reqInt(v.trainingProgrammes), demonstrations: reqInt(v.demonstrations), plantMaterialProduced: reqInt(v.plantMaterialProduced), farmerVisits: reqInt(v.farmerVisits), officialVisits: reqInt(v.officialVisits) },
    }),
  "performance/financial-performance/budget-details": (v, ctx) =>
    prisma.budgetDetail.create({
      data: { ...ctx, salaryAllocation: reqDec(v.salaryAllocation), salaryExpenditure: reqDec(v.salaryExpenditure), generalGrantAllocation: reqDec(v.generalGrantAllocation), generalGrantExpenditure: reqDec(v.generalGrantExpenditure), capitalGrantAllocation: reqDec(v.capitalGrantAllocation), capitalGrantExpenditure: reqDec(v.capitalGrantExpenditure) },
    }),
  "performance/financial-performance/project-wise-budget-performance": (v, ctx) =>
    prisma.projectWiseBudgetPerformance.create({
      data: { ...ctx, projectName: reqStr(v.projectName), fundingAgency: str(v.fundingAgency), budgetEstimate: reqDec(v.budgetEstimate), budgetAllocated: reqDec(v.budgetAllocated), budgetReleased: reqDec(v.budgetReleased), expenditure: reqDec(v.expenditure), unspentBalance: reqDec(v.unspentBalance) },
    }),
  "performance/financial-performance/revolving-fund": (v, ctx) =>
    prisma.revolvingFund.create({
      data: { ...ctx, reportingYear: reqInt(v.reportingYear), openingBalance: reqDec(v.openingBalance), incomeDuringYear: reqDec(v.incomeDuringYear), expenditureDuringYear: reqDec(v.expenditureDuringYear), closing: reqDec(v.closing), kind: str(v.kind) },
    }),
  "performance/financial-performance/revenue-generation": (v, ctx) =>
    prisma.revenueGeneration.create({
      data: { ...ctx, headName: reqStr(v.headName), income: reqDec(v.income), sponsoringAgency: str(v.sponsoringAgency) },
    }),
  "performance/financial-performance/resource-generation": (v, ctx) =>
    prisma.resourceGeneration.create({
      data: { ...ctx, programmeName: reqStr(v.programmeName), purpose: str(v.purpose), sourcesOfFund: str(v.sourcesOfFund), amountLakhs: reqDec(v.amountLakhs) },
    }),
  "performance/linkages/functional-linkage": (v, ctx) =>
    prisma.functionalLinkage.create({
      data: { ...ctx, organizationName: reqStr(v.organizationName), natureOfLinkage: str(v.natureOfLinkage) },
    }),
  "performance/linkages/special-programmes": (v, ctx) =>
    prisma.specialProgramme.create({
      data: { ...ctx, programmeType: reqStr(v.programmeType), programmeName: reqStr(v.programmeName), initiationDate: date(v.initiationDate) },
    }),

  // --- Meetings ---
  "meetings/sac-meetings": (v, ctx) =>
    prisma.sacMeeting.create({
      data: { ...ctx, startDate: reqDate(v.startDate), endDate: reqDate(v.endDate), participants: reqInt(v.participants), statutoryMembers: reqInt(v.statutoryMembers), recommendations: str(v.recommendations), actionTaken: str(v.actionTaken), reason: str(v.reason), fileUrl: str(v.file) },
    }),
  "meetings/other-meetings": (v, ctx) =>
    prisma.otherMeeting.create({
      data: { ...ctx, date: reqDate(v.date), meetingType: reqStr(v.meetingType), agenda: str(v.agenda), representativeFromAtari: str(v.representativeFromAtari) },
    }),

  // --- Miscellaneous ---
  "miscellaneous/prevalent-diseases-crops": (v, ctx) =>
    prisma.prevalentDiseaseCrop.create({
      data: { ...ctx, diseaseName: reqStr(v.diseaseName), crop: reqStr(v.crop), outbreakDate: reqDate(v.outbreakDate), areaAffected: reqDec(v.areaAffected), commodityLossPercent: reqDec(v.commodityLossPercent), preventiveMeasures: str(v.preventiveMeasures) },
    }),
  "miscellaneous/prevalent-diseases-livestock": (v, ctx) =>
    prisma.prevalentDiseaseLivestock.create({
      data: { ...ctx, diseaseName: reqStr(v.diseaseName), speciesAffected: reqStr(v.speciesAffected), outbreakDate: reqDate(v.outbreakDate), mortalityMorbidity: str(v.mortalityMorbidity), animalsVaccinated: reqInt(v.animalsVaccinated), preventiveMeasures: str(v.preventiveMeasures) },
    }),
  "miscellaneous/nyk-training": (v, ctx) =>
    prisma.nykTraining.create({
      data: { ...ctx, programmeTitle: reqStr(v.programmeTitle), startDate: reqDate(v.startDate), endDate: reqDate(v.endDate), male: reqInt(v.male), female: reqInt(v.female), fundReceived: reqDec(v.fundReceived) },
    }),
  "miscellaneous/ppv-fra-sensitization/ppv-fra-training-programme": (v, ctx) =>
    prisma.ppvFraTrainingProgramme.create({
      data: { ...ctx, date: reqDate(v.date), title: reqStr(v.title), type: str(v.type), venue: str(v.venue), resourcePerson: str(v.resourcePerson), participants: reqInt(v.participants) },
    }),
  "miscellaneous/ppv-fra-sensitization/ppv-fra-farmer-details": (v, ctx) =>
    prisma.ppvFraFarmerDetail.create({
      data: { ...ctx, year: reqInt(v.year), crop: reqStr(v.crop), registrationNo: reqStr(v.registrationNo), farmerName: reqStr(v.farmerName), block: str(v.block), district: str(v.district) },
    }),
  "miscellaneous/rawe-fet-fit-programme": (v, ctx) =>
    prisma.raweFetFitProgramme.create({
      data: { ...ctx, startDate: reqDate(v.startDate), endDate: reqDate(v.endDate), attachmentType: reqStr(v.attachmentType), attachment: str(v.attachment), numberOfStudents: reqInt(v.numberOfStudents), daysStayed: reqInt(v.daysStayed) },
    }),
  "miscellaneous/vip-visitors": (v, ctx) =>
    prisma.vipVisitor.create({
      data: { ...ctx, visitDate: reqDate(v.visitDate), dignitaryType: reqStr(v.dignitaryType), ministerName: reqStr(v.ministerName), observations: str(v.observations) },
    }),
  "miscellaneous/digital-information/digital-mobile-app": (v, ctx) =>
    prisma.digitalMobileApp.create({
      data: { ...ctx, mobileAppsDeveloped: reqInt(v.mobileAppsDeveloped), appName: str(v.appName), appLanguage: str(v.appLanguage), meantFor: str(v.meantFor), timesDownloaded: reqInt(v.timesDownloaded) },
    }),
  "miscellaneous/digital-information/digital-web-portal": (v, ctx) =>
    prisma.digitalWebPortal.create({
      data: { ...ctx, visitors: reqInt(v.visitors), farmersRegistered: reqInt(v.farmersRegistered) },
    }),
  "miscellaneous/digital-information/digital-kisan-sarathi": (v, ctx) =>
    prisma.digitalKisanSarathi.create({
      data: { ...ctx, farmersRegisteredKsp: reqInt(v.farmersRegisteredKsp), phoneCallAddressed: reqInt(v.phoneCallAddressed), answeredCall: reqInt(v.answeredCall) },
    }),
  "miscellaneous/digital-information/digital-kmas": (v, ctx) =>
    prisma.digitalKmas.create({
      data: { ...ctx, farmersCovered: reqInt(v.farmersCovered), advisoriesSent: reqInt(v.advisoriesSent), messagesCrop: bool(v.messagesCrop), messagesLivestock: bool(v.messagesLivestock), messagesWeather: bool(v.messagesWeather), messagesMarketing: bool(v.messagesMarketing), messagesAwareness: bool(v.messagesAwareness), messagesOtherEnterprises: bool(v.messagesOtherEnterprises), messagesAnyOther: str(v.messagesAnyOther) },
    }),
  "miscellaneous/digital-information/digital-other-channels": (v, ctx) =>
    prisma.digitalOtherChannel.create({
      data: { ...ctx, textAdvisories: reqInt(v.textAdvisories), textFarmers: reqInt(v.textFarmers), whatsappAdvisories: reqInt(v.whatsappAdvisories), whatsappFarmers: reqInt(v.whatsappFarmers), socialMediaAdvisories: reqInt(v.socialMediaAdvisories), socialMediaFarmers: reqInt(v.socialMediaFarmers), weatherBulletinAdvisories: reqInt(v.weatherBulletinAdvisories), weatherBulletinFarmers: reqInt(v.weatherBulletinFarmers) },
    }),
};

type DeleteFn = (id: string, ctx: RecordContext) => Promise<{ count: number }>;

/**
 * One entry per LEAF_RECORD_REGISTRY key - deletes are scoped to the
 * signed-in KVK Admin's own kvkId, so `count` comes back 0 (treated as
 * not-found/not-authorized by the route, not silently ignored) for any id
 * that doesn't exist or belongs to a different KVK. Most models carry kvkId
 * directly; the handful of child-table leaves (Staff Transferred, Vehicle/
 * Equipment Status, FLD Extension Training/Technical Feedback) verify
 * ownership through their parent relation instead, since they don't have
 * their own kvkId column.
 */
export const LEAF_DELETE_REGISTRY: Record<string, DeleteFn> = {
  "about-kvk/basic/bank-account-details": (id, ctx) => prisma.bankAccount.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "about-kvk/employee/staff-transferred": (id, ctx) => prisma.staffTransfer.deleteMany({ where: { id, toKvkId: ctx.kvkId } }),
  "about-kvk/infrastructure/infrastructure-details": (id, ctx) => prisma.infrastructure.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "about-kvk/infrastructure/land-details": (id, ctx) => prisma.land.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "about-kvk/infrastructure/staff-quarters": (id, ctx) => prisma.staffQuarters.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "about-kvk/vehicles/view-vehicles": (id, ctx) => prisma.vehicle.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "about-kvk/vehicles/vehicle-details": (id, ctx) => prisma.vehicleStatus.deleteMany({ where: { id, vehicle: { kvkId: ctx.kvkId } } }),
  "about-kvk/equipments/view-equipments": (id, ctx) => prisma.equipment.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "about-kvk/equipments/equipment-details": (id, ctx) => prisma.equipmentStatus.deleteMany({ where: { id, equipment: { kvkId: ctx.kvkId } } }),
  "about-kvk/employee/employee-details": (id, ctx) => prisma.staff.deleteMany({ where: { id, kvkId: ctx.kvkId } }),

  "achievements/oft": (id, ctx) => prisma.oft.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "achievements/front-line-demonstration/view-fld": (id, ctx) => prisma.fld.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "achievements/front-line-demonstration/fld-extension-training": (id, ctx) => prisma.fldExtensionTraining.deleteMany({ where: { id, fld: { kvkId: ctx.kvkId } } }),
  "achievements/front-line-demonstration/fld-technical-feedback": (id, ctx) => prisma.fldTechnicalFeedback.deleteMany({ where: { id, fld: { kvkId: ctx.kvkId } } }),
  "achievements/trainings": (id, ctx) => prisma.training.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "achievements/extension/extension-activities": (id, ctx) => prisma.extensionActivity.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "achievements/extension/other-extension-activities": (id, ctx) => prisma.otherExtensionActivity.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "achievements/special-days/celebration-days": (id, ctx) => prisma.celebrationDay.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "achievements/swachhta-bharat-abhiyaan/sewa": (id, ctx) => prisma.swachhtaObservance.deleteMany({ where: { id, kvkId: ctx.kvkId, kind: "SEWA" } }),
  "achievements/swachhta-bharat-abhiyaan/pakhwada": (id, ctx) => prisma.swachhtaObservance.deleteMany({ where: { id, kvkId: ctx.kvkId, kind: "PAKHWADA" } }),
  "achievements/swachhta-bharat-abhiyaan/budget-expenditure": (id, ctx) => prisma.swachhtaBudgetExpenditure.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "achievements/special-days/poshan-maaha": (id, ctx) => prisma.poshanMaaha.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "achievements/production-supply": (id, ctx) => prisma.technologyProductProduction.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "achievements/soil-water/soil-testing-equipment": (id, ctx) => prisma.soilTestingEquipment.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "achievements/soil-water/soil-water-testing": (id, ctx) => prisma.soilWaterPlantAnalysis.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "achievements/publications": (id, ctx) => prisma.publication.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "achievements/hrd": (id, ctx) => prisma.humanResourceDevelopment.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "achievements/awards/kvk": (id, ctx) => prisma.kvkAward.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "achievements/awards/scientist": (id, ctx) => prisma.scientistAward.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "achievements/awards/farmer": (id, ctx) => prisma.farmerAward.deleteMany({ where: { id, kvkId: ctx.kvkId } }),

  "projects/cfld/technical-parameter": (id, ctx) => prisma.cfldTechnicalParameter.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/cfld/extension-activity-cfld": (id, ctx) => prisma.cfldExtensionActivity.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/cfld/budget-utilization": (id, ctx) => prisma.cfldBudgetUtilization.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/cfld/crop-wise-images": (id, ctx) => prisma.cfldCropWiseImage.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/nicra/basic-information": (id, ctx) => prisma.nicraBasicInformation.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/nicra/details": (id, ctx) => prisma.nicraDetails.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/nicra/training": (id, ctx) => prisma.nicraTraining.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/nicra/extension-activity-nicra": (id, ctx) => prisma.nicraExtensionActivity.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/nicra/others/intervention": (id, ctx) => prisma.nicraIntervention.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/nicra/others/revenue-generated": (id, ctx) => prisma.nicraRevenueGenerated.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/nicra/others/custom-hiring-farm-implement": (id, ctx) => prisma.nicraCustomHiringFarmImplement.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/nicra/others/village-wise-vcrmc": (id, ctx) => prisma.nicraVillageWiseVcrmc.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/nicra/others/soil-health-card": (id, ctx) => prisma.nicraSoilHealthCard.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/nicra/others/convergence-programme": (id, ctx) => prisma.nicraConvergenceProgramme.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/nicra/others/dignitaries-visited-nicra-villages": (id, ctx) => prisma.nicraDignitaryVisit.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/nicra/others/pi-co-pi-list": (id, ctx) => prisma.nicraPiCoPi.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/arya-safal/arya-safal-current-year": (id, ctx) => prisma.aryaCurrentYearDetail.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/arya-safal/arya-safal-previous-year": (id, ctx) => prisma.aryaPreviousYearEvaluation.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/natural-farming/nf-geographical": (id, ctx) => prisma.nfGeographicalInfo.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/natural-farming/nf-physical": (id, ctx) => prisma.nfPhysicalInfo.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/natural-farming/nf-demonstration": (id, ctx) => prisma.nfDemonstrationInfo.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/natural-farming/nf-already-practicing": (id, ctx) => prisma.nfAlreadyPracticing.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/natural-farming/nf-beneficiaries": (id, ctx) => prisma.nfBeneficiary.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/natural-farming/nf-soil-data": (id, ctx) => prisma.nfSoilData.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/natural-farming/nf-budget-expenditure": (id, ctx) => prisma.nfBudgetExpenditure.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/tsp-scsp/view-sub-plan-activity": (id, ctx) => prisma.subPlanActivity.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/nari/nari-nutrition-garden": (id, ctx) => prisma.nariNutritionGarden.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/nari/nari-bio-fortified": (id, ctx) => prisma.nariBioFortified.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/nari/nari-value-addition": (id, ctx) => prisma.nariValueAddition.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/nari/nari-training": (id, ctx) => prisma.nariTraining.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/nari/nari-extension": (id, ctx) => prisma.nariExtension.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/agri-drone/agri-drone-introduction": (id, ctx) => prisma.agriDroneIntroduction.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/agri-drone/agri-drone-demonstration": (id, ctx) => prisma.agriDroneDemonstration.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/fpo-cbbo/fpo-cbbo-details": (id, ctx) => prisma.fpoCbboDetail.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/fpo-cbbo/fpo-management": (id, ctx) => prisma.fpoManagement.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/drmr/drmr-details": (id, ctx) => prisma.drmrDetail.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/drmr/drmr-activity": (id, ctx) => prisma.drmrActivity.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/cra/cra-details": (id, ctx) => prisma.craDetail.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/cra/cra-extension-activity": (id, ctx) => prisma.craExtensionActivity.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/csisa/csisa-details": (id, ctx) => prisma.csisaDetail.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/seed-hub/seed-hub-program": (id, ctx) => prisma.seedHubProgram.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "projects/other-programmes/other-programme": (id, ctx) => prisma.otherProgramme.deleteMany({ where: { id, kvkId: ctx.kvkId } }),

  "performance/impact/impact-of-kvk-activities": (id, ctx) => prisma.kvkActivityImpact.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "performance/impact/entrepreneurship-details": (id, ctx) => prisma.entrepreneurshipDetail.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "performance/impact/success-stories": (id, ctx) => prisma.successStory.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "performance/district-village-performance/district-level-data": (id, ctx) => prisma.districtLevelData.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "performance/district-village-performance/operational-area-details": (id, ctx) => prisma.operationalAreaDetail.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "performance/district-village-performance/village-adoption-programme": (id, ctx) => prisma.villageAdoptionProgramme.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "performance/district-village-performance/priority-thrust-area": (id, ctx) => prisma.priorityThrustArea.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "performance/infrastructure-performance/demonstration-units": (id, ctx) => prisma.demonstrationUnit.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "performance/infrastructure-performance/instructional-farm-crops": (id, ctx) => prisma.instructionalFarmCrop.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "performance/infrastructure-performance/production-units": (id, ctx) => prisma.productionUnit.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "performance/infrastructure-performance/instructional-farm-livestock": (id, ctx) => prisma.instructionalFarmLivestock.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "performance/infrastructure-performance/hostel-utilization": (id, ctx) => prisma.hostelUtilization.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "performance/infrastructure-performance/staff-quarters-performance": (id, ctx) => prisma.staffQuartersPerformance.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "performance/infrastructure-performance/rain-water-harvesting": (id, ctx) => prisma.rainWaterHarvesting.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "performance/financial-performance/budget-details": (id, ctx) => prisma.budgetDetail.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "performance/financial-performance/project-wise-budget-performance": (id, ctx) => prisma.projectWiseBudgetPerformance.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "performance/financial-performance/revolving-fund": (id, ctx) => prisma.revolvingFund.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "performance/financial-performance/revenue-generation": (id, ctx) => prisma.revenueGeneration.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "performance/financial-performance/resource-generation": (id, ctx) => prisma.resourceGeneration.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "performance/linkages/functional-linkage": (id, ctx) => prisma.functionalLinkage.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "performance/linkages/special-programmes": (id, ctx) => prisma.specialProgramme.deleteMany({ where: { id, kvkId: ctx.kvkId } }),

  "meetings/sac-meetings": (id, ctx) => prisma.sacMeeting.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "meetings/other-meetings": (id, ctx) => prisma.otherMeeting.deleteMany({ where: { id, kvkId: ctx.kvkId } }),

  "miscellaneous/prevalent-diseases-crops": (id, ctx) => prisma.prevalentDiseaseCrop.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "miscellaneous/prevalent-diseases-livestock": (id, ctx) => prisma.prevalentDiseaseLivestock.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "miscellaneous/nyk-training": (id, ctx) => prisma.nykTraining.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "miscellaneous/ppv-fra-sensitization/ppv-fra-training-programme": (id, ctx) => prisma.ppvFraTrainingProgramme.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "miscellaneous/ppv-fra-sensitization/ppv-fra-farmer-details": (id, ctx) => prisma.ppvFraFarmerDetail.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "miscellaneous/rawe-fet-fit-programme": (id, ctx) => prisma.raweFetFitProgramme.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "miscellaneous/vip-visitors": (id, ctx) => prisma.vipVisitor.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "miscellaneous/digital-information/digital-mobile-app": (id, ctx) => prisma.digitalMobileApp.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "miscellaneous/digital-information/digital-web-portal": (id, ctx) => prisma.digitalWebPortal.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "miscellaneous/digital-information/digital-kisan-sarathi": (id, ctx) => prisma.digitalKisanSarathi.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "miscellaneous/digital-information/digital-kmas": (id, ctx) => prisma.digitalKmas.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "miscellaneous/digital-information/digital-other-channels": (id, ctx) => prisma.digitalOtherChannel.deleteMany({ where: { id, kvkId: ctx.kvkId } }),

  "achievements/technology-week-celebration": (id, ctx) => prisma.technologyWeekCelebration.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
  "achievements/world-soil-day": (id, ctx) => prisma.worldSoilDay.deleteMany({ where: { id, kvkId: ctx.kvkId } }),
};

type UpdateFn = (id: string, values: Record<string, string>, ctx: RecordContext) => Promise<{ count: number }>;

/**
 * One entry per LEAF_RECORD_REGISTRY key - same field parsing as create,
 * targeted at an existing row instead of a new one. `updateMany` (not
 * `update`) so the `kvkId`/parent-relation ownership check is baked into
 * the `where` clause itself: `count: 0` means either the id doesn't exist
 * or belongs to a different KVK, same signal the delete registry uses.
 * Relational child leaves (Staff Transferred, Vehicle/Equipment Status, FLD
 * Extension Training/Technical Feedback) update their own fields only - an
 * edit doesn't re-parent the row to a different KVK/Vehicle/Equipment/FLD.
 */
export const LEAF_UPDATE_REGISTRY: Record<string, UpdateFn> = {
  "about-kvk/basic/bank-account-details": (id, v, ctx) =>
    prisma.bankAccount.updateMany({
      where: { id, kvkId: ctx.kvkId },
      data: { accountType: reqStr(v.accountType), accountName: reqStr(v.accountName), bankName: reqStr(v.bankName), location: str(v.location), accountNumber: reqStr(v.accountNumber) },
    }),
  "about-kvk/employee/employee-details": (id, v, ctx) =>
    prisma.staff.updateMany({
      where: { id, kvkId: ctx.kvkId },
      data: {
        sanctionedPost: reqStr(v.sanctionedPost),
        name: reqStr(v.name),
        mobile: str(v.mobile),
        email: str(v.email),
        payScale: str(v.payScale),
        discipline: str(v.discipline),
        dateOfBirth: date(v.dateOfBirth),
        dateOfJoining: date(v.dateOfJoining),
        jobType: str(v.jobType),
        allowances: str(v.allowances),
        category: str(v.casteCategory),
      },
    }),
  "about-kvk/infrastructure/infrastructure-details": (id, v, ctx) =>
    prisma.infrastructure.updateMany({
      where: { id, kvkId: ctx.kvkId },
      data: {
        infrastructureName: reqStr(v.infraMasterName),
        notYetStarted: bool(v.notYetStarted),
        completedPlinthLevel: bool(v.completedPlinthLevel),
        completedLintelLevel: bool(v.completedLintelLevel),
        completedRoofLevel: bool(v.completedRoofLevel),
        totallyCompleted: bool(v.totallyCompleted),
        plinthAreaSqM: dec(v.plinthAreaSqM),
        underUse: bool(v.underUse),
        sourceOfFunding: str(v.sourceOfFunding),
      },
    }),
  "about-kvk/infrastructure/land-details": (id, v, ctx) =>
    prisma.land.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { item: reqStr(v.item), areaHa: reqDec(v.areaHa) } }),
  "about-kvk/infrastructure/staff-quarters": (id, v, ctx) =>
    prisma.staffQuarters.updateMany({
      where: { id, kvkId: ctx.kvkId },
      data: { numberOfQuarters: reqInt(v.noOfStaffQuarters), dateOfCompletion: date(v.dateOfCompletion), remark: str(v.remark) },
    }),
  "about-kvk/vehicles/view-vehicles": (id, v, ctx) =>
    prisma.vehicle.updateMany({
      where: { id, kvkId: ctx.kvkId },
      data: { name: reqStr(v.vehicleName), registrationNo: reqStr(v.registrationNo), yearOfPurchase: reqInt(v.yearOfPurchase), cost: reqDec(v.totalCost) },
    }),
  "about-kvk/vehicles/vehicle-details": (id, v, ctx) =>
    prisma.vehicleStatus.updateMany({
      where: { id, vehicle: { kvkId: ctx.kvkId } },
      data: { reportingYear: reqInt(v.reportingYear), totalRunKmHrs: dec(v.totalRunKms) },
    }),
  "about-kvk/equipments/view-equipments": (id, v, ctx) =>
    prisma.equipment.updateMany({
      where: { id, kvkId: ctx.kvkId },
      data: { name: reqStr(v.equipmentName), yearOfPurchase: reqInt(v.yearOfPurchase), cost: reqDec(v.totalCost) },
    }),
  "about-kvk/equipments/equipment-details": (id, v, ctx) =>
    prisma.equipmentStatus.updateMany({
      where: { id, equipment: { kvkId: ctx.kvkId } },
      data: { reportingYear: reqInt(v.reportingYear), sourceOfFund: str(v.sourceOfFund) },
    }),
  "about-kvk/employee/staff-transferred": (id, v, ctx) =>
    prisma.staffTransfer.updateMany({
      where: { id, toKvkId: ctx.kvkId },
      data: { transferDate: reqDate(v.transferDate) },
    }),

  "achievements/oft": (id, v, ctx) =>
    prisma.oft.updateMany({
      where: { id, kvkId: ctx.kvkId },
      data: {
        reportingYear: reqInt(v.reportingYear),
        discipline: reqStr(v.discipline),
        staff: reqStr(v.staff),
        thematicArea: reqStr(v.thematicArea),
        trialOnForm: reqStr(v.trialOnForm),
        problemDiagnosed: str(v.problemDiagnosed),
        sourceOfTechnology: str(v.sourceOfTechnology),
        productionSystem: str(v.productionSystem),
        performanceIndicators: str(v.performanceIndicators),
        finalRecommendation: str(v.finalRecommendation),
        constraintsIdentified: str(v.constraintsIdentified),
        farmersParticipationProcess: str(v.farmersParticipationProcess),
        quantity: dec(v.quantity),
        unit: str(v.unit),
        noOfTrialReplicationFarmer: int(v.noOfTrialReplicationFarmer),
        startMonth: date(v.startMonth),
        endMonth: date(v.endMonth),
        criticalInput: str(v.criticalInput),
        costOfOft: dec(v.costOfOft),
        fundingAgency: str(v.fundingAgency),
        status: v.status?.toLowerCase().includes("complet") ? "COMPLETED" : "ONGOING",
      },
    }),
  "achievements/front-line-demonstration/view-fld": (id, v, ctx) =>
    prisma.fld.updateMany({
      where: { id, kvkId: ctx.kvkId },
      data: {
        reportingYear: reqInt(v.reportingYear),
        startDate: date(v.startDate),
        endDate: date(v.endDate),
        category: reqStr(v.category),
        subCategory: reqStr(v.subCategory),
        technologyDemonstrated: reqStr(v.technologyDemonstrated),
        status: v.status?.toLowerCase().includes("complet") ? "COMPLETED" : "ONGOING",
      },
    }),
  "achievements/front-line-demonstration/fld-extension-training": (id, v, ctx) =>
    prisma.fldExtensionTraining.updateMany({
      where: { id, fld: { kvkId: ctx.kvkId } },
      data: { activity: reqStr(v.activity), date: reqDate(v.date), activityCount: reqInt(v.activityCount), participantCount: reqInt(v.participantCount), remark: str(v.remark) },
    }),
  "achievements/front-line-demonstration/fld-technical-feedback": (id, v, ctx) =>
    prisma.fldTechnicalFeedback.updateMany({
      where: { id, fld: { kvkId: ctx.kvkId } },
      data: { crop: reqStr(v.crop), feedback: reqStr(v.feedback) },
    }),
  "achievements/trainings": (id, v, ctx) =>
    prisma.training.updateMany({
      where: { id, kvkId: ctx.kvkId },
      data: { reportingYear: reqInt(v.reportingYear), startDate: date(v.startDate), endDate: date(v.endDate), program: reqStr(v.program), title: reqStr(v.title), venue: str(v.venue), trainingDiscipline: str(v.trainingDiscipline), thematicArea: str(v.thematicArea) },
    }),
  "achievements/extension/extension-activities": (id, v, ctx) =>
    prisma.extensionActivity.updateMany({
      where: { id, kvkId: ctx.kvkId },
      data: { reportingYear: reqInt(v.reportingYear), startDate: date(v.startDate), endDate: date(v.endDate), natureOfExtensionActivity: reqStr(v.natureOfExtensionActivity), noOfActivities: reqInt(v.noOfActivities), noOfParticipants: reqInt(v.noOfParticipants) },
    }),
  "achievements/extension/other-extension-activities": (id, v, ctx) =>
    prisma.otherExtensionActivity.updateMany({
      where: { id, kvkId: ctx.kvkId },
      data: { reportingYear: reqInt(v.reportingYear), natureOfExtensionActivity: reqStr(v.natureOfExtensionActivity), noOfActivities: reqInt(v.noOfActivities) },
    }),
  "achievements/special-days/celebration-days": (id, v, ctx) =>
    prisma.celebrationDay.updateMany({
      where: { id, kvkId: ctx.kvkId },
      data: { importantDay: reqStr(v.importantDay), eventDate: reqDate(v.eventDate), noOfActivities: reqInt(v.noOfActivities) },
    }),
  "achievements/swachhta-bharat-abhiyaan/sewa": (id, v, ctx) =>
    prisma.swachhtaObservance.updateMany({
      where: { id, kvkId: ctx.kvkId, kind: "SEWA" },
      data: { dateDurationOfObservation: reqStr(v.dateDurationOfObservation), totalNoOfActivitiesUndertaken: reqInt(v.totalNoOfActivitiesUndertaken), noOfStaffs: reqInt(v.noOfStaffs), noOfFarmers: reqInt(v.noOfFarmers) },
    }),
  "achievements/swachhta-bharat-abhiyaan/pakhwada": (id, v, ctx) =>
    prisma.swachhtaObservance.updateMany({
      where: { id, kvkId: ctx.kvkId, kind: "PAKHWADA" },
      data: { dateDurationOfObservation: reqStr(v.dateDurationOfObservation), totalNoOfActivitiesUndertaken: reqInt(v.totalNoOfActivitiesUndertaken), noOfStaffs: reqInt(v.noOfStaffs), noOfFarmers: reqInt(v.noOfFarmers) },
    }),
  "achievements/swachhta-bharat-abhiyaan/budget-expenditure": (id, v, ctx) =>
    prisma.swachhtaBudgetExpenditure.updateMany({
      where: { id, kvkId: ctx.kvkId },
      data: { reportingYear: reqInt(v.reportingYear), vermicompostingVillagesCovered: reqInt(v.vermicompostingVillagesCovered), vermicompostingTotalExpenditure: reqDec(v.vermicompostingTotalExpenditure) },
    }),
  "achievements/special-days/poshan-maaha": (id, v, ctx) =>
    prisma.poshanMaaha.updateMany({
      where: { id, kvkId: ctx.kvkId },
      data: {
        activityDate: reqDate(v.activityDate),
        activitiesConducted: reqStr(v.activitiesConducted),
        eventName: reqStr(v.eventName),
        saplingsPlanted: reqInt(v.saplingsPlanted),
        vegetableKits: reqInt(v.vegetableKits),
        participantsGirls: reqInt(v.participantsGirls),
        participantsPublicRepresentatives: reqInt(v.participantsPublicRepresentatives),
        participantsFarmWoman: reqInt(v.participantsFarmWoman),
        participantsFarmers: reqInt(v.participantsFarmers),
        participantsAganwadiWorkers: reqInt(v.participantsAganwadiWorkers),
        participantsGovtOfficials: reqInt(v.participantsGovtOfficials),
        totalParticipants: reqInt(v.totalParticipants),
      },
    }),
  "achievements/production-supply": (id, v, ctx) =>
    prisma.technologyProductProduction.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { category: reqStr(v.category), variety: reqStr(v.variety), quantity: reqDec(v.quantity) } }),
  "achievements/soil-water/soil-testing-equipment": (id, v, ctx) =>
    prisma.soilTestingEquipment.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { analysis: reqStr(v.analysis), equipmentName: reqStr(v.equipmentName), quantity: reqInt(v.quantity) } }),
  "achievements/soil-water/soil-water-testing": (id, v, ctx) =>
    prisma.soilWaterPlantAnalysis.updateMany({
      where: { id, kvkId: ctx.kvkId },
      data: { startDate: reqDate(v.startDate), endDate: reqDate(v.endDate), analysis: reqStr(v.analysis), noOfSamplesAnalyzed: reqInt(v.noOfSamplesAnalyzed), noOfVillagesCovered: reqInt(v.noOfVillagesCovered), amountRealized: reqDec(v.amountRealized) },
    }),
  "achievements/publications": (id, v, ctx) =>
    prisma.publication.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { itemName: reqStr(v.itemName), title: reqStr(v.title), authorName: reqStr(v.authorName), journalName: str(v.journalName) } }),
  "achievements/hrd": (id, v, ctx) =>
    prisma.humanResourceDevelopment.updateMany({
      where: { id, kvkId: ctx.kvkId },
      data: { staff: reqStr(v.staff), course: reqStr(v.course), startDate: date(v.startDate), endDate: date(v.endDate), venue: str(v.venue), organizer: str(v.organizer) },
    }),
  "achievements/awards/kvk": (id, v, ctx) =>
    prisma.kvkAward.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { award: reqStr(v.award), amount: reqDec(v.amount), achievement: str(v.achievement), conferringAuthority: str(v.conferringAuthority) } }),
  "achievements/awards/scientist": (id, v, ctx) =>
    prisma.scientistAward.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { headScientist: reqStr(v.headScientist), award: reqStr(v.award), amount: reqDec(v.amount), achievement: str(v.achievement), conferringAuthority: str(v.conferringAuthority) } }),
  "achievements/awards/farmer": (id, v, ctx) =>
    prisma.farmerAward.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { farmerName: reqStr(v.farmerName), address: str(v.address), contactNumber: str(v.contactNumber), award: reqStr(v.award), amount: reqDec(v.amount), achievement: str(v.achievement), conferringAuthority: str(v.conferringAuthority) } }),

  "projects/cfld/extension-activity-cfld": (id, v, ctx) =>
    prisma.cfldExtensionActivity.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { season: reqStr(v.season), activitiesOrganized: reqStr(v.activitiesOrganized), date: reqDate(v.date), placeOfActivity: reqStr(v.placeOfActivity), farmersAttended: reqInt(v.farmersAttended) } }),
  "projects/cfld/budget-utilization": (id, v, ctx) =>
    prisma.cfldBudgetUtilization.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { crop: reqStr(v.crop), season: reqStr(v.season), overallFundAllocation: reqDec(v.overallFundAllocation) } }),
  "projects/cfld/crop-wise-images": (id, v, ctx) =>
    prisma.cfldCropWiseImage.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { crop: reqStr(v.crop) } }),
  "projects/nicra/basic-information": (id, v, ctx) =>
    prisma.nicraBasicInformation.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { rfDistrictNormal: dec(v.rfDistrictNormal), rfDistrictReceived: dec(v.rfDistrictReceived), maxTemperature: dec(v.maxTemperature), minTemperature: dec(v.minTemperature) } }),
  "projects/nicra/details": (id, v, ctx) =>
    prisma.nicraDetails.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { cropName: reqStr(v.cropName), seasonName: reqStr(v.seasonName), technologyDemonstration: reqStr(v.technologyDemonstration), noOfFarmers: reqInt(v.noOfFarmers) } }),
  "projects/nicra/training": (id, v, ctx) =>
    prisma.nicraTraining.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { title: reqStr(v.title), startDate: reqDate(v.startDate), endDate: reqDate(v.endDate), farmersAttended: reqInt(v.farmersAttended) } }),
  "projects/nicra/extension-activity-nicra": (id, v, ctx) =>
    prisma.nicraExtensionActivity.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { activityName: reqStr(v.activityName), places: reqStr(v.places), startDate: reqDate(v.startDate), endDate: reqDate(v.endDate), farmersAttended: reqInt(v.farmersAttended) } }),
  "projects/nicra/others/intervention": (id, v, ctx) =>
    prisma.nicraIntervention.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { startDate: reqDate(v.startDate), endDate: reqDate(v.endDate), seedBankFodderBank: reqStr(v.seedBankFodderBank), crop: reqStr(v.crop), variety: reqStr(v.variety), quantityQuintal: reqDec(v.quantity) } }),
  "projects/nicra/others/revenue-generated": (id, v, ctx) =>
    prisma.nicraRevenueGenerated.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { year: reqInt(v.year), revenue: reqDec(v.revenue), total: reqDec(v.total) } }),
  "projects/nicra/others/custom-hiring-farm-implement": (id, v, ctx) =>
    prisma.nicraCustomHiringFarmImplement.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { farmImplementName: reqStr(v.farmImplementName), farmersUsed: reqInt(v.farmersUsed), areaCovered: reqDec(v.areaCovered), hoursUsed: reqDec(v.hoursUsed), revenueGenerated: reqDec(v.revenueGenerated), repairExpenditure: reqDec(v.repairExpenditure) } }),
  "projects/nicra/others/village-wise-vcrmc": (id, v, ctx) =>
    prisma.nicraVillageWiseVcrmc.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { villageName: reqStr(v.villageName), constitutionDate: date(v.constitutionDate), members: reqInt(v.members), meetingsOrganized: reqInt(v.meetingsOrganized), meetingDate: date(v.meetingDate), secretaryName: str(v.secretaryName) } }),
  "projects/nicra/others/soil-health-card": (id, v, ctx) =>
    prisma.nicraSoilHealthCard.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { startDate: reqDate(v.startDate), endDate: reqDate(v.endDate), samplesCollected: reqInt(v.samplesCollected), samplesAnalysed: reqInt(v.samplesAnalysed), shcIssued: reqInt(v.shcIssued), farmersBenefitted: reqInt(v.farmersBenefitted) } }),
  "projects/nicra/others/convergence-programme": (id, v, ctx) =>
    prisma.nicraConvergenceProgramme.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { startDate: reqDate(v.startDate), endDate: reqDate(v.endDate), scheme: reqStr(v.scheme), natureOfWork: reqStr(v.natureOfWork), amount: reqDec(v.amount) } }),
  "projects/nicra/others/dignitaries-visited-nicra-villages": (id, v, ctx) =>
    prisma.nicraDignitaryVisit.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { vipExperts: reqStr(v.vipExperts), name: reqStr(v.name), dateOfVisit: reqDate(v.dateOfVisit) } }),
  "projects/nicra/others/pi-co-pi-list": (id, v, ctx) =>
    prisma.nicraPiCoPi.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { startDate: reqDate(v.startDate), endDate: reqDate(v.endDate), piCoPi: reqStr(v.piCoPi), name: reqStr(v.name) } }),
  "projects/arya-safal/arya-safal-current-year": (id, v, ctx) =>
    prisma.aryaCurrentYearDetail.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { enterprise: reqStr(v.enterprise), viableUnits: reqInt(v.viableUnits), closedUnits: reqInt(v.closedUnits), startDate: reqDate(v.startDate), endDate: reqDate(v.endDate), groupsFormed: reqInt(v.groupsFormed), groupsActive: reqInt(v.groupsActive) } }),
  "projects/arya-safal/arya-safal-previous-year": (id, v, ctx) =>
    prisma.aryaPreviousYearEvaluation.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { enterprise: reqStr(v.enterprise), totalClosed: reqInt(v.totalClosed), closingDate: date(v.closingDate), totalRestarted: reqInt(v.totalRestarted), restartedDate: date(v.restartedDate) } }),
  "projects/natural-farming/nf-geographical": (id, v, ctx) =>
    prisma.nfGeographicalInfo.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { startDate: reqDate(v.startDate), endDate: reqDate(v.endDate), agroClimaticZone: reqStr(v.agroClimaticZone), farmingSituation: reqStr(v.farmingSituation), latitude: reqDec(v.latitude), longitude: reqDec(v.longitude) } }),
  "projects/natural-farming/nf-physical": (id, v, ctx) =>
    prisma.nfPhysicalInfo.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { activityName: reqStr(v.activityName), trainingTitle: reqStr(v.trainingTitle), trainingDate: reqDate(v.trainingDate), venue: reqStr(v.venue), participants: reqInt(v.participants) } }),
  "projects/natural-farming/nf-demonstration": (id, v, ctx) =>
    prisma.nfDemonstrationInfo.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { farmerName: reqStr(v.farmerName), activityName: reqStr(v.activityName), crop: reqStr(v.crop), variety: reqStr(v.variety) } }),
  "projects/natural-farming/nf-already-practicing": (id, v, ctx) =>
    prisma.nfAlreadyPracticing.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { farmerName: reqStr(v.farmerName), address: str(v.address), normalCropsGrown: str(v.normalCropsGrown), practicingYear: reqInt(v.practicingYear) } }),
  "projects/natural-farming/nf-beneficiaries": (id, v, ctx) =>
    prisma.nfBeneficiary.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { numberOfBlock: reqInt(v.numberOfBlock), numberOfVillage: reqInt(v.numberOfVillage), numberOfTraining: reqInt(v.numberOfTraining), farmersInfluenced: reqInt(v.farmersInfluenced) } }),
  "projects/natural-farming/nf-soil-data": (id, v, ctx) =>
    prisma.nfSoilData.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { season: reqStr(v.season), type: reqStr(v.type), crop: reqStr(v.crop), beforePh: reqDec(v.beforePh), beforeEc: reqDec(v.beforeEc), beforeEcOc: reqDec(v.beforeEcOc), afterPh: reqDec(v.afterPh), afterEc: reqDec(v.afterEc), afterEcOc: reqDec(v.afterEcOc) } }),
  "projects/natural-farming/nf-budget-expenditure": (id, v, ctx) =>
    prisma.nfBudgetExpenditure.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { activityName: reqStr(v.activityName), activitiesOrganised: reqInt(v.activitiesOrganised), budgetSanction: reqDec(v.budgetSanction), budgetExpenditure: reqDec(v.budgetExpenditure), totalBudgetExpenditure: reqDec(v.totalBudgetExpenditure) } }),
  "projects/tsp-scsp/view-sub-plan-activity": (id, v, ctx) =>
    prisma.subPlanActivity.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { type: v.type?.toUpperCase() === "SCSP" ? "SCSP" : "TSP", activities: reqStr(v.activities), noOfTraining: reqInt(v.noOfTraining), beneficiaries: reqInt(v.beneficiaries) } }),
  "projects/nari/nari-nutrition-garden": (id, v, ctx) =>
    prisma.nariNutritionGarden.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { nutriSmartVillage: reqStr(v.nutriSmartVillage), typeOfNutritionalGarden: reqStr(v.typeOfNutritionalGarden), numbers: reqInt(v.numbers), areaSqm: reqDec(v.areaSqm) } }),
  "projects/nari/nari-bio-fortified": (id, v, ctx) =>
    prisma.nariBioFortified.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { nutriSmartVillage: reqStr(v.nutriSmartVillage), season: reqStr(v.season), activity: reqStr(v.activity), categoryOfCrop: reqStr(v.categoryOfCrop) } }),
  "projects/nari/nari-value-addition": (id, v, ctx) =>
    prisma.nariValueAddition.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { nutriSmartVillage: reqStr(v.nutriSmartVillage), cropName: reqStr(v.cropName), valueAddedProduct: reqStr(v.valueAddedProduct), activity: reqStr(v.activity) } }),
  "projects/nari/nari-training": (id, v, ctx) =>
    prisma.nariTraining.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { nutriSmartVillage: reqStr(v.nutriSmartVillage), areaOfTraining: reqStr(v.areaOfTraining), activity: reqStr(v.activity), titleOfTraining: reqStr(v.titleOfTraining) } }),
  "projects/nari/nari-extension": (id, v, ctx) =>
    prisma.nariExtension.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { nutriSmartVillage: reqStr(v.nutriSmartVillage), activity: reqStr(v.activity), nameOfActivity: reqStr(v.nameOfActivity), noOfActivities: reqInt(v.noOfActivities) } }),
  "projects/agri-drone/agri-drone-introduction": (id, v, ctx) =>
    prisma.agriDroneIntroduction.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { year: reqInt(v.year), centreName: reqStr(v.centreName), companyOfDrone: reqStr(v.companyOfDrone), modelOfDrone: reqStr(v.modelOfDrone), dronesSanctioned: reqInt(v.dronesSanctioned), dronesPurchased: reqInt(v.dronesPurchased), amountSanctioned: reqDec(v.amountSanctioned) } }),
  "projects/agri-drone/agri-drone-demonstration": (id, v, ctx) =>
    prisma.agriDroneDemonstration.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { centreName: reqStr(v.centreName), district: reqStr(v.district), dateOfDemos: reqDate(v.dateOfDemos), placeOfDemos: reqStr(v.placeOfDemos), cropName: reqStr(v.cropName), noOfDemos: reqInt(v.noOfDemos), areaCovered: reqDec(v.areaCovered), noOfFarmers: reqInt(v.noOfFarmers) } }),
  "projects/fpo-cbbo/fpo-cbbo-details": (id, v, ctx) =>
    prisma.fpoCbboDetail.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { noOfBlocksAllocated: reqInt(v.noOfBlocksAllocated), noOfFposRegistered: reqInt(v.noOfFposRegistered), trainingReceived: str(v.trainingReceived), businessPlanPrepared: bool(v.businessPlanPrepared), noOfFposDoingBusiness: reqInt(v.noOfFposDoingBusiness) } }),
  "projects/fpo-cbbo/fpo-management": (id, v, ctx) =>
    prisma.fpoManagement.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { registrationNo: reqStr(v.registrationNo), dateOfRegistration: reqDate(v.dateOfRegistration), fpoName: reqStr(v.fpoName), fpoAddress: str(v.fpoAddress), totalBomMembers: reqInt(v.totalBomMembers), financialPosition: str(v.financialPosition) } }),
  "projects/drmr/drmr-details": (id, v, ctx) =>
    prisma.drmrDetail.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { varietiesUsedInIp: reqStr(v.varietiesUsedInIp), situations: reqStr(v.situations), varietiesUsedInFp: reqStr(v.varietiesUsedInFp), netReturnImprovedPractice: reqDec(v.netReturnImprovedPractice), netReturnFarmerPractice: reqDec(v.netReturnFarmerPractice) } }),
  "projects/drmr/drmr-activity": (id, v, ctx) =>
    prisma.drmrActivity.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { startDate: reqDate(v.startDate), endDate: reqDate(v.endDate), training: str(v.training), flds: str(v.flds), awarenessCamps: str(v.awarenessCamps), distributionOfLiterature: str(v.distributionOfLiterature) } }),
  "projects/cra/cra-details": (id, v, ctx) =>
    prisma.craDetail.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { season: reqStr(v.season), technologyDemonstrated: reqStr(v.technologyDemonstrated), croppingSystem: reqStr(v.croppingSystem), areaHa: reqDec(v.areaHa), noOfFarmer: reqInt(v.noOfFarmer) } }),
  "projects/cra/cra-extension-activity": (id, v, ctx) =>
    prisma.craExtensionActivity.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { extensionActivity: reqStr(v.extensionActivity), startDate: reqDate(v.startDate), endDate: reqDate(v.endDate), withinOrWithoutState: str(v.withinOrWithoutState), exposureVisits: reqInt(v.exposureVisits), farmersUnderExposure: reqInt(v.farmersUnderExposure) } }),
  "projects/csisa/csisa-details": (id, v, ctx) =>
    prisma.csisaDetail.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { season: reqStr(v.season), villageCovered: reqInt(v.villageCovered), blockCovered: reqInt(v.blockCovered), districtCovered: reqInt(v.districtCovered) } }),
  "projects/seed-hub/seed-hub-program": (id, v, ctx) =>
    prisma.seedHubProgram.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { season: reqStr(v.season), cropName: reqStr(v.cropName), variety: reqStr(v.variety), areaHa: reqDec(v.areaHa), yieldHa: reqDec(v.yieldHa) } }),
  "projects/other-programmes/other-programme": (id, v, ctx) =>
    prisma.otherProgramme.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { programmeName: reqStr(v.programmeName), programmeDate: reqDate(v.programmeDate), venue: str(v.venue), purpose: str(v.purpose), participants: reqInt(v.participants) } }),

  "performance/impact/impact-of-kvk-activities": (id, v, ctx) =>
    prisma.kvkActivityImpact.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { specificArea: reqStr(v.specificArea), briefDetails: str(v.briefDetails), farmersBenefitted: reqInt(v.farmersBenefitted), horizontalSpread: str(v.horizontalSpread), adoptionPercent: reqDec(v.adoptionPercent) } }),
  "performance/impact/entrepreneurship-details": (id, v, ctx) =>
    prisma.entrepreneurshipDetail.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { entrepreneurOrEnterprise: reqStr(v.entrepreneurOrEnterprise), enterpriseType: reqStr(v.enterpriseType), membersAssociated: reqInt(v.membersAssociated), annualIncome: reqDec(v.annualIncome) } }),
  "performance/impact/success-stories": (id, v, ctx) =>
    prisma.successStory.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { farmerOrEntrepreneur: reqStr(v.farmerOrEntrepreneur), experience: str(v.experience), majorAchievement: reqStr(v.majorAchievement), storyTitle: reqStr(v.storyTitle) } }),
  "performance/district-village-performance/district-level-data": (id, v, ctx) =>
    prisma.districtLevelData.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { reportingYear: reqInt(v.reportingYear), items: reqStr(v.items), information: str(v.information) } }),
  "performance/district-village-performance/operational-area-details": (id, v, ctx) =>
    prisma.operationalAreaDetail.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { reportingYear: reqInt(v.reportingYear), taluk: str(v.taluk), block: reqStr(v.block), village: reqStr(v.village), majorCrops: str(v.majorCrops), majorProblems: str(v.majorProblems), thrustAreas: str(v.thrustAreas) } }),
  "performance/district-village-performance/village-adoption-programme": (id, v, ctx) =>
    prisma.villageAdoptionProgramme.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { reportingYear: reqInt(v.reportingYear), village: reqStr(v.village), block: reqStr(v.block), actionTaken: str(v.actionTaken) } }),
  "performance/district-village-performance/priority-thrust-area": (id, v, ctx) =>
    prisma.priorityThrustArea.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { reportingYear: reqInt(v.reportingYear), thrustArea: reqStr(v.thrustArea) } }),
  "performance/infrastructure-performance/demonstration-units": (id, v, ctx) =>
    prisma.demonstrationUnit.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { demoUnitName: reqStr(v.demoUnitName), yearOfEstt: reqInt(v.yearOfEstt), areaSqMt: reqDec(v.areaSqMt) } }),
  "performance/infrastructure-performance/instructional-farm-crops": (id, v, ctx) =>
    prisma.instructionalFarmCrop.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { cropName: reqStr(v.cropName), areaHa: reqDec(v.areaHa) } }),
  "performance/infrastructure-performance/production-units": (id, v, ctx) =>
    prisma.productionUnit.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { productName: reqStr(v.productName), qty: reqDec(v.qty) } }),
  "performance/infrastructure-performance/instructional-farm-livestock": (id, v, ctx) =>
    prisma.instructionalFarmLivestock.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { animalName: reqStr(v.animalName), speciesBreed: str(v.speciesBreed), produceType: str(v.produceType) } }),
  "performance/infrastructure-performance/hostel-utilization": (id, v, ctx) =>
    prisma.hostelUtilization.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { months: reqStr(v.months), traineesStayed: reqInt(v.traineesStayed), traineeDays: reqInt(v.traineeDays) } }),
  "performance/infrastructure-performance/staff-quarters-performance": (id, v, ctx) =>
    prisma.staffQuartersPerformance.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { noOfStaffQuarters: reqInt(v.noOfStaffQuarters), dateOfCompletion: date(v.dateOfCompletion), remark: str(v.remark) } }),
  "performance/infrastructure-performance/rain-water-harvesting": (id, v, ctx) =>
    prisma.rainWaterHarvesting.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { trainingProgrammes: reqInt(v.trainingProgrammes), demonstrations: reqInt(v.demonstrations), plantMaterialProduced: reqInt(v.plantMaterialProduced), farmerVisits: reqInt(v.farmerVisits), officialVisits: reqInt(v.officialVisits) } }),
  "performance/financial-performance/budget-details": (id, v, ctx) =>
    prisma.budgetDetail.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { salaryAllocation: reqDec(v.salaryAllocation), salaryExpenditure: reqDec(v.salaryExpenditure), generalGrantAllocation: reqDec(v.generalGrantAllocation), generalGrantExpenditure: reqDec(v.generalGrantExpenditure), capitalGrantAllocation: reqDec(v.capitalGrantAllocation), capitalGrantExpenditure: reqDec(v.capitalGrantExpenditure) } }),
  "performance/financial-performance/project-wise-budget-performance": (id, v, ctx) =>
    prisma.projectWiseBudgetPerformance.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { projectName: reqStr(v.projectName), fundingAgency: str(v.fundingAgency), budgetEstimate: reqDec(v.budgetEstimate), budgetAllocated: reqDec(v.budgetAllocated), budgetReleased: reqDec(v.budgetReleased), expenditure: reqDec(v.expenditure), unspentBalance: reqDec(v.unspentBalance) } }),
  "performance/financial-performance/revolving-fund": (id, v, ctx) =>
    prisma.revolvingFund.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { reportingYear: reqInt(v.reportingYear), openingBalance: reqDec(v.openingBalance), incomeDuringYear: reqDec(v.incomeDuringYear), expenditureDuringYear: reqDec(v.expenditureDuringYear), closing: reqDec(v.closing), kind: str(v.kind) } }),
  "performance/financial-performance/revenue-generation": (id, v, ctx) =>
    prisma.revenueGeneration.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { headName: reqStr(v.headName), income: reqDec(v.income), sponsoringAgency: str(v.sponsoringAgency) } }),
  "performance/financial-performance/resource-generation": (id, v, ctx) =>
    prisma.resourceGeneration.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { programmeName: reqStr(v.programmeName), purpose: str(v.purpose), sourcesOfFund: str(v.sourcesOfFund), amountLakhs: reqDec(v.amountLakhs) } }),
  "performance/linkages/functional-linkage": (id, v, ctx) =>
    prisma.functionalLinkage.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { organizationName: reqStr(v.organizationName), natureOfLinkage: str(v.natureOfLinkage) } }),
  "performance/linkages/special-programmes": (id, v, ctx) =>
    prisma.specialProgramme.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { programmeType: reqStr(v.programmeType), programmeName: reqStr(v.programmeName), initiationDate: date(v.initiationDate) } }),

  "meetings/sac-meetings": (id, v, ctx) =>
    prisma.sacMeeting.updateMany({
      where: { id, kvkId: ctx.kvkId },
      data: { startDate: reqDate(v.startDate), endDate: reqDate(v.endDate), participants: reqInt(v.participants), statutoryMembers: reqInt(v.statutoryMembers), recommendations: str(v.recommendations), actionTaken: str(v.actionTaken), reason: str(v.reason), fileUrl: str(v.file) },
    }),
  "meetings/other-meetings": (id, v, ctx) =>
    prisma.otherMeeting.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { date: reqDate(v.date), meetingType: reqStr(v.meetingType), agenda: str(v.agenda), representativeFromAtari: str(v.representativeFromAtari) } }),

  "miscellaneous/prevalent-diseases-crops": (id, v, ctx) =>
    prisma.prevalentDiseaseCrop.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { diseaseName: reqStr(v.diseaseName), crop: reqStr(v.crop), outbreakDate: reqDate(v.outbreakDate), areaAffected: reqDec(v.areaAffected), commodityLossPercent: reqDec(v.commodityLossPercent), preventiveMeasures: str(v.preventiveMeasures) } }),
  "miscellaneous/prevalent-diseases-livestock": (id, v, ctx) =>
    prisma.prevalentDiseaseLivestock.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { diseaseName: reqStr(v.diseaseName), speciesAffected: reqStr(v.speciesAffected), outbreakDate: reqDate(v.outbreakDate), mortalityMorbidity: str(v.mortalityMorbidity), animalsVaccinated: reqInt(v.animalsVaccinated), preventiveMeasures: str(v.preventiveMeasures) } }),
  "miscellaneous/nyk-training": (id, v, ctx) =>
    prisma.nykTraining.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { programmeTitle: reqStr(v.programmeTitle), startDate: reqDate(v.startDate), endDate: reqDate(v.endDate), male: reqInt(v.male), female: reqInt(v.female), fundReceived: reqDec(v.fundReceived) } }),
  "miscellaneous/ppv-fra-sensitization/ppv-fra-training-programme": (id, v, ctx) =>
    prisma.ppvFraTrainingProgramme.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { date: reqDate(v.date), title: reqStr(v.title), type: str(v.type), venue: str(v.venue), resourcePerson: str(v.resourcePerson), participants: reqInt(v.participants) } }),
  "miscellaneous/ppv-fra-sensitization/ppv-fra-farmer-details": (id, v, ctx) =>
    prisma.ppvFraFarmerDetail.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { year: reqInt(v.year), crop: reqStr(v.crop), registrationNo: reqStr(v.registrationNo), farmerName: reqStr(v.farmerName), block: str(v.block), district: str(v.district) } }),
  "miscellaneous/rawe-fet-fit-programme": (id, v, ctx) =>
    prisma.raweFetFitProgramme.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { startDate: reqDate(v.startDate), endDate: reqDate(v.endDate), attachmentType: reqStr(v.attachmentType), attachment: str(v.attachment), numberOfStudents: reqInt(v.numberOfStudents), daysStayed: reqInt(v.daysStayed) } }),
  "miscellaneous/vip-visitors": (id, v, ctx) =>
    prisma.vipVisitor.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { visitDate: reqDate(v.visitDate), dignitaryType: reqStr(v.dignitaryType), ministerName: reqStr(v.ministerName), observations: str(v.observations) } }),
  "miscellaneous/digital-information/digital-mobile-app": (id, v, ctx) =>
    prisma.digitalMobileApp.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { mobileAppsDeveloped: reqInt(v.mobileAppsDeveloped), appName: str(v.appName), appLanguage: str(v.appLanguage), meantFor: str(v.meantFor), timesDownloaded: reqInt(v.timesDownloaded) } }),
  "miscellaneous/digital-information/digital-web-portal": (id, v, ctx) =>
    prisma.digitalWebPortal.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { visitors: reqInt(v.visitors), farmersRegistered: reqInt(v.farmersRegistered) } }),
  "miscellaneous/digital-information/digital-kisan-sarathi": (id, v, ctx) =>
    prisma.digitalKisanSarathi.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { farmersRegisteredKsp: reqInt(v.farmersRegisteredKsp), phoneCallAddressed: reqInt(v.phoneCallAddressed), answeredCall: reqInt(v.answeredCall) } }),
  "miscellaneous/digital-information/digital-kmas": (id, v, ctx) =>
    prisma.digitalKmas.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { farmersCovered: reqInt(v.farmersCovered), advisoriesSent: reqInt(v.advisoriesSent), messagesCrop: bool(v.messagesCrop), messagesLivestock: bool(v.messagesLivestock), messagesWeather: bool(v.messagesWeather), messagesMarketing: bool(v.messagesMarketing), messagesAwareness: bool(v.messagesAwareness), messagesOtherEnterprises: bool(v.messagesOtherEnterprises), messagesAnyOther: str(v.messagesAnyOther) } }),
  "miscellaneous/digital-information/digital-other-channels": (id, v, ctx) =>
    prisma.digitalOtherChannel.updateMany({ where: { id, kvkId: ctx.kvkId }, data: { textAdvisories: reqInt(v.textAdvisories), textFarmers: reqInt(v.textFarmers), whatsappAdvisories: reqInt(v.whatsappAdvisories), whatsappFarmers: reqInt(v.whatsappFarmers), socialMediaAdvisories: reqInt(v.socialMediaAdvisories), socialMediaFarmers: reqInt(v.socialMediaFarmers), weatherBulletinAdvisories: reqInt(v.weatherBulletinAdvisories), weatherBulletinFarmers: reqInt(v.weatherBulletinFarmers) } }),

  "achievements/technology-week-celebration": (id, v, ctx) =>
    prisma.technologyWeekCelebration.updateMany({
      where: { id, kvkId: ctx.kvkId },
      data: { startDate: reqDate(v.startDate), endDate: reqDate(v.endDate), typeOfActivities: reqStr(v.typeOfActivities), noOfActivities: reqInt(v.noOfActivities), relatedCropTechnology: str(v.relatedCropTechnology), numberOfParticipants: reqInt(v.numberOfParticipants) },
    }),
  "achievements/world-soil-day": (id, v, ctx) =>
    prisma.worldSoilDay.updateMany({
      where: { id, kvkId: ctx.kvkId },
      data: { noOfActivitiesConducted: reqInt(v.noOfActivitiesConducted), soilHealthCardsDistributed: reqInt(v.soilHealthCardsDistributed), noOfVip: reqInt(v.noOfVip), vipNames: str(v.vipNames), totalParticipants: reqInt(v.totalParticipants) },
    }),
};
