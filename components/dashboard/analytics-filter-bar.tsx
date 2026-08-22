import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STATES, DISTRICTS, KVKS } from "@/lib/rbac";

type FilterField = {
  label: string;
  options: string[];
  placeholder?: string;
};

const FIELDS: FilterField[] = [
  { label: "Year", options: ["All"] },
  { label: "Zone", options: ["All", "Zone IV - Patna"] },
  { label: "State", options: ["All", ...STATES] },
  { label: "District", options: ["All", ...DISTRICTS] },
  { label: "Institute", options: ["All"] },
  { label: "KVK", options: ["All", ...KVKS.map((kvk) => kvk.name)] },
  { label: "Group By", options: ["Zone", "State", "District", "Institute", "KVK"], placeholder: "Select" },
  { label: "Breakdown", options: ["Status"] },
];

/** Filter row for the OFT/FLD "detailed analytics" pages — same 8 fields on both, unwired until the database step lands. */
export function AnalyticsFilterBar() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {FIELDS.map((field) => (
          <div key={field.label}>
            <label className="text-[11px] font-semibold tracking-wide text-primary uppercase">
              {field.label}
            </label>
            <select className="mt-1 h-8 w-full rounded-md border border-border bg-card px-2 text-sm text-foreground outline-none focus-visible:border-ring">
              {field.placeholder && <option value="">{field.placeholder}</option>}
              {field.options.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-end">
        <Button variant="outline-primary" size="sm">
          <RotateCcw className="size-3.5" />
          Reset filters
        </Button>
      </div>
    </div>
  );
}
