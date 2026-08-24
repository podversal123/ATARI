const BADGE_COLORS = [
  "border-sky-300 text-sky-700",
  "border-emerald-300 text-emerald-700",
  "border-violet-300 text-violet-700",
  "border-amber-300 text-amber-700",
] as const;

const BAR_COLORS = [
  "bg-sky-300",
  "bg-emerald-300",
  "bg-violet-300",
  "bg-amber-300",
] as const;

/**
 * Real sanctioned-post designations - the first 4 from the Dashboard
 * reference screenshot (Senior Scientist & Head, SMS (Subject Matter
 * Specialist), Programme Assistant (Lab Technician), Programme Assistant
 * (Computer)); Farm Manager, Assistant and Stenographer confirmed from the
 * live AAMS "Sanctioned post" field in the client's KVK staff export. Counts
 * stay honest zeros until the database step lands, per this app's convention
 * everywhere else.
 */
const STAFF_ROLES = [
  "Senior Scientist & Head",
  "SMS (Subject Matter Specialist)",
  "Programme Assistant (Lab Technician)",
  "Programme Assistant (Computer)",
  "Farm Manager",
  "Assistant",
  "Stenographer",
];

/** Fixed to 450px so this card matches the real rendered height of the OFT/FLD/Training/Extension progress cards above it - this dashboard's other row of content cards - rather than drifting to whatever height its own content happens to need. */
export function StaffSummaryCard() {
  return (
    <div className="flex h-[450px] flex-col rounded-lg border border-border bg-card p-5">
      <p className="text-xs font-bold tracking-wide text-primary uppercase">
        Staff Summary
      </p>
      <div className="mt-3 min-h-0 flex-1 -mx-5 overflow-y-auto border-t border-border">
        {STAFF_ROLES.map((role, index) => (
          <div
            key={role}
            className="flex items-center gap-3 border-b border-border px-5 py-3 last:border-0"
          >
            <span className="w-4 shrink-0 text-sm text-muted-foreground">
              {index + 1}
            </span>
            <span className="flex-1 text-sm font-semibold text-foreground">
              {role}
            </span>
            <div className="hidden h-1.5 w-32 shrink-0 overflow-hidden rounded-full bg-muted sm:block">
              <div
                className={`h-full w-0 rounded-full ${BAR_COLORS[index % BAR_COLORS.length]}`}
              />
            </div>
            <span
              className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-semibold tabular-nums ${BADGE_COLORS[index % BADGE_COLORS.length]}`}
            >
              0
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
