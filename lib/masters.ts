/**
 * Real reference data for the Basic Masters group (Zone / State / District /
 * Institute / Host / KVK Master), transcribed directly from the client's
 * the reference rather than
 * guessed. Where a table's real row count exceeds what was visible on
 * screen (District Master: 69 total, Host Master: 15, KVK Master: 65,
 * Institute Master: unseen), only the confirmed rows are listed - the
 * `total` constants below reflect the real counts shown in the reference
 * UI's own pagination footer, not the length of these arrays.
 */

export type ZoneMasterRow = { zoneName: string };

export const ZONE_MASTER_ROWS: ZoneMasterRow[] = [
  { zoneName: "Zone IV - Patna" },
];

export type StateMasterRow = { zoneName: string; stateName: string };

export const STATE_MASTER_ROWS: StateMasterRow[] = [
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar" },
];

export type DistrictMasterRow = {
  zoneName: string;
  stateName: string;
  districtName: string;
};

/** First page only (6 of 69 rows were visible in the reference). */
export const DISTRICT_MASTER_ROWS: DistrictMasterRow[] = [
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Jamui" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Kaimur" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Nawada" },
  {
    zoneName: "Zone IV - Patna",
    stateName: "Jharkhand",
    districtName: "Khunti",
  },
  {
    zoneName: "Zone IV - Patna",
    stateName: "Jharkhand",
    districtName: "West Singhbhum",
  },
  {
    zoneName: "Zone IV - Patna",
    stateName: "Jharkhand",
    districtName: "Simdega",
  },
];
export const DISTRICT_MASTER_TOTAL = 69;

export type HostMasterRow = { hostName: string };

/** First page only (6 of 15 rows were visible in the reference). */
export const HOST_MASTER_ROWS: HostMasterRow[] = [
  { hostName: "Samta Seva Kendra Sitamarhi" },
  { hostName: "National Rice Research Institute (NRRI), Cuttack" },
  { hostName: "ICAR-NISA, Ranchi" },
  { hostName: "Viksh Bharti Bishunpur Gumla" },
  { hostName: "Gramin Vikash Trust, Noida" },
  { hostName: "KVK Deoghar" },
];
export const HOST_MASTER_TOTAL = 15;

export type KvkMasterRow = {
  zoneName: string;
  stateName: string;
  hostOrg: string;
  districtName: string;
  kvk: string;
  mobile: string;
  /** Column order is Mobile, Email, Address, Year of Sanction - confirmed against the real table, not the Mobile/Address/E-Mail/Sanction Year order this used to have. Values themselves were cross-confirmed from the client's own "1.1.1 Name and address of KVK" reference document. */
  email: string;
  address: string;
  sanctionYear: string;
};

/** First page only (6 of 65 rows were visible in the reference; Email/Address/Sanction Year cross-confirmed for these same 6 from the client's "1.1.1" KVK Basic Information document). */
export const KVK_MASTER_ROWS: KvkMasterRow[] = [
  {
    zoneName: "Zone IV - Patna",
    stateName: "Bihar",
    hostOrg: "BAU Sabour",
    districtName: "Araria",
    kvk: "KVK Araria",
    mobile: "9431645217",
    address: "KVK Araria",
    email: "arariaakvk@gmail.com",
    sanctionYear: "2004",
  },
  {
    zoneName: "Zone IV - Patna",
    stateName: "Bihar",
    hostOrg: "BAU Sabour",
    districtName: "Arwal",
    kvk: "KVK Arwal",
    mobile: "8210554284",
    address:
      "At - Lodipur, Post - Sarwarpur, PS - Mehandia, Block - Kaler, District - Arwal, Pin - 804428 (Bihar)",
    email: "arwalkvk@gmail.com",
    sanctionYear: "2008",
  },
  {
    zoneName: "Zone IV - Patna",
    stateName: "Bihar",
    hostOrg: "BAU Sabour",
    districtName: "Aurangabad",
    kvk: "KVK Aurangabad",
    mobile: "8298641285",
    address: "KVK Aurangabad",
    email: "aurangabadkvk@gmail.com",
    sanctionYear: "2006",
  },
  {
    zoneName: "Zone IV - Patna",
    stateName: "Bihar",
    hostOrg: "BAU Sabour",
    districtName: "Banka",
    kvk: "KVK Banka",
    mobile: "9431659922",
    address: "KVK Banka",
    email: "bankakvk@gmail.com",
    sanctionYear: "1983",
  },
  {
    zoneName: "Zone IV - Patna",
    stateName: "Bihar",
    hostOrg: "DRPCAU",
    districtName: "Begusarai",
    kvk: "KVK Begusarai",
    mobile: "6287797169",
    address:
      "KVK Begusarai At- Khodawandpur, Post- Meghaul, Block-Khodawnandpur, Dist- Begusarai-848202",
    email: "head.kvk.begusarai@rpcau.ac.in",
    sanctionYear: "1992",
  },
  {
    zoneName: "Zone IV - Patna",
    stateName: "Bihar",
    hostOrg: "BAU Sabour",
    districtName: "Bhagalpur",
    kvk: "Kvk Bhagalpur",
    mobile: "9939626493",
    address: "KVK Bhagalpur, Bihar, Pin – 813210",
    email: "bhagalpurkvk@gmail.com",
    sanctionYear: "2004",
  },
];
export const KVK_MASTER_TOTAL = 65;

export type InstituteMasterRow = { instituteName: string };

/** Complete - reference showed "Showing 1-4 of 4". */
export const INSTITUTE_MASTER_ROWS: InstituteMasterRow[] = [
  { instituteName: "ICAR" },
  { instituteName: "NGO" },
  { instituteName: "CAU" },
  { instituteName: "SAU" },
];
export const INSTITUTE_MASTER_TOTAL = 4;

/**
 * OFT & FLD Masters - real reference data. Row counts below are the real
 * totals shown in the reference UI's own pagination; only the sample rows
 * actually visible on screen are listed.
 */

export type OftThematicAreaRow = { thematicArea: string; subjectName: string };

/** Complete - all 57 rows, transcribed directly from oft-thematic-area-master.pdf. */
export const OFT_THEMATIC_AREA_ROWS: OftThematicAreaRow[] = [
  {
    thematicArea: "Horticulture",
    subjectName:
      "Technologies assessed under various crops (Horticulture crops)",
  },
  {
    thematicArea: "Integrated Nutrient Management",
    subjectName:
      "Technologies assessed under various crops (Horticulture crops)",
  },
  {
    thematicArea: "Varietal Evaluation",
    subjectName:
      "Technologies assessed under various crops (Horticulture crops)",
  },
  {
    thematicArea: "Integrated Pest Management",
    subjectName:
      "Technologies assessed under various crops (Horticulture crops)",
  },
  {
    thematicArea: "Integrated Crop Management",
    subjectName:
      "Technologies assessed under various crops (Horticulture crops)",
  },
  {
    thematicArea: "Integrated Disease Management",
    subjectName:
      "Technologies assessed under various crops (Horticulture crops)",
  },
  {
    thematicArea: "Small Scale Income Generation Enterprises",
    subjectName:
      "Technologies assessed under various crops (Horticulture crops)",
  },
  {
    thematicArea: "Weed Management",
    subjectName:
      "Technologies assessed under various crops (Horticulture crops)",
  },
  {
    thematicArea: "Resource Conservation Technology",
    subjectName:
      "Technologies assessed under various crops (Horticulture crops)",
  },
  {
    thematicArea: "Post-harvest Technology / Value addition",
    subjectName:
      "Technologies assessed under various crops (Horticulture crops)",
  },
  {
    thematicArea: "Others if any specify",
    subjectName:
      "Technologies assessed under various crops (Horticulture crops)",
  },
  {
    thematicArea: "Drudgery Reductions",
    subjectName: "Technologies assessed under women empowerment (Home science)",
  },
  {
    thematicArea: "Entrepreneurship Development",
    subjectName: "Technologies assessed under women empowerment (Home science)",
  },
  {
    thematicArea: "Health and Nutrition",
    subjectName: "Technologies assessed under women empowerment (Home science)",
  },
  {
    thematicArea: "Value Addition",
    subjectName: "Technologies assessed under women empowerment (Home science)",
  },
  {
    thematicArea: "Others",
    subjectName: "Technologies assessed under women empowerment (Home science)",
  },
  {
    thematicArea: "Drudgery Reduction",
    subjectName: "Technologies assessed under various enterprises",
  },
  {
    thematicArea: "Entrepreneurship Development",
    subjectName: "Technologies assessed under various enterprises",
  },
  {
    thematicArea: "Health And Nutrition",
    subjectName: "Technologies assessed under various enterprises",
  },
  {
    thematicArea: "Processing and Value Addition",
    subjectName: "Technologies assessed under various enterprises",
  },
  {
    thematicArea: "Energy Conservation",
    subjectName: "Technologies assessed under various enterprises",
  },
  {
    thematicArea: "Small-Scale Income Generation",
    subjectName: "Technologies assessed under various enterprises",
  },
  {
    thematicArea: "Storage Techniques",
    subjectName: "Technologies assessed under various enterprises",
  },
  {
    thematicArea: "Household Food Security",
    subjectName: "Technologies assessed under various enterprises",
  },
  {
    thematicArea: "Organic Farming",
    subjectName: "Technologies assessed under various enterprises",
  },
  {
    thematicArea: "Agroforestry Management",
    subjectName: "Technologies assessed under various enterprises",
  },
  {
    thematicArea: "Mechanization",
    subjectName: "Technologies assessed under various enterprises",
  },
  {
    thematicArea: "Resource Conservation Technology",
    subjectName: "Technologies assessed under various enterprises",
  },
  {
    thematicArea: "Value Addition",
    subjectName: "Technologies assessed under various enterprises",
  },
  {
    thematicArea: "Others",
    subjectName: "Technologies assessed under various enterprises",
  },
  {
    thematicArea: "Disease Management",
    subjectName: "Technologies assessed under livestock and fisheries",
  },
  {
    thematicArea: "Breeding Management/Evaluation of Breed",
    subjectName: "Technologies assessed under livestock and fisheries",
  },
  {
    thematicArea: "Feed And Fodder Management",
    subjectName: "Technologies assessed under livestock and fisheries",
  },
  {
    thematicArea: "Production And Management",
    subjectName: "Technologies assessed under livestock and fisheries",
  },
  {
    thematicArea: "Processing and Value Addition of livestock products",
    subjectName: "Technologies assessed under livestock and fisheries",
  },
  {
    thematicArea: "Horticulture Crop",
    subjectName: "Technologies assessed under livestock and fisheries",
  },
  {
    thematicArea: "Diseases and Health Management",
    subjectName: "Technologies assessed under livestock and fisheries",
  },
  {
    thematicArea: "Nutrient Management",
    subjectName: "Technologies assessed under livestock and fisheries",
  },
  {
    thematicArea: "Fisheries Management",
    subjectName: "Technologies assessed under livestock and fisheries",
  },
  {
    thematicArea: "Others",
    subjectName: "Technologies assessed under livestock and fisheries",
  },
  {
    thematicArea: "Integrated Nutrient Management",
    subjectName:
      "Technologies Assessed under Various Crops by KVKs (Crop Production)",
  },
  {
    thematicArea: "Varietal Evaluation",
    subjectName:
      "Technologies Assessed under Various Crops by KVKs (Crop Production)",
  },
  {
    thematicArea: "Integrated Pest Management",
    subjectName:
      "Technologies Assessed under Various Crops by KVKs (Crop Production)",
  },
  {
    thematicArea: "Integrated Crop Management",
    subjectName:
      "Technologies Assessed under Various Crops by KVKs (Crop Production)",
  },
  {
    thematicArea: "Integrated Disease Management",
    subjectName:
      "Technologies Assessed under Various Crops by KVKs (Crop Production)",
  },
  {
    thematicArea: "Small Scale Income Generation Enterprises",
    subjectName:
      "Technologies Assessed under Various Crops by KVKs (Crop Production)",
  },
  {
    thematicArea: "Weed Management",
    subjectName:
      "Technologies Assessed under Various Crops by KVKs (Crop Production)",
  },
  {
    thematicArea: "Resource Conservation Technology",
    subjectName:
      "Technologies Assessed under Various Crops by KVKs (Crop Production)",
  },
  {
    thematicArea: "Farm Machineries",
    subjectName:
      "Technologies Assessed under Various Crops by KVKs (Crop Production)",
  },
  {
    thematicArea: "Integrated Farming System",
    subjectName:
      "Technologies Assessed under Various Crops by KVKs (Crop Production)",
  },
  {
    thematicArea: "Seed / Plant Production",
    subjectName:
      "Technologies Assessed under Various Crops by KVKs (Crop Production)",
  },
  {
    thematicArea: "Post Harvest Technology / Value Addition",
    subjectName:
      "Technologies Assessed under Various Crops by KVKs (Crop Production)",
  },
  {
    thematicArea: "Drudgery Reduction",
    subjectName:
      "Technologies Assessed under Various Crops by KVKs (Crop Production)",
  },
  {
    thematicArea: "Storage Technique",
    subjectName:
      "Technologies Assessed under Various Crops by KVKs (Crop Production)",
  },
  {
    thematicArea: "Cropping Systems",
    subjectName:
      "Technologies Assessed under Various Crops by KVKs (Crop Production)",
  },
  {
    thematicArea: "Farm Mechanization",
    subjectName:
      "Technologies Assessed under Various Crops by KVKs (Crop Production)",
  },
  {
    thematicArea: "Others Thematic Area Upload By ATARI",
    subjectName:
      "Technologies Assessed under Various Crops by KVKs (Crop Production)",
  },
];
export const OFT_THEMATIC_AREA_TOTAL = 57;

export type FldSubCategoryRow = { subCategoryName: string };

/**
 * 6 of 95 real sub-category names confirmed. The reference table also has
 * paired "Category Name" + "Sector Name" columns, but their values per row
 * weren't legible in the reference - left out rather than guessed.
 */
export const FLD_SUB_CATEGORY_ROWS: FldSubCategoryRow[] = [
  { subCategoryName: "Cereals" },
  { subCategoryName: "Millets" },
  { subCategoryName: "Oilseeds (Other than CFLD)" },
  { subCategoryName: "Pulses (Other than CFLD)" },
  { subCategoryName: "Tuber Crops" },
  { subCategoryName: "Flower Crops" },
];
export const FLD_SUB_CATEGORY_TOTAL = 95;

export type CropMasterRow = { cropName: string; category: string };

/** 6 of 1,365 real rows confirmed - this master is very large in the reference, only the sampled Cereal-category rows were visible. */
export const CROP_MASTER_ROWS: CropMasterRow[] = [
  { cropName: "Barley", category: "Cereals" },
  { cropName: "Maize", category: "Cereals" },
  { cropName: "Oats", category: "Cereals" },
  { cropName: "Paddy", category: "Cereals" },
  { cropName: "Basmati Rice", category: "Cereals" },
  { cropName: "Coarse Rice", category: "Cereals" },
];
export const CROP_MASTER_TOTAL = 1365;

export type CfldCropRow = { season: string; type: string; cropName: string };

/** All 33 real rows, supplied directly by the client (CFLD Crop Master, 2026-08-24). */
export const CFLD_CROP_ROWS: CfldCropRow[] = [
  { season: "Summer", type: "oilseed", cropName: "Sesame" },
  { season: "Summer", type: "pulses", cropName: "Other" },
  { season: "Summer", type: "pulses", cropName: "Rajmash" },
  { season: "Summer", type: "pulses", cropName: "Greengram" },
  { season: "Rabi", type: "pulses", cropName: "Other" },
  { season: "Rabi", type: "pulses", cropName: "Bengal gram" },
  { season: "Rabi", type: "pulses", cropName: "Lathyrus" },
  { season: "Rabi", type: "pulses", cropName: "Rajmash" },
  { season: "Rabi", type: "pulses", cropName: "Fieldpea" },
  { season: "Rabi", type: "pulses", cropName: "Chickpea" },
  { season: "Kharif", type: "pulses", cropName: "Other" },
  { season: "Kharif", type: "pulses", cropName: "Mothbean" },
  { season: "Kharif", type: "pulses", cropName: "Rajmash" },
  { season: "Kharif", type: "pulses", cropName: "Cowpea" },
  { season: "Kharif", type: "pulses", cropName: "Horsegram" },
  { season: "Kharif", type: "pulses", cropName: "Greengram" },
  { season: "Kharif", type: "pulses", cropName: "Blackgram" },
  { season: "Summer", type: "pulses", cropName: "Green Gram" },
  { season: "Kharif", type: "oilseed", cropName: "Niger" },
  { season: "Rabi", type: "pulses", cropName: "Grasspea Lathyrus" },
  { season: "Rabi", type: "pulses", cropName: "Field Pea" },
  { season: "Rabi", type: "pulses", cropName: "Lentil" },
  { season: "Rabi", type: "pulses", cropName: "Chickpea Gram" },
  { season: "Rabi", type: "oilseed", cropName: "Linseed" },
  { season: "Rabi", type: "oilseed", cropName: "Sunflower" },
  { season: "Rabi", type: "oilseed", cropName: "Rapeseed" },
  { season: "Rabi", type: "oilseed", cropName: "Mustard" },
  { season: "Kharif", type: "pulses", cropName: "Urad" },
  { season: "Kharif", type: "pulses", cropName: "Moong" },
  { season: "Kharif", type: "pulses", cropName: "Pigeonpea" },
  { season: "Kharif", type: "oilseed", cropName: "Sesame" },
  { season: "Kharif", type: "oilseed", cropName: "Soybean" },
  { season: "Kharif", type: "oilseed", cropName: "Groundnut" },
];
export const CFLD_CROP_TOTAL = CFLD_CROP_ROWS.length;

/**
 * Training & Extension Masters - real reference data.
 */

export type FundingSourceRow = { fundingSource: string };

/** 5 of 100 real rows confirmed. */
export const FUNDING_SOURCE_ROWS: FundingSourceRow[] = [
  { fundingSource: "University" },
  { fundingSource: "IFS Bihar Govt" },
  { fundingSource: "District administration" },
  { fundingSource: "NIL" },
  { fundingSource: "CRA Programme" },
];
export const FUNDING_SOURCE_TOTAL = 100;

export type ExtensionActivityRow = { activityName: string };

/** 4 of 35 real rows confirmed. */
export const EXTENSION_ACTIVITY_ROWS: ExtensionActivityRow[] = [
  { activityName: "ZMC Review Meeting" },
  { activityName: "Soil Day" },
  { activityName: "Diagnostic visit" },
  { activityName: "Awareness Programme" },
];
export const EXTENSION_ACTIVITY_TOTAL = 35;

/**
 * Production Masters - real reference data.
 */

export type CroppingSystemRow = { season: string; cropName: string };

/** 1 of 89 real rows confirmed. */
export const CROPPING_SYSTEM_ROWS: CroppingSystemRow[] = [
  { season: "Rabi", cropName: "Rice-Wheat-moong" },
];
export const CROPPING_SYSTEM_TOTAL = 89;

export type FarmingSystemRow = { season: string; farmingSystemName: string };

/**
 * 6 of 32 real rows. The paired Season value was missing from an earlier pass
 * (it wasn't visible in that the reference); a later reference pass read it directly
 * off the real table in the reference_0097 - "Kharif" for all six of these rows,
 * with Season Name as the table's first column.
 */
export const FARMING_SYSTEM_ROWS: FarmingSystemRow[] = [
  { season: "Kharif", farmingSystemName: "Goatery" },
  { season: "Kharif", farmingSystemName: "Broiler & Dual-Purpose Poultry" },
  { season: "Kharif", farmingSystemName: "Duckery" },
  { season: "Kharif", farmingSystemName: "Fish Seed Production" },
  { season: "Kharif", farmingSystemName: "Fishery" },
  { season: "Kharif", farmingSystemName: "Dairy" },
];
export const FARMING_SYSTEM_TOTAL = 32;

/**
 * Publication Masters - real reference data.
 */

export type PublicationItemRow = { itemName: string };

/**
 * 7 of 12 real rows confirmed. The 2nd row reads "Electronic Publication
 * CD or D…" - legible enough to place in sequence, but the exact tail
 * ("DVD" is the near-certain expansion) wasn't fully confirmed, so keep an
 * eye out for a clearer capture of this row before treating it as final.
 */
export const PUBLICATION_ITEM_ROWS: PublicationItemRow[] = [
  { itemName: "E Publication" },
  { itemName: "Electronic Publication (CD/DVD)" },
  { itemName: "News Letter" },
  { itemName: "Technical Reports" },
  { itemName: "Extension Folders/Leaflet" },
  { itemName: "Extension Bulletins Published" },
  { itemName: "Success Story Published" },
];
export const PUBLICATION_ITEM_TOTAL = 12;
