"use client";

import { Input } from "@/components/ui/input";
import { NF_COMPARISON_PARAMETERS } from "@/lib/report-types";

type Pair = { without: string; with: string };
type ParamMap = Record<string, Pair>;

function parse(value: string): ParamMap {
  try {
    const parsed = JSON.parse(value || "{}");
    if (parsed && typeof parsed === "object") return parsed as ParamMap;
  } catch {
    // Malformed JSON - start from an empty map rather than throwing.
  }
  return {};
}

/**
 * The fixed "Performance Without NF Practice / With NF Practice" comparison
 * grid the real report prints for every farmer in "3.5.C Demonstration
 * Information" and "3.5.D Farmers Practicing" (super-v2-prod.pdf p.66-74).
 * Stores the whole grid as one JSON string on the record's `parameters`
 * column, keyed by NF_COMPARISON_PARAMETERS' own `key`.
 */
export function NfParametersField({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const map = parse(value);

  const set = (key: string, side: "without" | "with", next: string) => {
    const current: Pair = map[key] ?? { without: "", with: "" };
    onChange(JSON.stringify({ ...map, [key]: { ...current, [side]: next } }));
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <th className="px-3 py-2">Name of parameter</th>
            <th className="px-3 py-2">Performance Without NF Practice</th>
            <th className="px-3 py-2">Performance With NF Practice</th>
          </tr>
        </thead>
        <tbody>
          {NF_COMPARISON_PARAMETERS.map(({ key, label }) => {
            const pair = map[key] ?? { without: "", with: "" };
            return (
              <tr key={key} className="border-b border-border last:border-0">
                <td className="px-3 py-2 font-medium text-foreground">{label}</td>
                <td className="px-3 py-2">
                  <Input
                    value={pair.without ?? ""}
                    onChange={(e) => set(key, "without", e.target.value)}
                    className="h-8"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    value={pair.with ?? ""}
                    onChange={(e) => set(key, "with", e.target.value)}
                    className="h-8"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
