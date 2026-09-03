/**
 * Whether a plain text/number Add/Edit field should render as
 * `<input type="number">` (native browser increment/decrement spinner,
 * matching how a "date" fieldKind already gets a native date picker) - client
 * direction, 2026-09-03: "date me calendar aata h waise hi number inputs me
 * increase decrease ka option dedo" (give number inputs the same +/- control
 * date fields already get). There's no per-field flag for this across the
 * ~150 leaves in lib/navigation.ts, so this infers it from the field's own
 * label text instead - checked against EXCLUDE first so an identifier-style
 * field (a phone/account/registration number, which nobody increments with a
 * spinner and which real reference forms never render as type="number")
 * never gets one even though its label contains a numeric-sounding word.
 */

const EXCLUDE_WORDS = new Set([
  // "no"/"crop"/"system"/"practice" deliberately left OUT despite being
  // identifier-ish in isolation (Registration No., Crop, Farming System) -
  // they also show up as plain modifiers inside real numeric labels ("No. of
  // Farmer", "Crop Yield (q/ha)", "System Productivity (q/ha)", "Yield Under
  // Farmer Practice"), and EXCLUDE always wins over INCLUDE below, so keeping
  // them here silently turned those back into plain text fields (audit
  // finding, 2026-09-03, live-checked against CRA Details' own Add form).
  "name", "code", "id", "ifsc", "email", "mobile", "phone", "contact",
  "registration", "account", "aadhar", "aadhaar", "pin", "pincode",
  "address", "remark", "remarks", "detail", "details", "description",
  "feedback", "purpose", "title", "venue", "village", "block", "taluk",
  "district", "zone", "state", "kvk", "variety", "season",
  "activity", "activities", "technology", "situation",
  "situations", "staff", "organization", "organisation", "agency",
  "scheme", "programme", "program", "project", "source", "sources",
  "sponsor", "sponsoring", "bank", "type", "category", "status", "kind",
  "position", "indicator", "item", "unit", "breed", "species", "gender",
  "specify", "please", "other", "others", "reason", "advantages",
  "observed", "carried", "out", "pattern",
]);

const INCLUDE_WORDS = new Set([
  "qty", "quantity", "amount", "amounts", "area", "areas", "cost", "costs",
  "income", "budget", "allocation", "allocated", "expenditure", "expense",
  "revenue", "balance", "grant", "grants", "number", "numbers", "count",
  "counts", "percent", "percentage", "age", "year", "years", "farmers",
  "farmer", "participants", "participant", "members", "member", "units",
  "days", "hours", "male", "female", "general", "obc", "sc", "st", "yield",
  "production", "productivity", "target", "targets", "achievement",
  "price", "salary", "latitude", "longitude", "weight", "height", "length",
  "width", "temperature", "rainfall", "value", "values", "total", "totals",
  "estimate", "released", "sanctioned", "purchased", "generated",
  "utilised", "utilized", "covered", "demonstrated", "attended",
  "organised", "organized", "visited", "collected", "analysed", "analyzed",
  "issued", "benefitted", "distributed", "sold", "obtained", "ratio",
  "rate", "rates", "sale", "sanctioned", "trainees", "trainee", "camps",
  "demonstrations", "visits", "courses", "products", "crops", "villages",
  "blocks", "groups", "drones", "installments", "installment", "return",
  "returns", "net", "gross", "margin", "rs",
]);

/**
 * Currency/measurement-unit markers that show up in a numeric field's own
 * label even when every real word in it is a domain acronym with no plain
 * English quantity word to match against INCLUDE_WORDS (e.g. "COC (Rs./ha)
 * - IP", "YIOFP (%) - IP", "GMR (Rs./ha) - FP" - all real DRMR Details
 * columns, audit finding 2026-09-03) - checked against the raw label, not
 * the word-split list, since "/ha" and "%" aren't words.
 */
const UNIT_MARKER_PATTERN = /%|₹|rs\.?\/|\brs\.?\)|\/ha\b|\/mt\b|\bha\)|\bkg\b|\bq\/ha\b|\bsq\.?\s?mt\b/i;

export function isNumericLabel(label: string): boolean {
  const words = label
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return false;
  if (words.some((word) => EXCLUDE_WORDS.has(word))) return false;
  if (words.some((word) => INCLUDE_WORDS.has(word))) return true;
  return UNIT_MARKER_PATTERN.test(label);
}
