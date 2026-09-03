/**
 * One-off sync: corrects officePhone/email/address/sanctionYear on existing
 * Kvk rows to match the live reference (https://atariams.org/view-kvks,
 * scraped 2026-09-03 - all 66 rows, all 7 pages). Matches rows by
 * districtName (a reliable, collision-free key - unlike KVK name, which
 * differs in punctuation/suffix between the two sites for a few rows).
 *
 * Deliberately does NOT touch zoneId/stateId/districtId/hostOrgId or rename
 * any KVK - those are structural/relational fields that already matched on
 * inspection, and touching them risks breaking the hostOrg name lookup or
 * (for a rename) the kvk-admin username derived from the KVK name.
 *
 * Run: npx tsx scripts/sync-kvk-from-reference.ts        (dry run, prints diff only)
 *      npx tsx scripts/sync-kvk-from-reference.ts --apply (writes the updates)
 */
import { config } from "dotenv";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

config({ path: ".env.local" });

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type RefRow = {
  district: string;
  mobile: string | null;
  email: string | null;
  address: string | null;
  sanctionYear: number | null;
};

// Transcribed verbatim from https://atariams.org/view-kvks, all 7 pages (66 rows), 2026-09-03.
const REFERENCE: RefRow[] = [
  { district: "Dumka", mobile: "9430112886", email: "dumkakvk@gmail.com", address: "Khuntabandh, District - Dumka, Pincode 814101, Jharkhand", sanctionYear: 2004 },
  { district: "Nawada", mobile: "6299316183", email: "nawadakvk@gmail.com", address: "Krishi Vigyan Kendra, Nawada, Gram Nirman Mandal, Sarvodaya Ashram, Sokhodeora, Kawakol, Nawada- 805106 (Bihar)", sanctionYear: 1979 },
  { district: "Araria", mobile: "9431645217", email: "arariaakvk@gmail.com", address: "KVK Araria", sanctionYear: 2004 },
  { district: "Arwal", mobile: "8210554284", email: "arwalkvk@gmail.com", address: "At - Lodipur, Post - Sarwarpur, PS - Mehandia, Block - Kaler, District - Arwal, Pin - 804428 (Bihar)", sanctionYear: 2008 },
  { district: "Aurangabad", mobile: "8298641285", email: "aurangabadkvk@gmail.com", address: "KVK Aurangabad", sanctionYear: 2006 },
  { district: "Banka", mobile: "9431659922", email: "bankakvk@gmail.com", address: "KVK Banka", sanctionYear: 1983 },
  { district: "Begusarai", mobile: "6287797169", email: "head.kvk.begusarai@rpcau.ac.in", address: "At- Khodawandpur, Post- Meghaul, Block- Khodawnandpur, Dist- Begusarai- 848202", sanctionYear: 1992 },
  { district: "Bhagalpur", mobile: "9939626493", email: "bhagalpurkvk@gmail.com", address: "Senior Scientist and Head, KVK, Bhagalpur, Bihar, Pin – 813 210", sanctionYear: 2004 },
  { district: "Bhojpur", mobile: "9431479522", email: "bhojpurkvk@gmail.com", address: "KVK Bhojpur", sanctionYear: 1994 },
  { district: "Bokaro", mobile: "9431339380", email: "kvkpetarwarbokaro@gmail.com", address: "KVK Bokaro", sanctionYear: 2004 },
  { district: "Buxar", mobile: "9470375113", email: "buxarkvk@gmail.com", address: "Village-Lalganj, Itarhi Road, Post-Sondhila, District-Buxar, State-Bihar, Pin-802103", sanctionYear: 2007 },
  { district: "Chatra", mobile: "9431339380", email: "chatrakvk@gmail.com", address: "KVK Chatra", sanctionYear: null },
  { district: "Darbhanga", mobile: "6287797170", email: "head.kvk.jale@rpcau.ac.in", address: "KVK Darbhanga", sanctionYear: 1995 },
  { district: "Deoghar", mobile: "7549106450", email: "kvkdeoghar@gmail.com", address: "Vill: Sujani, P.O. Ghorlash, Deoghar, Jharkhand, Pin: 814152", sanctionYear: 1985 },
  { district: "Dhanbad", mobile: "9431176741", email: "kvkdhanbadbau.2012@gmail.com", address: "KVK Dhanbad, Baliapur Farm, Dhanbad- 828201", sanctionYear: 2005 },
  { district: "East Champaran", mobile: "6287797163", email: "head.kvk.piprakothi@rpcau.ac.in", address: "KVK East Champaran", sanctionYear: 2006 },
  { district: "East Champaran II", mobile: "6287797164", email: "head.kvk.parsauni@rpcau.ac.in", address: "KVK East Champaran-II, Parsauni", sanctionYear: 2019 },
  { district: "East Singhbhum", mobile: "6201917544", email: "kvkeastsinghbhum2024@gmail.com", address: "KVK East Singhbhum", sanctionYear: 2005 },
  { district: "Garhwa", mobile: "8825322610", email: "garhwakvk@gmail.com", address: "KVK Garhwa", sanctionYear: 2005 },
  { district: "Gaya II (Aamas)", mobile: "9304808425", email: "kvkamasgaya@gmail.com", address: "KVK Gaya-II Amas, Pathra More, Manjholia, PIN Code 824219", sanctionYear: 2019 },
  { district: "Giridih", mobile: "8578090105", email: "kvkgiridih@gmail.com", address: "Topaiya Farm, Bengabad, Giridih- 815312", sanctionYear: 2004 },
  { district: "Godda", mobile: "9939498711", email: "kvkgodda@gmail.com", address: "Gramin Vikas Trust – Krishi Vigyan Kendra Chakeshwari Farm, Godda, Jharkhand, Pin-814133", sanctionYear: 2006 },
  { district: "Gopalganj", mobile: "8434383989", email: "head.kvk.sipaya@rpcau.ac.in", address: "KVK Gopalganj", sanctionYear: 2006 },
  { district: "Gumla", mobile: "9430955950", email: "kvk.gumla@gmail.com", address: "Krishi Vigyan Kendra GUmla Vikas Bharti Bishunpur PO-Bishunpur Dist- Gumka PIN-835231", sanctionYear: 2004 },
  { district: "Jamtara", mobile: "8051931636", email: "kvkbenajamtara@gmail.com", address: "KVK Jamtara", sanctionYear: null },
  { district: "Jamui", mobile: "8292847841", email: "basukvkjamui@gmail.com", address: "Krishi Vigyan Kendra, Vill: Garo Nawada, Panchayat: Thegua, Post: Jamui 811307 (Bihar)", sanctionYear: 2019 },
  { district: "Jehanabad", mobile: "8102372649", email: "jehanabadkvk@gmail.com", address: "Dr. Muneshwar Prasad, Sr. Scientist and Head Krishi Vigyan Kendra, Gandhar, Jehanabad (Bihar), PIN-804432", sanctionYear: 2006 },
  { district: "Kaimur", mobile: "9430567345", email: "kaimurkvk@gmail.com", address: "KVK Kaimur", sanctionYear: 1992 },
  { district: "Katihar", mobile: "9431266300", email: "katiharkvk@gmail.com", address: "Krishi Vigyan Kendra Katihar, Tingachhiya, Katihar, PIN-854103", sanctionYear: 2004 },
  { district: "Khagaria", mobile: "7903714090", email: "kvkkhagaria@gmail.com", address: "At- Permanandpur, Po- Koshi College", sanctionYear: 2010 },
  { district: "Khunti", mobile: "9451189312", email: "kvkkhunti@gmail.com", address: "KVK Khunti", sanctionYear: 2014 },
  { district: "Kishanganj", mobile: "9431204379", email: "kishanganjkvk@gmail.com", address: "Hawai Adda Road, Near BSF Head Quarter, Khagra, Kishanganj, Bihar, PIN – 855 107", sanctionYear: 2006 },
  { district: "Koderma", mobile: "9558277233", email: "kvkkodermanrri@gmail.com", address: "KVK Koderma", sanctionYear: null },
  { district: "Lakhisarai", mobile: "9931095869", email: "lakhisaraikvk@gmail.com", address: "Block - Halsi, Lakhisarai-8113118", sanctionYear: 2006 },
  { district: "Latehar", mobile: "7903285461", email: "kvk_latehar@rediffmail.com", address: "KVK Latehar", sanctionYear: 2007 },
  { district: "Lohardaga", mobile: "9142256839", email: "kvklohardaga2011@gmail.com", address: "KVK Lohardaga,@ Kisko on Lohardaga Latehar Road PIN 835302", sanctionYear: 2004 },
  { district: "Madhepura", mobile: "8987193648", email: "madhepura.kvk@gmail.com", address: "KVK Madhepura", sanctionYear: 2003 },
  { district: "Madhubani II (Sukhait)", mobile: "6287797165", email: "head.kvk.sukhet@rpcau.ac.in", address: "Sukhet, Jhanjharpur, Madhubani - 847404", sanctionYear: 2019 },
  { district: "Gaya", mobile: "9122386485", email: "kvkmanpurgaya@gmail.com", address: "KVK Gaya", sanctionYear: 2006 },
  { district: "Munger", mobile: "9608658459", email: "mungerkvk@gmail.com", address: "KVK Munger", sanctionYear: 1979 },
  { district: "Muzaffarpur", mobile: "6287797159", email: "head.kvk.saraiya@rpcau.ac.in", address: "KVK Muzaffarpur", sanctionYear: 1996 },
  { district: "Muzaffarpur Add (Muraul)", mobile: "9414856397", email: "head.kvk.turki@rpcau.ac.in", address: "KVK, Turki, Muzaffarpur-II", sanctionYear: 2016 },
  { district: "Nalanda", mobile: "9934488102", email: "nalandakvk2017@gmail.com", address: "KVK Nalanda Gonawan Road, Post Harnaut Nalada bihar", sanctionYear: 1992 },
  { district: "Pakur", mobile: "8210877355", email: "kvkpakur@gmail.com", address: "KVK Pakur", sanctionYear: 2004 },
  { district: "Palamau", mobile: "6201733007", email: "kvkchianki@gmail.com", address: "KVK Palamu", sanctionYear: 2002 },
  { district: "Patna", mobile: "9931312288", email: "patnakvk@gmail.com", address: "Krishi Vigyan Kendra, Agwanpur, Barh, Patna, PIN- 803214", sanctionYear: 1992 },
  { district: "Purnea", mobile: "9430613389", email: "purneakvk@gmail.com", address: "KVK PURNEA, POST-JALALGARH, DIST-PURNEA, PIN-854327", sanctionYear: 2004 },
  { district: "Ramgarh", mobile: "9430003184", email: "kvkramgarh2020@gamil.com", address: "KVK Ramgarh", sanctionYear: null },
  { district: "Ranchi", mobile: "9430379197", email: "kvk.divyayan@gmail.com", address: "Divyayan KVK, Ramakrishna Mission Ashrama, Morabadi, Ranchi - 834008(Jharkhand)", sanctionYear: 1977 },
  { district: "Rohtas", mobile: "9431479522", email: "rohtaskvk@gmail.com", address: "Ara Road, Bikramganj, Rohtas PIN-802212", sanctionYear: 2004 },
  { district: "Saharsa", mobile: "9431413543", email: "saharsakvk@gmail.com", address: "KVK Saharsa", sanctionYear: 1984 },
  { district: "Sahibganj", mobile: "9430112886", email: "sahibganjkvk@gmail.com", address: "NH-80, Near Saksharata More, PO- Jirwabari, Sahibganj - 816109 (Jharkhand)", sanctionYear: 2004 },
  { district: "Samastipur", mobile: "7295046855", email: "head.kvk.birauli@rpcau.ac.in", address: "KVK Samastipur", sanctionYear: null },
  { district: "Samastipur II (Lada)", mobile: "6287797166", email: "head.kvk.lada@rpcau.ac.in", address: "KVK Samastipur-II,Lada", sanctionYear: 2019 },
  { district: "Saraikela-Kharsawan", mobile: "7759985086", email: "kvksaraikela@gmail.com", address: "KVK,Saraikela-Kharsawan Near Teachers Training more, behind CHC (Community Health Centre), Gamharia Pin Code - 832108", sanctionYear: null },
  { district: "Sheikhpura", mobile: "7903914728", email: "kvksheikhpura@gmail.com", address: "KVK Sheikhpura", sanctionYear: 1996 },
  { district: "Sheohar", mobile: "7752828740", email: "head.kvk.sheohar@rpcau.ac.in", address: "KVK Sheohar", sanctionYear: 2006 },
  { district: "Simdega", mobile: "7004049495", email: "simdegakvk@gmail.com", address: "KVK Simdega", sanctionYear: null },
  { district: "Sitamarhi", mobile: "6228291040", email: "sitamarhikvk@gmail.com", address: "KVK Sitamarhi", sanctionYear: null },
  { district: "Siwan", mobile: "6287797168", email: "head.kvk.siwan@rpcau.ac.in", address: "KVK Siwan", sanctionYear: 2004 },
  { district: "Supaul", mobile: "9430949800", email: "supaulkvk@gmail.com", address: "Krishi Vigyan Kendra, Raghopur, Supaul Pin 852111", sanctionYear: 2006 },
  { district: "Vaishali", mobile: "6287797172", email: "head.kvk.vaishali@rpcau.ac.in", address: "KVK Vaishali", sanctionYear: 1997 },
  { district: "West Champaran", mobile: "8409999358", email: "head.kvk.madhopur@rpcau.ac.on", address: "KVK West Champaran-I, Madhopur", sanctionYear: 2004 },
  { district: "West Champaran II (Narkatiyaganj)", mobile: "6287797161", email: "head.kvk.narkatiyaganj@rpcau.ac.in", address: "KVK West Champaran-II, Narkatiyaganj", sanctionYear: 2019 },
  { district: "West Singhbhum", mobile: "8292524455", email: "kvkwsm2@gmail.com", address: "KVK West Singhbhum", sanctionYear: null },
  { district: "Saran", mobile: "6287797158", email: "head.kvk.manjhi@rpcau.ac.in", address: "KVK Saran", sanctionYear: 2006 },
];

function norm(v: string | null | undefined) {
  return (v ?? "").trim();
}

async function main() {
  const apply = process.argv.includes("--apply");
  const zone = await prisma.zone.findFirst();
  if (!zone) throw new Error("No zone found.");

  const kvks = await prisma.kvk.findMany({
    where: { zoneId: zone.id },
    include: { district: true },
  });

  const byDistrict = new Map(kvks.map((k) => [k.district.name.trim(), k]));

  let matched = 0;
  let changed = 0;
  const unmatchedRef: string[] = [];
  const unmatchedLocal: string[] = [];

  for (const ref of REFERENCE) {
    const local = byDistrict.get(ref.district.trim());
    if (!local) {
      unmatchedRef.push(ref.district);
      continue;
    }
    matched += 1;

    const nextMobile = ref.mobile ?? null;
    const nextEmail = ref.email ?? null;
    const nextAddress = ref.address ?? null;
    const nextYear = ref.sanctionYear;

    const diffs: string[] = [];
    if (norm(local.officePhone) !== norm(nextMobile)) diffs.push(`mobile "${local.officePhone}" -> "${nextMobile}"`);
    if (norm(local.email) !== norm(nextEmail)) diffs.push(`email "${local.email}" -> "${nextEmail}"`);
    if (norm(local.address) !== norm(nextAddress)) diffs.push(`address "${local.address}" -> "${nextAddress}"`);
    if ((local.sanctionYear ?? null) !== nextYear) diffs.push(`sanctionYear "${local.sanctionYear}" -> "${nextYear}"`);

    if (diffs.length > 0) {
      changed += 1;
      console.log(`\n[${local.name}] (district: ${ref.district})`);
      diffs.forEach((d) => console.log(`  ${d}`));
      if (apply) {
        await prisma.kvk.update({
          where: { id: local.id },
          data: {
            officePhone: nextMobile,
            email: nextEmail,
            address: nextAddress,
            sanctionYear: nextYear,
          },
        });
      }
    }
  }

  for (const [districtName, kvk] of byDistrict) {
    if (!REFERENCE.some((r) => r.district.trim() === districtName)) {
      unmatchedLocal.push(`${kvk.name} (district: ${districtName})`);
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Reference rows: ${REFERENCE.length}, matched to local: ${matched}, with differences: ${changed}`);
  if (unmatchedRef.length) console.log(`Reference districts with NO local match: ${unmatchedRef.join(", ")}`);
  if (unmatchedLocal.length) console.log(`Local KVKs with NO reference match: ${unmatchedLocal.join(", ")}`);
  console.log(apply ? "\nApplied." : "\nDry run only - pass --apply to write these changes.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
