"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CATEGORIES = ["General", "OBC", "SC", "ST"] as const;

export type DemographicValues = Record<string, string>;

function n(values: DemographicValues, key: string): number {
  const parsed = Number(values[key]);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * The General/OBC/SC/ST x Male/Female breakdown-with-auto-computed-totals
 * block recurring across CFLD, On Farm Trial, Technology Week Celebration,
 * and World Soil Day forms in the real reference - built once here and
 * reused wherever it recurs, per the standing note not to reimplement it
 * per form.
 */
export function DemographicBreakdown({
  values,
  onChange,
}: {
  values: DemographicValues;
  onChange: (key: string, value: string) => void;
}) {
  const maleTotal = CATEGORIES.reduce(
    (sum, c) => sum + n(values, `${c.toLowerCase()}Male`),
    0,
  );
  const femaleTotal = CATEGORIES.reduce(
    (sum, c) => sum + n(values, `${c.toLowerCase()}Female`),
    0,
  );
  const grandTotal = maleTotal + femaleTotal;

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <th className="px-3 py-2">Category</th>
            <th className="px-3 py-2">Male</th>
            <th className="px-3 py-2">Female</th>
            <th className="px-3 py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {CATEGORIES.map((category) => {
            const maleKey = `${category.toLowerCase()}Male`;
            const femaleKey = `${category.toLowerCase()}Female`;
            const rowTotal = n(values, maleKey) + n(values, femaleKey);
            return (
              <tr
                key={category}
                className="border-b border-border last:border-0"
              >
                <td className="px-3 py-2 font-medium text-foreground">
                  {category}
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    min="0"
                    value={values[maleKey] ?? ""}
                    onChange={(e) => onChange(maleKey, e.target.value)}
                    className="h-8 w-24"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    min="0"
                    value={values[femaleKey] ?? ""}
                    onChange={(e) => onChange(femaleKey, e.target.value)}
                    className="h-8 w-24"
                  />
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                  {rowTotal}
                </td>
              </tr>
            );
          })}
          <tr className="bg-muted/30 font-semibold">
            <td className="px-3 py-2 text-foreground">Total</td>
            <td className="px-3 py-2 tabular-nums text-foreground">
              {maleTotal}
            </td>
            <td className="px-3 py-2 tabular-nums text-foreground">
              {femaleTotal}
            </td>
            <td className="px-3 py-2 text-right tabular-nums text-foreground">
              {grandTotal}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const GRID_FIELDS = [
  { key: "generalMale", label: "General M" },
  { key: "generalFemale", label: "General F" },
  { key: "obcMale", label: "OBC M" },
  { key: "obcFemale", label: "OBC F" },
  { key: "scMale", label: "SC M" },
  { key: "scFemale", label: "SC F" },
  { key: "stMale", label: "ST M" },
  { key: "stFemale", label: "ST F" },
] as const;

/**
 * Flat General/OBC/SC/ST x Male/Female input grid + three total badges
 * (Total Male/Total Female/Overall Total) below - the real reference shape
 * for Training and FLD's own Farmers Details (confirmed live, 2026-09-02),
 * distinct from the table DemographicBreakdown above renders for CFLD/OFT/
 * Technology Week/World Soil Day. Kept as its own component rather than a
 * variant flag on the table, since the two layouts share no markup.
 */
export function DemographicGrid({
  values,
  onChange,
}: {
  values: DemographicValues;
  onChange: (key: string, value: string) => void;
}) {
  const maleTotal = ["generalMale", "obcMale", "scMale", "stMale"].reduce(
    (sum, key) => sum + n(values, key),
    0,
  );
  const femaleTotal = ["generalFemale", "obcFemale", "scFemale", "stFemale"].reduce(
    (sum, key) => sum + n(values, key),
    0,
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {GRID_FIELDS.map(({ key, label }) => (
          <div key={key} className="space-y-1.5">
            <Label htmlFor={`demo-grid-${key}`}>
              {label} <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`demo-grid-${key}`}
              type="number"
              min="0"
              value={values[key] ?? ""}
              onChange={(e) => onChange(key, e.target.value)}
            />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 pt-1">
        <span className="rounded-md bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
          TOTAL MALE {maleTotal}
        </span>
        <span className="rounded-md bg-pink-100 px-3 py-1.5 text-xs font-semibold text-pink-700">
          TOTAL FEMALE {femaleTotal}
        </span>
        <span className="rounded-md bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700">
          OVERALL TOTAL {maleTotal + femaleTotal}
        </span>
      </div>
    </div>
  );
}
