"use client";

import { Input } from "@/components/ui/input";

const CATEGORIES = ["General", "OBC", "SC", "ST"] as const;

export type DemographicValues = Record<string, string>;

function n(values: DemographicValues, key: string): number {
  const parsed = Number(values[key]);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * The General/OBC/SC/ST x Male/Female breakdown-with-auto-computed-totals
 * block recurring across CFLD, On Farm Trial, Technology Week Celebration,
 * and World Soil Day forms in the real reference — built once here and
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
  const maleTotal = CATEGORIES.reduce((sum, c) => sum + n(values, `${c.toLowerCase()}Male`), 0);
  const femaleTotal = CATEGORIES.reduce((sum, c) => sum + n(values, `${c.toLowerCase()}Female`), 0);
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
              <tr key={category} className="border-b border-border last:border-0">
                <td className="px-3 py-2 font-medium text-foreground">{category}</td>
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
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{rowTotal}</td>
              </tr>
            );
          })}
          <tr className="bg-muted/30 font-semibold">
            <td className="px-3 py-2 text-foreground">Total</td>
            <td className="px-3 py-2 tabular-nums text-foreground">{maleTotal}</td>
            <td className="px-3 py-2 tabular-nums text-foreground">{femaleTotal}</td>
            <td className="px-3 py-2 text-right tabular-nums text-foreground">{grandTotal}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
