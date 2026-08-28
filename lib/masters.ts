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

/** All 69 real rows, transcribed exactly from the client's "District Master Report" PDF (2026-08-27) - was only the first 6 rows before. */
export const DISTRICT_MASTER_ROWS: DistrictMasterRow[] = [
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Jamui" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Kaimur" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Nawada" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", districtName: "Khunti" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", districtName: "West Singhbhum" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", districtName: "Simdega" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", districtName: "Saraikela-Kharsawan" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", districtName: "Sahibganj" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", districtName: "Ramgarh" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", districtName: "Palamau" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", districtName: "Pakur" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", districtName: "Lohardaga" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", districtName: "Latehar" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", districtName: "Koderma" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", districtName: "Jamtara" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", districtName: "Hazaribagh" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", districtName: "Gumla" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", districtName: "Godda" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", districtName: "Giridih" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", districtName: "Garhwa" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", districtName: "East Singhbhum" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", districtName: "Dumka" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", districtName: "Deoghar" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", districtName: "Chatra" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", districtName: "Bokaro" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "West Champaran II (Narkatiyaganj)" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "West Champaran" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Vaishali" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Supaul" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Siwan" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Sitamarhi" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Sheohar" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Sheikhpura" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Saran" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Samastipur II (Lada)" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Samastipur" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Saharsa" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Rohtas" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Purnea" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Muzaffarpur Add (Muraul)" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Madhubani II (Sukhait)" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Madhubani" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Gopalganj" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "East Champaran II" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "East Champaran" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Buxar" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Darbhanga" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Munger" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Madhepura" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Lakhisarai" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Kishanganj" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Khagaria" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Katihar" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Jehanabad" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Bhojpur" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Gaya II (Aamas)" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Begusarai" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Banka" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Aurangabad" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Arwal" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Araria" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", districtName: "Dhanbad" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", districtName: "Jamshedpur" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", districtName: "Ranchi" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Nalanda" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Bhagalpur" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Muzaffarpur" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Gaya" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", districtName: "Patna" },
];
export const DISTRICT_MASTER_TOTAL = 69;

export type HostMasterRow = {
  hostName: string;
  address: string;
  phone: string;
  email: string;
};

/**
 * 14 of 15 rows - transcribed directly from the client's live AAMS export
 * ("1.1.A.2 Name and address of host organization"), which is the
 * authoritative source for these contact details (supersedes the earlier
 * "ICAR-CRRI Cuttack" entry, which that same
 * export shows is actually ICAR-Central Rice Research Institute, Cuttack).
 * The 15th host organization was never shown in any reference and is not
 * guessed here. `hostName` for the Pusa entry is "DRPCAU" - the client's
 * own live atariams.org "KVK Master" table (screenshot, 2026-08-24) shows
 * this exact short form as the real Host Org value, not the longer
 * "Dr RPCAU Pusa" an earlier pass used.
 */
export const HOST_MASTER_ROWS: HostMasterRow[] = [
  {
    hostName: "BAU Sabour",
    address: "Bihar Agricultural University, Sabour Bhagalpur, Bihar India- 813210",
    phone: "06412452611 / 9431310417",
    email: "deebausabour@gmail.com",
  },
  {
    hostName: "Ramakrishna Mission Ashrama",
    address: "Ramakrishna Mission Ashrama, Morabadi, Ranchi – 834008 (Jharkhand) India",
    phone: "06512551008 / 9835158705",
    email: "ranchi.morabadi@rkmm.org",
  },
  {
    hostName: "DRPCAU",
    address:
      "Dr. Rajendra Prasad Central Agricultural University, Pusa, Samastipur, Bihar, India PIN Code – 848131",
    phone: "06274240226 / 9430804115",
    email: "dee@rpcau.ac.in",
  },
  {
    hostName: "ICAR-Research Complex for Eastern Region, Patna",
    address:
      "ICAR-RCER, ICAR Parisar Rd, near BIT, adjacent to Airport Police Station, Patna, Bihar 800015",
    phone: "06122228805",
    email: "directoricarrcer@gmail.com",
  },
  {
    hostName: "Gram Nirman Mandal, Nawada",
    address: "Sarvodaya Ashram, Sokhodeora, District-Nawada (Bihar) 805106",
    phone: "9939046425",
    email: "arvindgnm_nwd@yahoo.in",
  },
  {
    hostName: "Vanvashi Seva Kendra, Kaimur",
    address: "Vanvasi Seva Kendra, Adhaura (Kaimur) Bihar -821102",
    phone: "9430567345",
    email: "vsk_adhaura@yahoo.co.in",
  },
  {
    hostName: "Bihar Animal Sciences university, Patna",
    address:
      "Bihar Animal Sciences University, Bihar Veterinary College Campus, Patna, Bihar, India PIN Code - 800014",
    phone: "9828926284",
    email: "deebasupatna@gmail.com",
  },
  {
    hostName: "BAU Ranchi",
    address: "Birsa Agricultural University Kanke, Ranchi – 834006 Jharkhand, India",
    phone: "06512450500 / 9431371709",
    email: "deebauranchi@gmail.com",
  },
  {
    hostName: "KVK Deoghar",
    address: "Krishi Vigyan Kendra, Deoghar P.O. - Ghorlash, Dist. - Deoghar, 814152",
    phone: "06432232680 / 7717756760",
    email: "kvkdeoghar@gmail.com",
  },
  {
    hostName: "Gramin Vikas Trust, Noida",
    address:
      "Gramin Vikas Trust, KRIBHCO BHAWAN, \"A\" Wing, 5th Floor, A-8-10, Sector-1, Gautam Budh Nagar, Noida, U.P. (India)",
    phone: "7903419700 / 9899831380",
    email: "honoida@gvtindia.org",
  },
  {
    hostName: "Viksh Bharti Bishunpur Gumla",
    address: "Vikas Bharti Bishunpur Post-Bishunpur Dist- Gumla PIN-835231, Jharkhand",
    phone: "9431118213",
    email: "ashokbhagat1983@hotmail.com",
  },
  {
    hostName: "ICAR-NISA, Ranchi",
    address:
      "ICAR-National Institute of Secondary Agriculture Namkum, Ranchi- 834010 (Jharkhand) India",
    phone: "651-2261156 / 6512261156",
    email: "director.icar.nisa@gmail.com",
  },
  {
    hostName: "ICAR-CRRI Cuttack",
    address: "ICAR-Central Rice Research Institute Cuttack –753006, Odisha",
    phone: "9437484576",
    email: "directorcrricuttack@gmail.com",
  },
  {
    hostName: "Samta Seva Kendra Sitamarhi",
    address: "Samta Sewa Kendra Vill+PO-Chainpura Via- Janakpur Road, Pupri, Sitamarhi -843320",
    phone: "9430259635",
    email: "kumarsudist@rediffmail.com",
  },
  /** 15th real host, missing before (client report, 2026-08-28) - the client's own real system has placeholder contact details for this one row (address "HSDJHFUHSDAJ", email KVKDUMMY@GMAIL.COM per the source PDF), kept as-is rather than inventing real-looking values. */
  {
    hostName: "NGO",
    address: "HSDJHFUHSDAJ",
    phone: "25458 / 9876543211",
    email: "KVKDUMMY@GMAIL.COM",
  },
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

/**
 * All 66 KVKs, transcribed directly from the client's live AAMS export
 * ("1.1.A.1 Name and address of KVK with phone, fax and e-mail" and the
 * separate host-organization list, "kvk list - Sheet2.pdf") - supersedes the
 * earlier 6-row sample. `KVK_MASTER_TOTAL` is corrected from 65 to the real
 * 66 shown in that export's own "KVKS INCLUDED (66)" list.
 */
export const KVK_MASTER_ROWS: KvkMasterRow[] = [
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "DRPCAU", districtName: "Gopalganj", kvk: "KVK Gopalganj", mobile: "6287797171", address: "KVK Gopalganj", email: "head.kvk.sipaya@rpcau.ac.in", sanctionYear: "2006" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "DRPCAU", districtName: "Muzaffarpur Add (Muraul)", kvk: "KVK Muzaffarpur-II", mobile: "9414856397", address: "KVK, Turki, Muzaffarpur-II", email: "head.kvk.turki@rpcau.ac.in", sanctionYear: "2016" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "DRPCAU", districtName: "Samastipur II (Lada)", kvk: "KVK Samastipur-II", mobile: "6287797166", address: "KVK Samastipur-II, Lada", email: "head.kvk.lada@rpcau.ac.in", sanctionYear: "2019" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "DRPCAU", districtName: "Saran", kvk: "KVK Saran", mobile: "6287797158", address: "KVK Saran", email: "head.kvk.manjhi@rpcau.ac.in", sanctionYear: "2006" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "DRPCAU", districtName: "Sheohar", kvk: "KVK Sheohar", mobile: "7752828740", address: "KVK Sheohar", email: "head.kvk.sheohar@rpcau.ac.in", sanctionYear: "2006" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "DRPCAU", districtName: "West Champaran", kvk: "KVK West Champaran-I", mobile: "8409999358", address: "KVK West Champaran-I, Madhopur", email: "head.kvk.madhopur@rpcau.ac.on", sanctionYear: "2004" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "DRPCAU", districtName: "West Champaran II (Narkatiyaganj)", kvk: "KVK West Champaran-II", mobile: "6287797161", address: "KVK West Champaran-II, Narkatiyaganj", email: "head.kvk.narkatiyaganj@rpcau.ac.in", sanctionYear: "2019" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "Gram Nirman Mandal, Nawada", districtName: "Nawada", kvk: "KVK Nawada", mobile: "-", address: "Krishi Vigyan Kendra, Nawada, Gram Nirman Mandal, Sarvodaya Ashram, Sokhodeora, Kawakol, Nawada- 805106 (Bihar)", email: "nawadakvk@gmail.com", sanctionYear: "1979" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "Vanvashi Seva Kendra, Kaimur", districtName: "Kaimur", kvk: "KVK Kaimur", mobile: "91618029010", address: "KVK Kaimur", email: "kaimurkvk@gmail.com", sanctionYear: "1992" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "Bihar Animal Sciences university, Patna", districtName: "Jamui", kvk: "KVK Jamui", mobile: "8292847841", address: "Krishi Vigyan Kendra, Vill: Garo Nawada, Panchayat: Thegua, Post: Jamui 811307 (Bihar)", email: "basukvkjamui@gmail.com", sanctionYear: "2019" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "DRPCAU", districtName: "Madhubani II (Sukhait)", kvk: "KVK Madhubani-II", mobile: "06273291265", address: "Sukhet, Jhanjharpur, Madhubani - 847404", email: "head.kvk.sukhet@rpcau.ac.in", sanctionYear: "2019" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", hostOrg: "BAU Ranchi", districtName: "Bokaro", kvk: "KVK Bokaro", mobile: "9431339380", address: "KVK Bokaro", email: "kvkpetarwarbokaro@gmail.com", sanctionYear: "2004" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", hostOrg: "BAU Ranchi", districtName: "Giridih", kvk: "KVK Giridih", mobile: "7979887927", address: "Topaiya Farm, Bengabad, Giridih- 815312", email: "kvkgiridih@gmail.com", sanctionYear: "2004" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", hostOrg: "BAU Ranchi", districtName: "Lohardaga", kvk: "KVK Lohardaga", mobile: "9142256839", address: "KVK Lohardaga, @ Kisko on Lohardaga Latehar Road PIN 835302", email: "kvklohardaga2011@gmail.com", sanctionYear: "2004" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", hostOrg: "BAU Ranchi", districtName: "Sahibganj", kvk: "KVK Sahibganj", mobile: "9430112886", address: "NH-80, Near Saksharata More, PO- Jirwabari, Sahibganj - 816109 (Jharkhand)", email: "sahibganjkvk@gmail.com", sanctionYear: "2004" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", hostOrg: "KVK Deoghar", districtName: "Deoghar", kvk: "KVK Deoghar", mobile: "7549106450", address: "Vill: Sujani, P.O. Ghorlash, Deoghar, Jharkhand, Pin: 814152", email: "kvkdeoghar@gmail.com", sanctionYear: "1985" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", hostOrg: "Gramin Vikas Trust, Noida", districtName: "Godda", kvk: "KVK Godda", mobile: "9939498711", address: "Gramin Vikas Trust – Krishi Vigyan Kendra Chakeshwari Farm, Godda, Jharkhand, Pin-814133", email: "kvkgodda@gmail.com", sanctionYear: "2006" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", hostOrg: "BAU Ranchi", districtName: "Latehar", kvk: "KVK Latehar", mobile: "06568267149", address: "KVK Latehar", email: "kvk_latehar@rediffmail.com", sanctionYear: "2007" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", hostOrg: "BAU Ranchi", districtName: "Pakur", kvk: "KVK Pakur", mobile: "8210877355", address: "KVK Pakur", email: "kvkpakur@gmail.com", sanctionYear: "2004" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", hostOrg: "Viksh Bharti Bishunpur Gumla", districtName: "Gumla", kvk: "KVK Gumla", mobile: "6523297004", address: "Krishi Vigyan Kendra Gumla Vikas Bharti Bishunpur PO-Bishunpur Dist-Gumla PIN-835231", email: "kvk.gumla@gmail.com", sanctionYear: "2004" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", hostOrg: "BAU Ranchi", districtName: "Dumka", kvk: "KVK Dumka", mobile: "9142256839", address: "Khuntabandh, District - Dumka, Pincode 814101, Jharkhand", email: "dumkakvk@gmail.com", sanctionYear: "2004" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", hostOrg: "BAU Ranchi", districtName: "East Singhbhum", kvk: "KVK East Singhbhum", mobile: "9431580771", address: "KVK East Singhbhum", email: "kvk_eastsinghbhum@rediffmail.com", sanctionYear: "2005" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", hostOrg: "BAU Ranchi", districtName: "Garhwa", kvk: "KVK Garhwa", mobile: "7903088299", address: "KVK Garhwa", email: "garhwakvk@gmail.com", sanctionYear: "2005" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "BAU Sabour", districtName: "Patna", kvk: "KVK Patna", mobile: "0612-2500123", address: "Krishi Vigyan Kendra, Patna, Bihar - 800001", email: "patnakvk@gmail.com", sanctionYear: "2018" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", hostOrg: "BAU Ranchi", districtName: "Palamau", kvk: "KVK Palamu", mobile: "7979753401", address: "KVK Palamu", email: "kvkchianki@gmail.com", sanctionYear: "2002" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", hostOrg: "ICAR-NISA, Ranchi", districtName: "Khunti", kvk: "KVK Khunti", mobile: "9558277233", address: "KVK Khunti", email: "kvkkhunti@gmail.com", sanctionYear: "2014" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", hostOrg: "ICAR-CRRI Cuttack", districtName: "Koderma", kvk: "KVK Koderma", mobile: "9558277233", address: "KVK Koderma", email: "kvkkodermanrri@gmail.com", sanctionYear: "2026" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", hostOrg: "ICAR-Research Complex for Eastern Region, Patna", districtName: "Ramgarh", kvk: "KVK Ramgarh", mobile: "9430003184", address: "KVK Ramgarh", email: "kvkramgarh2020@gamil.com", sanctionYear: "2026" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "DRPCAU", districtName: "Samastipur", kvk: "KVK Samastipur-I", mobile: "7295046855", address: "KVK Samastipur", email: "head.kvk.birauli@rpcau.ac.in", sanctionYear: "2026" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", hostOrg: "BAU Ranchi", districtName: "Saraikela-Kharsawan", kvk: "KVK Saraikela", mobile: "7759985086", address: "KVK Saraikela-Kharsawan", email: "kvksaraikela@gmail.com", sanctionYear: "2026" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", hostOrg: "BAU Ranchi", districtName: "Chatra", kvk: "KVK Chatra", mobile: "9431339380", address: "KVK Chatra", email: "chatrakvk@gmail.com", sanctionYear: "2000" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", hostOrg: "BAU Ranchi", districtName: "Jamtara", kvk: "KVK Jamtara", mobile: "8051931636", address: "KVK Jamtara", email: "kvkbenajamtara@gmail.com", sanctionYear: "2000" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", hostOrg: "BAU Ranchi", districtName: "Simdega", kvk: "KVK Simdega", mobile: "7004049495", address: "KVK Simdega", email: "simdegakvk@gmail.com", sanctionYear: "2000" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", hostOrg: "BAU Ranchi", districtName: "West Singhbhum", kvk: "KVK West Singhbhum", mobile: "8292524455", address: "KVK West Singhbhum", email: "kvkwsm2@gmail.com", sanctionYear: "2000" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "Samta Seva Kendra Sitamarhi", districtName: "Sitamarhi", kvk: "KVK Sitamarhi", mobile: "6228291040", address: "KVK Sitamarhi", email: "sitamarhikvk@gmail.com", sanctionYear: "2000" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", hostOrg: "BAU Ranchi", districtName: "Dhanbad", kvk: "KVK Dhanbad", mobile: "9431176741", address: "KVK Dhanbad, Baliapur Farm, Dhanbad- 828201", email: "kvkdhanbadbau.2012@gmail.com", sanctionYear: "2005" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "BAU Sabour", districtName: "Araria", kvk: "KVK Araria", mobile: "9431645217", address: "KVK Araria", email: "arariaakvk@gmail.com", sanctionYear: "2004" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "BAU Sabour", districtName: "Arwal", kvk: "KVK Arwal", mobile: "8210554284", address: "At - Lodipur, Post - Sarwarpur, PS - Mehandia, Block - Kaler, District - Arwal, Pin - 804428 (Bihar)", email: "arwalkvk@gmail.com", sanctionYear: "2008" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "BAU Sabour", districtName: "Aurangabad", kvk: "KVK Aurangabad", mobile: "8298641285", address: "KVK Aurangabad", email: "aurangabadkvk@gmail.com", sanctionYear: "2006" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "BAU Sabour", districtName: "Banka", kvk: "KVK Banka", mobile: "9431659922", address: "KVK Banka", email: "bankakvk@gmail.com", sanctionYear: "1983" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "BAU Sabour", districtName: "Bhagalpur", kvk: "KVK Bhagalpur", mobile: "0641-2451186", address: "KVK Bhagalpur, Bihar, Pin – 813210", email: "bhagalpurkvk@gmail.com", sanctionYear: "2004" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "BAU Sabour", districtName: "Bhojpur", kvk: "KVK Bhojpur", mobile: "9431479522", address: "KVK Bhojpur", email: "bhojpurkvk@gmail.com", sanctionYear: "1994" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "BAU Sabour", districtName: "Gaya II (Aamas)", kvk: "KVK Gaya-II", mobile: "9304808425", address: "KVK Gaya-II Amas, Pathra More, Manjholia, PIN Code 824219", email: "kvkamasgaya@gmail.com", sanctionYear: "2019" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "BAU Sabour", districtName: "Jehanabad", kvk: "KVK Jehanabad", mobile: "8102372649", address: "Krishi Vigyan Kendra, Gandhar, Jehanabad (Bihar), PIN-804432", email: "jehanabadkvk@gmail.com", sanctionYear: "2006" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "BAU Sabour", districtName: "Katihar", kvk: "KVK Katihar", mobile: "06452291095", address: "Krishi Vigyan Kendra Katihar, Tingachhiya, Katihar, PIN-854103", email: "katiharkvk@gmail.com", sanctionYear: "2004" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "BAU Sabour", districtName: "Khagaria", kvk: "KVK Khagaria", mobile: "7903714090", address: "At- Permanandpur, Po- Koshi College", email: "kvkkhagaria@gmail.com", sanctionYear: "2010" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "BAU Sabour", districtName: "Kishanganj", kvk: "KVK Kishanganj", mobile: "06456-291272", address: "Hawai Adda Road, Near BSF Head Quarter, Khagra, Kishanganj, Bihar, PIN – 855107", email: "kishanganjkvk@gmail.com", sanctionYear: "2006" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "BAU Sabour", districtName: "Lakhisarai", kvk: "KVK Lakhisarai", mobile: "9931095869", address: "Block - Halsi, Lakhisarai-8113118", email: "lakhisaraikvk@gmail.com", sanctionYear: "2006" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "BAU Sabour", districtName: "Madhepura", kvk: "KVK Madhepura", mobile: "8987193648", address: "KVK Madhepura", email: "madhepura.kvk@gmail.com", sanctionYear: "2003" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "BAU Sabour", districtName: "Munger", kvk: "KVK Munger", mobile: "9608658459", address: "KVK Munger", email: "mungerkvk@gmail.com", sanctionYear: "1979" },
  { zoneName: "Zone IV - Patna", stateName: "Jharkhand", hostOrg: "Ramakrishna Mission Ashrama", districtName: "Ranchi", kvk: "KVK Ranchi", mobile: "06512551970", address: "Divyayan KVK, Ramakrishna Mission Ashrama, Morabadi, Ranchi - 834008 (Jharkhand)", email: "kvk.divyayan@gmail.com", sanctionYear: "1977" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "DRPCAU", districtName: "Muzaffarpur", kvk: "KVK Muzaffarpur-I", mobile: "6287797159", address: "KVK Muzaffarpur", email: "head.kvk.saraiya@rpcau.ac.in", sanctionYear: "1996" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "BAU Sabour", districtName: "Gaya", kvk: "KVK Manpur Gaya-I", mobile: "9122386485", address: "KVK Gaya", email: "kvkmanpurgaya@gmail.com", sanctionYear: "2006" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "BAU Sabour", districtName: "Rohtas", kvk: "KVK Rohtas", mobile: "06185222800", address: "Ara Road, Bikramganj, Rohtas PIN-802212", email: "rohtaskvk@gmail.com", sanctionYear: "2004" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "DRPCAU", districtName: "Vaishali", kvk: "KVK Vaishali", mobile: "6287797172", address: "KVK Vaishali", email: "head.kvk.vaishali@rpcau.ac.in", sanctionYear: "1997" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "DRPCAU", districtName: "Begusarai", kvk: "KVK Begusarai", mobile: "6287797169", address: "KVK Begusarai At- Khodawandpur, Post- Meghaul, Block- Khodawnandpur, Dist- Begusarai- 848202", email: "head.kvk.begusarai@rpcau.ac.in", sanctionYear: "1992" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "DRPCAU", districtName: "East Champaran", kvk: "KVK East Champaran-I", mobile: "6287797163", address: "KVK East Champaran", email: "head.kvk.piprakothi@rpcau.ac.in", sanctionYear: "2006" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "DRPCAU", districtName: "Darbhanga", kvk: "KVK Darbhanga", mobile: "6287797170", address: "KVK Darbhanga", email: "head.kvk.jale@rpcau.ac.in", sanctionYear: "1995" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "DRPCAU", districtName: "Siwan", kvk: "KVK Siwan", mobile: "6287797168", address: "KVK Siwan", email: "head.kvk.siwan@rpcau.ac.in", sanctionYear: "2004" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "BAU Sabour", districtName: "Purnea", kvk: "KVK Purnea", mobile: "9430613389", address: "KVK PURNEA, POST-JALALGARH, DIST-PURNEA, PIN-854327", email: "purneakvk@gmail.com", sanctionYear: "2004" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "ICAR-Research Complex for Eastern Region, Patna", districtName: "Buxar", kvk: "KVK Buxar", mobile: "06183222208", address: "Village-Lalganj, Itarhi Road, Post-Sondhila, District-Buxar, State-Bihar, Pin-802103", email: "buxarkvk@gmail.com", sanctionYear: "2007" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "BAU Sabour", districtName: "Nalanda", kvk: "KVK Nalanda", mobile: "9931499302", address: "KVK Nalanda Gonawan Road, Post Harnaut, Nalanda, Bihar", email: "nalandakvk2017@gmail.com", sanctionYear: "1992" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "BAU Sabour", districtName: "Saharsa", kvk: "KVK Saharsa", mobile: "9431413543", address: "KVK Saharsa", email: "saharsakvk@gmail.com", sanctionYear: "1984" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "BAU Sabour", districtName: "Supaul", kvk: "KVK Supaul", mobile: "9430949800", address: "Krishi Vigyan Kendra, Raghopur, Supaul Pin 852111", email: "supaulkvk@gmail.com", sanctionYear: "2006" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "BAU Sabour", districtName: "Sheikhpura", kvk: "KVK Sheikhpura", mobile: "7903914728", address: "KVK Sheikhpura", email: "kvksheikhpura@gmail.com", sanctionYear: "1996" },
  { zoneName: "Zone IV - Patna", stateName: "Bihar", hostOrg: "DRPCAU", districtName: "East Champaran II", kvk: "KVK East Champaran-II", mobile: "6287797164", address: "KVK East Champaran-II, Parsauni", email: "head.kvk.parsauni@rpcau.ac.in", sanctionYear: "2019" },
];
export const KVK_MASTER_TOTAL = 66;

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
