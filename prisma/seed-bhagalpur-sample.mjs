/**
 * Demo/testing data for KVK Bhagalpur, transcribed from the real
 * kvk-report-202607270504.pdf (ATARI AMS Report, KVK Bhagalpur, 50 pages)
 * that the client supplied - not fabricated. Populates one representative
 * record (or the full real set, where short) per module so every wired
 * list page has something real to show during today's testing pass.
 * Real users replace this with their own entries once the app is live.
 */
import { PrismaClient } from "../lib/generated/prisma/client.ts";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const kvk = await prisma.kvk.findFirstOrThrow({ where: { name: "KVK Bhagalpur" } });
const { id: kvkId, zoneId } = kvk;
const base = { kvkId, zoneId };

async function main() {
  // About KVK
  await prisma.bankAccount.createMany({
    data: [
      { ...base, accountType: "KVK", accountName: "KVK Main Account", bankName: "UCO Bank", location: "Sabour, Bhagalpur", accountNumber: "04870200060554" },
      { ...base, accountType: "Revolving Fund", accountName: "KVK Revolving Fund", bankName: "UCO Bank", location: "Sabour, Bhagalpur", accountNumber: "04870100017661" },
    ],
  });

  const [ajeet, rohan, sanjay] = await Promise.all([
    prisma.staff.create({ data: { ...base, sanctionedPost: "SMS (Subject Matter Specialist)", name: "Ajeet", dateOfBirth: new Date("2001-01-01"), discipline: "Other", payScale: "Level 13 A", dateOfJoining: new Date("2025-01-01"), category: "General", jobType: "Permanent", mobile: "6986582545" } }),
    prisma.staff.create({ data: { ...base, sanctionedPost: "Stenographer", name: "Rohan", dateOfBirth: new Date("1988-03-17"), discipline: "Other", payScale: "Level-3", dateOfJoining: new Date("2003-07-05"), category: "OBC", jobType: "Permanent", mobile: "9297878952" } }),
    prisma.staff.create({ data: { ...base, sanctionedPost: "Senior Scientist cum Head", name: "Sanjay Singh", dateOfBirth: new Date("1978-01-01"), discipline: "Agronomy", payScale: "Level 10", dateOfJoining: new Date("2005-01-01"), category: "OBC", jobType: "Permanent", mobile: "9682459874" } }),
  ]);

  const [bokaro, ramgarh] = await Promise.all([
    prisma.kvk.findFirst({ where: { name: "KVK Bokaro" } }),
    prisma.kvk.findFirst({ where: { name: "KVK Ramgarh" } }),
  ]);
  if (bokaro) await prisma.staffTransfer.create({ data: { staffId: rohan.id, fromKvkId: kvkId, toKvkId: bokaro.id, zoneId, transferDate: new Date("2025-04-09"), numberOfTransfers: 1 } });
  if (ramgarh) await prisma.staffTransfer.create({ data: { staffId: ajeet.id, fromKvkId: kvkId, toKvkId: ramgarh.id, zoneId, transferDate: new Date("2025-01-01"), numberOfTransfers: 2 } });

  await prisma.infrastructure.createMany({
    data: [
      { ...base, infrastructureName: "Area under Admin Building", underUse: true, sourceOfFunding: "By Host Institute" },
      { ...base, infrastructureName: "Others, if any", underUse: true, sourceOfFunding: "Private Organisation" },
      { ...base, infrastructureName: "Area under Boundary Wall", underUse: true, sourceOfFunding: "State Government/Department" },
    ],
  });
  await prisma.staffQuarters.create({ data: { ...base, dateOfCompletion: new Date("2025-10-05"), numberOfQuarters: 6, remark: "Occupied" } });

  const hero = await prisma.vehicle.create({ data: { ...base, name: "Hero", registrationNo: "BR01PB4787C", yearOfPurchase: 2025, cost: 150000 } });
  const swaraj = await prisma.vehicle.create({ data: { ...base, name: "Swaraj", registrationNo: "BREN4113D", yearOfPurchase: 2025, cost: 800000 } });
  const sumoGold = await prisma.vehicle.create({ data: { ...base, name: "Sumo Gold", registrationNo: "BRO1ER0125R", yearOfPurchase: 2005, cost: 450000 } });
  await prisma.vehicleStatus.createMany({
    data: [
      { vehicleId: swaraj.id, zoneId, reportingYear: 2026, totalRunKmHrs: 134, presentStatus: "Working", repairingCost: 676, fundingSource: "ICAR", fundingAgency: "BJHHUJ" },
      { vehicleId: hero.id, zoneId, reportingYear: 2025, totalRunKmHrs: 5200, presentStatus: "Working", repairingCost: 2000, fundingSource: "NGO", fundingAgency: "Khadigram" },
      { vehicleId: sumoGold.id, zoneId, reportingYear: 2025, totalRunKmHrs: 25000, presentStatus: "Working", repairingCost: 3000, fundingSource: "ICAR", fundingAgency: "ATARI" },
    ],
  });

  const planter = await prisma.equipment.create({ data: { ...base, name: "Potato planter", yearOfPurchase: 2025, cost: 45000 } });
  const desktop = await prisma.equipment.create({ data: { ...base, name: "Desktop Computer", yearOfPurchase: 2024, cost: 140000 } });
  await prisma.equipmentStatus.createMany({
    data: [
      { equipmentId: desktop.id, zoneId, reportingYear: 2025, sourceOfFund: "ICAR", fundingAgency: "ATARI", presentStatus: "Working" },
      { equipmentId: planter.id, zoneId, reportingYear: 2025, sourceOfFund: "ICAR", fundingAgency: "ATARI", presentStatus: "Working" },
    ],
  });

  // Achievements
  await prisma.oft.createMany({
    data: [
      { ...base, reportingYear: 2025, discipline: "OFT (Agricultural Extension)", staff: "Ajeet", thematicArea: "Value Addition", trialOnForm: "Value addition", problemDiagnosed: "Low price of the product", sourceOfTechnology: "SAU", productionSystem: "Value addition", quantity: 1.33, unit: "ha", noOfTrialReplicationFarmer: 10, startMonth: new Date("2025-03-01"), criticalInput: "fertilizer", costOfOft: 11998, fundingAgency: "ATARI", status: "ONGOING" },
      { ...base, reportingYear: 2025, discipline: "OFT (Agronomy)", staff: "Sanjay Singh", thematicArea: "Integrated Crop Management", trialOnForm: "INM", problemDiagnosed: "INM", sourceOfTechnology: "ICAR", productionSystem: "Integrated", quantity: 20, unit: "ha", noOfTrialReplicationFarmer: 10, startMonth: new Date("2025-01-01"), criticalInput: "FYM", costOfOft: 10000, fundingAgency: "ATARI", status: "ONGOING" },
      { ...base, reportingYear: 2025, discipline: "OFT (Animal Science)", staff: "Rohan", thematicArea: "Integrated Crop Management", trialOnForm: "Seed management", problemDiagnosed: "problem", sourceOfTechnology: "SAU", productionSystem: "Yield increase", quantity: 0.5, unit: "ha", noOfTrialReplicationFarmer: 5, startMonth: new Date("2025-03-01"), endMonth: new Date("2026-01-01"), criticalInput: "herbicides", costOfOft: 15000, status: "COMPLETED" },
      { ...base, reportingYear: 2025, discipline: "OFT (Fisheries)", staff: "Sanjay Singh", thematicArea: "Value Addition", trialOnForm: "fingerlings", problemDiagnosed: "production", sourceOfTechnology: "SAU", productionSystem: "Production", quantity: 0.5, unit: "ha", noOfTrialReplicationFarmer: 10, startMonth: new Date("2023-01-01"), endMonth: new Date("2025-11-01"), criticalInput: "fungicides", costOfOft: 12000, status: "COMPLETED" },
      { ...base, reportingYear: 2026, discipline: "OFT (Home Science)", staff: "Ajeet", thematicArea: "Drudgery Reduction", trialOnForm: "drudegry reduction", sourceOfTechnology: "ICAR", productionSystem: "sad", quantity: 23, unit: "Kg", noOfTrialReplicationFarmer: 369, startMonth: new Date("2026-07-01"), criticalInput: "machine", costOfOft: 321, status: "ONGOING" },
    ],
  });

  const fldRice = await prisma.fld.create({ data: { ...base, reportingYear: 2025, category: "Farm Mechanization", subCategory: "Cereals", technologyDemonstrated: "rice production", status: "COMPLETED" } });
  const fldMustard = await prisma.fld.create({ data: { ...base, reportingYear: 2025, category: "Integrated Nutrient Management", subCategory: "Oilseeds", technologyDemonstrated: "Mustard production", status: "COMPLETED" } });
  const fldMaize = await prisma.fld.create({ data: { ...base, reportingYear: 2025, category: "Crop Production", subCategory: "Crop Hybrid Varieties", technologyDemonstrated: "Maize", status: "ONGOING" } });
  await prisma.fldDemonstrationDetail.createMany({
    data: [
      { fldId: fldRice.id, zoneId, sector: "Crop Production", cropOrItem: "Paddy", thematicArea: "Farm Mechanization", technologyDemonstrated: "rice production", noOfDemonstrations: 10, noOfFarmers: 35, areaHa: 5, yieldDemoQha: 57.5, yieldCheckQha: 39.3, percentIncrease: 46.31, grossCostDemo: 22000, grossReturnDemo: 37500, netReturnDemo: 15500, bcrDemo: 1.7, grossCostCheck: 27000, grossReturnCheck: 35000, netReturnCheck: 8000, bcrCheck: 1.3 },
      { fldId: fldMustard.id, zoneId, sector: "Crop Production", cropOrItem: "Other Oil Seeds", thematicArea: "Integrated Nutrient Management", technologyDemonstrated: "Mustard production", noOfDemonstrations: 6, noOfFarmers: 50, areaHa: 10, yieldDemoQha: 40, yieldCheckQha: 35, percentIncrease: 14.29, grossCostDemo: 12000, grossReturnDemo: 17000, netReturnDemo: 5000, bcrDemo: 1.42, grossCostCheck: 15000, grossReturnCheck: 17000, netReturnCheck: 2000, bcrCheck: 1.13 },
      { fldId: fldMaize.id, zoneId, sector: "Farm Implements and Machinery", cropOrItem: "abcdefg", noOfDemonstrations: 10, noOfFarmers: 30, areaHa: 232, yieldDemoQha: 1200, yieldCheckQha: 1099, percentIncrease: 9.19 },
    ],
  });
  await prisma.fldExtensionTraining.createMany({
    data: [
      { fldId: fldRice.id, zoneId, activity: "Field Day", date: new Date("2025-11-07"), activityCount: 1, participantCount: 148, remark: "conducted" },
      { fldId: fldMaize.id, zoneId, activity: "Farmers Training", date: new Date("2025-08-09"), activityCount: 1, participantCount: 39, remark: "Training given" },
      { fldId: fldRice.id, zoneId, activity: "Farmers Training", date: new Date("2025-07-07"), activityCount: 1, participantCount: 50, remark: "Training" },
      { fldId: fldMaize.id, zoneId, activity: "Farmers Training", date: new Date("2025-03-11"), activityCount: 1, participantCount: 51, remark: "training" },
    ],
  });
  await prisma.fldTechnicalFeedback.createMany({
    data: [
      { fldId: fldRice.id, zoneId, crop: "Paddy", feedback: "best" },
      { fldId: fldMaize.id, zoneId, crop: "Maize", feedback: "Maize variety Shaktiman 1" },
      { fldId: fldMaize.id, zoneId, crop: "Maize", feedback: "Yield increased" },
      { fldId: fldMustard.id, zoneId, crop: "Other Oil Seeds", feedback: "Recommended" },
    ],
  });

  await prisma.training.createMany({
    data: [
      { ...base, reportingYear: 2025, program: "Capacity Building and Group Dynamics", title: "Entrepreneurial Development Of Farmers/Youths", venue: "KVK", thematicArea: "Capacity Building and Group Dynamics" },
      { ...base, reportingYear: 2025, program: "Rural Youth", title: "Bee-Keeping", venue: "KVK", thematicArea: "Rural Youth" },
      { ...base, reportingYear: 2025, program: "Rural Youth", title: "Commercial Fruit Production", venue: "KVK", thematicArea: "Rural Youth" },
      { ...base, reportingYear: 2025, program: "Rural Youth", title: "Dairying", venue: "Off Campus", thematicArea: "Rural Youth" },
      { ...base, reportingYear: 2025, program: "Extension Functionaries/Personnel", title: "Integrated Nutrient Management", venue: "Off Campus", thematicArea: "Extension Personnel" },
    ],
  });
  await prisma.extensionActivity.createMany({
    data: [
      { ...base, reportingYear: 2025, natureOfExtensionActivity: "Animal Health Camp", noOfActivities: 1, noOfParticipants: 555 },
      { ...base, reportingYear: 2025, natureOfExtensionActivity: "Exposure Visit", noOfActivities: 2, noOfParticipants: 211 },
      { ...base, reportingYear: 2025, natureOfExtensionActivity: "Not specified", noOfActivities: 1, noOfParticipants: 278 },
    ],
  });
  await prisma.otherExtensionActivity.create({ data: { ...base, reportingYear: 2025, natureOfExtensionActivity: "Newspaper Coverage", noOfActivities: 25 } });
  await prisma.technologyProductProduction.createMany({
    data: [
      { ...base, category: "Dairy Animals", variety: "Desi (Cow)", quantity: 20 },
      { ...base, category: "Fisheries", variety: "Carp", quantity: 11 },
      { ...base, category: "Bio Fertilizers", variety: "Vermicompost (G2)", quantity: 5000 },
    ],
  });
  await prisma.technologyWeekCelebration.create({ data: { ...base, startDate: new Date("2025-01-01"), endDate: new Date("2025-01-07"), typeOfActivities: "Technology Week Celebration", noOfActivities: 12, relatedCropTechnology: "Crop", numberOfParticipants: 309 } });
  await prisma.celebrationDay.createMany({
    data: [
      { ...base, importantDay: "Independence Day", eventDate: new Date("2025-08-15"), noOfActivities: 1 },
      { ...base, importantDay: "Viksit Krishi Sankalp Abhiyan (VKSA)", eventDate: new Date("2025-09-01"), noOfActivities: 9 },
    ],
  });
  await prisma.worldSoilDay.create({ data: { ...base, noOfActivitiesConducted: 12, soilHealthCardsDistributed: 12, noOfVip: 1, vipNames: "21", totalParticipants: 2 } });
  await prisma.poshanMaaha.create({ data: { ...base, activityDate: new Date("2025-06-30"), activitiesConducted: "trail", eventName: "trail", saplingsPlanted: 321, vegetableKits: 12, participantsGirls: 321, participantsFarmWoman: 321, participantsFarmers: 3213, participantsAganwadiWorkers: 132, participantsGovtOfficials: 13, participantsPublicRepresentatives: 132, totalParticipants: 4132 } });
  await prisma.swachhtaObservance.createMany({
    data: [
      { ...base, kind: "SEWA", dateDurationOfObservation: "31/07/2025", totalNoOfActivitiesUndertaken: 2, noOfStaffs: 10, noOfFarmers: 25 },
      { ...base, kind: "PAKHWADA", dateDurationOfObservation: "10/10/2025", totalNoOfActivitiesUndertaken: 5, noOfStaffs: 10, noOfFarmers: 20 },
    ],
  });
  await prisma.swachhtaBudgetExpenditure.create({ data: { ...base, reportingYear: 2025, vermicompostingVillagesCovered: 11, vermicompostingTotalExpenditure: 30000 } });
  await prisma.soilWaterPlantAnalysis.createMany({
    data: [
      { ...base, startDate: new Date("2025-08-12"), endDate: new Date("2025-12-10"), analysis: "Water", noOfSamplesAnalyzed: 52, noOfVillagesCovered: 20, amountRealized: 35000 },
      { ...base, startDate: new Date("2025-05-02"), endDate: new Date("2025-05-28"), analysis: "Soil", noOfSamplesAnalyzed: 39, noOfVillagesCovered: 12, amountRealized: 30000 },
    ],
  });
  await prisma.publication.createMany({
    data: [
      { ...base, itemName: "Book Chapter Published", title: "HGFDS", authorName: "KJHGFD", journalName: "JHGFDS" },
      { ...base, itemName: "Research Paper Published", title: "Soil improvement", authorName: "ATARI Patna, KVK and other", journalName: "Indian Journal" },
    ],
  });
  await prisma.humanResourceDevelopment.create({ data: { ...base, staff: "Sanjay Singh (Senior Scientist cum Head)", course: "Soil management", startDate: new Date("2025-01-10"), endDate: new Date("2025-01-22"), venue: "Office campus, Patna", organizer: "ICAR-ATARI, Patna" } });
  await prisma.kvkAward.create({ data: { ...base, award: "Scientist", amount: 200000, achievement: "ATARI Team", conferringAuthority: "ICAR" } });
  await prisma.scientistAward.create({ data: { ...base, headScientist: "Ajeet", award: "Scientist Award", amount: 0, achievement: "1 award" } });
  await prisma.farmerAward.create({ data: { ...base, farmerName: "Deewakar Singh", award: "Farmer Award", amount: 0, achievement: "1 award" } });

  // Projects
  const cfld = await prisma.cfldTechnicalParameter.create({
    data: { ...base, reportingYear: 2025, season: "Rabi", crop: "Chickpea", cropDemonstrated: "Chickpea", areaHa: 2.12, numberOfFarmers: 86, detailOfTechnologyDemonstrated: "ZT", existingFarmerPractice: "Brodcasting", yieldFarmerFieldQha: 0.6, yieldDemoMaxQha: 1.5, yieldDemoMinQha: 1, yieldDemoAvgQha: 1.1, yieldGapKgHaDistrict: 1.1, yieldGapKgHaState: 1.3, yieldGapKgHaPotential: 1, yieldGapMinimizedPercentDistrict: 1.1, percentIncrease: 83, status: "ONGOING" },
  });
  await prisma.cfldEconomicParameter.create({ data: { cfldTechnicalParameterId: cfld.id, zoneId, detailOfTechnology: "ZT" } });
  await prisma.cfldSocioEconomicImpact.create({ data: { cfldTechnicalParameterId: cfld.id, zoneId, cropDemonstrated: "Chickpea" } });
  await prisma.cfldFarmersPerception.create({ data: { cfldTechnicalParameterId: cfld.id, zoneId, technologyDetail: "ZT" } });
  await prisma.cfldExtensionActivity.createMany({
    data: [
      { ...base, season: "Rabi", activitiesOrganized: "Field Day", date: new Date("2025-04-21"), placeOfActivity: "Patna", farmersAttended: 144 },
      { ...base, season: "Kharif", activitiesOrganized: "Awareness Programme", date: new Date("2025-12-14"), placeOfActivity: "KVK", farmersAttended: 44 },
    ],
  });
  await prisma.cfldBudgetUtilization.create({ data: { ...base, crop: "Chickpea", season: "Rabi", overallFundAllocation: 50000 } });

  await prisma.nicraBasicInformation.create({ data: { ...base, rfDistrictNormal: 980, rfDistrictReceived: 1010, maxTemperature: 45, minTemperature: 7 } });
  await prisma.nicraDetails.create({ data: { ...base, cropName: "rice", seasonName: "Kharif", technologyDemonstration: "ZT", noOfFarmers: 123 } });
  await prisma.nicraTraining.create({ data: { ...base, title: "INM", startDate: new Date("2025-11-12"), endDate: new Date("2025-12-25"), farmersAttended: 166 } });
  await prisma.nicraExtensionActivity.create({ data: { ...base, activityName: "Training", places: "Bihar", startDate: new Date("2025-11-12"), endDate: new Date("2025-12-25"), farmersAttended: 173 } });
  await prisma.nicraIntervention.create({ data: { ...base, startDate: new Date("2025-12-23"), endDate: new Date("2025-12-31"), seedBankFodderBank: "Seed bank", crop: "Wheat", variety: "UP262", quantityQuintal: 10000 } });
  await prisma.nicraRevenueGenerated.create({ data: { ...base, year: 2025, revenue: 3000000, total: 3000000 } });
  await prisma.nicraCustomHiringFarmImplement.create({ data: { ...base, farmImplementName: "Tractor", farmersUsed: 290, areaCovered: 70, hoursUsed: 70, revenueGenerated: 70000, repairExpenditure: 15000 } });
  await prisma.nicraVillageWiseVcrmc.create({ data: { ...base, villageName: "Tarari", constitutionDate: new Date("2025-11-12"), members: 50, meetingsOrganized: 25, meetingDate: new Date("2025-11-17"), secretaryName: "Sanjay" } });
  await prisma.nicraSoilHealthCard.create({ data: { ...base, startDate: new Date("2025-01-01"), endDate: new Date("2025-12-31"), samplesCollected: 80, samplesAnalysed: 80, shcIssued: 49, farmersBenefitted: 49 } });
  await prisma.nicraConvergenceProgramme.create({ data: { ...base, startDate: new Date("2025-04-01"), endDate: new Date("2025-12-31"), scheme: "district", natureOfWork: "Agriculture", amount: 250000 } });
  await prisma.nicraDignitaryVisit.create({ data: { ...base, vipExperts: "Expert", name: "Sanoj", dateOfVisit: new Date("2001-12-08") } });
  await prisma.nicraPiCoPi.create({ data: { ...base, startDate: new Date("2025-04-01"), endDate: new Date("2025-12-31"), piCoPi: "PI", name: "Dr." } });

  await prisma.aryaCurrentYearDetail.create({ data: { ...base, enterprise: "Pig Farming", viableUnits: 2, closedUnits: 1, startDate: new Date("2025-01-01"), endDate: new Date("2025-12-31"), groupsFormed: 20, groupsActive: 20 } });
  await prisma.aryaPreviousYearEvaluation.create({ data: { ...base, enterprise: "Pig Farming", totalClosed: 1, closingDate: new Date("2025-02-17"), totalRestarted: 1, restartedDate: new Date("2025-10-06") } });

  await prisma.nfGeographicalInfo.create({ data: { ...base, startDate: new Date("2025-05-07"), endDate: new Date("2025-12-31"), agroClimaticZone: "Zone 1", farmingSituation: "Irrigated", latitude: 25.245, longitude: 87.012 } });
  await prisma.nfPhysicalInfo.create({ data: { ...base, activityName: "Awareness", trainingTitle: "Awareness", trainingDate: new Date("2025-11-12"), venue: "KVK", participants: 69 } });
  await prisma.nfBeneficiary.create({ data: { ...base, numberOfBlock: 12, numberOfVillage: 18, numberOfTraining: 20, farmersInfluenced: 20 } });
  await prisma.nfSoilData.create({ data: { ...base, season: "Kharif", type: "Demo plot", crop: "rice", beforePh: 9, beforeEc: 1, beforeEcOc: 4, afterPh: 1, afterEc: 5, afterEcOc: 2 } });
  await prisma.nfBudgetExpenditure.create({ data: { ...base, activityName: "Awareness", activitiesOrganised: 17, budgetSanction: 250000, budgetExpenditure: 130000, totalBudgetExpenditure: 250000 } });

  await prisma.subPlanActivity.createMany({
    data: [
      { ...base, type: "TSP", activities: "Frontline Demonstrations (FLDs) and other demonstrations", noOfTraining: 12, beneficiaries: 285 },
      { ...base, type: "SCSP", activities: "Frontline Demonstrations (FLDs) and other demonstrations", noOfTraining: 12, beneficiaries: 312 },
    ],
  });

  await prisma.nariNutritionGarden.create({ data: { ...base, nutriSmartVillage: "Indirabad", typeOfNutritionalGarden: "Backyard/Kitchen Garden", numbers: 1, areaSqm: 200 } });
  await prisma.nariBioFortified.create({ data: { ...base, nutriSmartVillage: "Indirabad", season: "Summer", activity: "FLD", categoryOfCrop: "Vegetables" } });
  await prisma.nariValueAddition.create({ data: { ...base, nutriSmartVillage: "Indirabad", cropName: "Millet", valueAddedProduct: "Millet", activity: "FLD" } });
  await prisma.nariTraining.create({ data: { ...base, nutriSmartVillage: "Indirabad", areaOfTraining: "Nutrigarden", activity: "FLD", titleOfTraining: "Vegetable management" } });
  await prisma.nariExtension.create({ data: { ...base, nutriSmartVillage: "Indirabad", activity: "Training", nameOfActivity: "Training", noOfActivities: 2 } });

  await prisma.agriDroneIntroduction.create({ data: { ...base, year: 2025, centreName: "NIC", companyOfDrone: "Dron", modelOfDrone: "DNK", dronesSanctioned: 2, dronesPurchased: 1, amountSanctioned: 300000 } });
  await prisma.agriDroneDemonstration.create({ data: { ...base, centreName: "KVK", district: "Bhagalpur", dateOfDemos: new Date("2025-06-07"), placeOfDemos: "KVK", cropName: "Rice", noOfDemos: 1, areaCovered: 1.5, noOfFarmers: 19 } });

  await prisma.fpoCbboDetail.create({ data: { ...base, noOfBlocksAllocated: 5, noOfFposRegistered: 19, trainingReceived: "Yes", businessPlanPrepared: true, noOfFposDoingBusiness: 4 } });
  await prisma.fpoManagement.createMany({
    data: [
      { ...base, registrationNo: "2025/FPO", dateOfRegistration: new Date("2025-04-08"), fpoName: "Pragati", fpoAddress: "Bhagalpur", totalBomMembers: 66, financialPosition: "6.00 lakh" },
    ],
  });

  await prisma.drmrDetail.create({ data: { ...base, varietiesUsedInIp: "HD2733", situations: "Irrigated", varietiesUsedInFp: "Broadcasting", netReturnImprovedPractice: 40000, netReturnFarmerPractice: 27000 } });
  await prisma.drmrActivity.create({ data: { ...base, startDate: new Date("2025-05-04"), endDate: new Date("2025-05-04"), training: "22 days", flds: "3 ha", awarenessCamps: "conducted", distributionOfLiterature: "23 copies" } });

  await prisma.craDetail.create({ data: { ...base, season: "Rabi", technologyDemonstrated: "ZT", croppingSystem: "Rice-Wheat-Greengram-Wheat", areaHa: 2.5, noOfFarmer: 77 } });
  await prisma.craExtensionActivity.create({ data: { ...base, extensionActivity: "Farmers Training", startDate: new Date("2025-07-07"), endDate: new Date("2025-07-10"), exposureVisits: 1, farmersUnderExposure: 48 } });

  await prisma.csisaDetail.create({ data: { ...base, season: "Kharif", villageCovered: 12, blockCovered: 12, districtCovered: 1 } });
  await prisma.seedHubProgram.create({ data: { ...base, season: "Rabi", cropName: "Wheat", variety: "UP262", areaHa: 7.5, yieldHa: 56 } });
  await prisma.otherProgramme.create({ data: { ...base, programmeName: "VSA", programmeDate: new Date("2025-04-08"), venue: "District", purpose: "Agriculture", participants: 348 } });

  // Performance
  await prisma.kvkActivityImpact.create({ data: { ...base, specificArea: "Technology", briefDetails: "Innovative technology demonstrated in farmers field", farmersBenefitted: 24567, horizontalSpread: "245", adoptionPercent: 70 } });
  await prisma.successStory.create({ data: { ...base, farmerOrEntrepreneur: "Vijay Ojha", majorAchievement: "Integrated Farming System (Crop + Dairy + Fishery)", storyTitle: "Seeds of Success: Transforming Agriculture through Innovation" } });
  await prisma.districtLevelData.create({ data: { ...base, reportingYear: 2025, items: "Agro Climatic Zone", information: "Bihar plains" } });
  await prisma.operationalAreaDetail.createMany({
    data: [
      { ...base, reportingYear: 2025, taluk: "Patna", block: "Sadar", village: "Rukanpura" },
      { ...base, reportingYear: 2025, block: "TFHF", village: "DGDG", majorCrops: "Maize", majorProblems: "Disease" },
    ],
  });
  await prisma.priorityThrustArea.create({ data: { ...base, reportingYear: 2025, thrustArea: "Rainfed" } });
  await prisma.demonstrationUnit.createMany({
    data: [
      { ...base, demoUnitName: "Goatry", yearOfEstt: 2025, areaSqMt: 100 },
      { ...base, demoUnitName: "mushroom unit", yearOfEstt: 2010, areaSqMt: 12 },
    ],
  });
  await prisma.instructionalFarmCrop.create({ data: { ...base, cropName: "Paddy", areaHa: 50 } });
  await prisma.productionUnit.create({ data: { ...base, productName: "vermicompost", qty: 40000 } });
  await prisma.instructionalFarmLivestock.create({ data: { ...base, animalName: "Cow", speciesBreed: "Sahiwal", produceType: "Milk" } });
  await prisma.hostelUtilization.create({ data: { ...base, months: "December", traineesStayed: 60, traineeDays: 5 } });
  await prisma.rainWaterHarvesting.createMany({
    data: [
      { ...base, trainingProgrammes: 12, demonstrations: 1, plantMaterialProduced: 0, farmerVisits: 1780, officialVisits: 280 },
      { ...base, trainingProgrammes: 488, demonstrations: 54, plantMaterialProduced: 0, farmerVisits: 45, officialVisits: 54 },
    ],
  });
  await prisma.budgetDetail.create({ data: { ...base, salaryAllocation: 56000000, salaryExpenditure: 0, generalGrantAllocation: 500000, generalGrantExpenditure: 0, capitalGrantAllocation: 100000, capitalGrantExpenditure: 0 } });
  await prisma.projectWiseBudgetPerformance.create({ data: { ...base, projectName: "ARYA", fundingAgency: "ICAR", budgetEstimate: 1200000, budgetAllocated: 1200000, budgetReleased: 1200000, expenditure: 900000, unspentBalance: 300000 } });
  await prisma.revolvingFund.create({ data: { ...base, reportingYear: 2025, openingBalance: 0, incomeDuringYear: 2500000, expenditureDuringYear: 100000, closing: 2400000, kind: "Seed and produce sale" } });
  await prisma.revenueGeneration.create({ data: { ...base, headName: "Training", income: 200000, sponsoringAgency: "District" } });
  await prisma.resourceGeneration.create({ data: { ...base, programmeName: "Capacity building", purpose: "Training", sourcesOfFund: "DHO", amountLakhs: 250000 } });
  await prisma.functionalLinkage.createMany({
    data: [
      { ...base, organizationName: "District office", natureOfLinkage: "data management" },
      { ...base, organizationName: "ATMA", natureOfLinkage: "Training related" },
    ],
  });

  // Miscellaneous
  await prisma.prevalentDiseaseCrop.create({ data: { ...base, diseaseName: "Pod borer", crop: "Chickpea", outbreakDate: new Date("2025-03-02"), areaAffected: 90, commodityLossPercent: 60, preventiveMeasures: "60" } });
  await prisma.prevalentDiseaseLivestock.create({ data: { ...base, diseaseName: "Lumpy Skin Disease", speciesAffected: "Cow", outbreakDate: new Date("2025-07-07"), mortalityMorbidity: "60%", animalsVaccinated: 10, preventiveMeasures: "20" } });
  await prisma.ppvFraTrainingProgramme.create({ data: { ...base, date: new Date("2025-06-10"), title: "Climate Awareness", type: "Awareness", venue: "Village", resourcePerson: "ICAR", participants: 62 } });
  await prisma.ppvFraFarmerDetail.create({ data: { ...base, year: 2025, crop: "Rice", registrationNo: "2025/FPO", farmerName: "Subir Yadav", block: "Tarari", district: "Bhagalpur" } });
  await prisma.raweFetFitProgramme.createMany({
    data: [
      { ...base, startDate: new Date("2025-01-01"), endDate: new Date("2025-12-31"), attachmentType: "PDF", numberOfStudents: 42, daysStayed: 67 },
      { ...base, startDate: new Date("2025-01-01"), endDate: new Date("2025-12-31"), attachmentType: "PDF", numberOfStudents: 60, daysStayed: 124 },
    ],
  });
  await prisma.vipVisitor.create({ data: { ...base, visitDate: new Date("2025-04-08"), dignitaryType: "Other Head of Organization", ministerName: "Mr. Chadan Kumar", observations: "Visited" } });
  await prisma.digitalMobileApp.createMany({
    data: [
      { ...base, mobileAppsDeveloped: 1, appName: "M-crops", appLanguage: "Hindi", meantFor: "crop", timesDownloaded: 30 },
      { ...base, mobileAppsDeveloped: 5, appName: "App", appLanguage: "English", meantFor: "Rice", timesDownloaded: 23 },
    ],
  });
  await prisma.digitalWebPortal.createMany({
    data: [
      { ...base, visitors: 25, farmersRegistered: 4556 },
      { ...base, visitors: 787, farmersRegistered: 787 },
      { ...base, visitors: 333, farmersRegistered: 234 },
    ],
  });
  await prisma.digitalKisanSarathi.create({ data: { ...base, farmersRegisteredKsp: 35000, phoneCallAddressed: 2568, answeredCall: 2365 } });
  await prisma.digitalKmas.create({ data: { ...base, farmersCovered: 25461, advisoriesSent: 2546, messagesCrop: true, messagesLivestock: true, messagesWeather: true, messagesMarketing: true, messagesAwareness: true, messagesOtherEnterprises: true, messagesAnyOther: "664" } });
  await prisma.digitalOtherChannel.createMany({
    data: [
      { ...base, textAdvisories: 2456, textFarmers: 12345, whatsappAdvisories: 1452, whatsappFarmers: 25678, socialMediaAdvisories: 6, socialMediaFarmers: 616, weatherBulletinAdvisories: 61, weatherBulletinFarmers: 61 },
    ],
  });

  // Meetings
  await prisma.sacMeeting.create({ data: { ...base, startDate: new Date("2025-09-15"), endDate: new Date("2025-09-16"), participants: 45, statutoryMembers: 20, recommendations: "Focus on Hi-density orchard", actionTaken: "Yes", reason: "Horticulture" } });
  await prisma.otherMeeting.create({ data: { ...base, date: new Date("2025-12-10"), meetingType: "Seminar", agenda: "Pre rabi planning", representativeFromAtari: "PS" } });

  console.log("Seeded real KVK Bhagalpur demo data across all wired modules.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
