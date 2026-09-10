"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SimpleSelect } from "@/components/ui/simple-select";
import { cn } from "@/lib/utils";

export type MasterRow = Record<string, string>;

/** A row that acts as the free-text "Other" choice by its name alone - exact "Other"/"Others" only, so a real "Other Enterprises" category is untouched. */
function isOtherName(name: string | undefined): boolean {
  const n = (name ?? "").trim().toLowerCase();
  return n === "other" || n === "others";
}

/**
 * A master-sourced <select> that honours a row flagged "Mark as 'Other'
 * option": picking that row reveals a free-text input beside the select and
 * the typed value is what the form submits.
 *
 * Same behaviour as MasterFormFields' SourceMasterField, pulled out here for
 * the bespoke OFT / FLD forms which build their dropdowns by hand instead of
 * going through MasterFormFields. Callers pass the already-filtered rows for
 * a cascading field (e.g. only the categories under the chosen sector), so
 * the "Other" row is detected within that same filtered set.
 */
export function OtherAwareSelect({
  id,
  label,
  required,
  value,
  onChange,
  rows,
  allRows,
  optionKey,
  disabled,
  placeholder = "Please Select",
}: {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  /** Cascade-filtered rows for the current parent selection. */
  rows: MasterRow[];
  /**
   * The full unfiltered set, used only to source the flagged "Other" row.
   * That row is an escape hatch, not cascade data, so it stays offered even
   * when it belongs to a different parent than the one chosen. Defaults to
   * `rows` when the field has no cascade.
   */
  allRows?: MasterRow[];
  optionKey: string;
  disabled?: boolean;
  placeholder?: string;
}) {
  // Flagged row wins; otherwise a row literally named "Other"/"Others".
  const src = allRows ?? rows;
  const otherName = (
    src.find((r) => r._isOther === "1") ?? src.find((r) => isOtherName(r[optionKey]))
  )?.[optionKey];

  const options = useMemo(() => {
    const values = new Set(
      rows.map((r) => r[optionKey]).filter((v): v is string => Boolean(v?.trim())),
    );
    if (otherName) values.add(otherName);
    return Array.from(values).sort();
  }, [rows, optionKey, otherName]);
  const isOtherActive =
    Boolean(otherName) && (value === otherName || (Boolean(value) && !options.includes(value)));

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className={cn("flex gap-2", isOtherActive && "items-start")}>
        <SimpleSelect
          id={id}
          value={isOtherActive && otherName ? otherName : value}
          onValueChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          options={options.map((option) => ({ value: option, label: option }))}
          className={cn("h-10", isOtherActive ? "flex-1" : "w-full")}
        />
        {isOtherActive && (
          <Input
            aria-label={`${label} - other value`}
            className="h-10 flex-1"
            placeholder="Enter value"
            value={value === otherName ? "" : value}
            onChange={(e) =>
              onChange(e.target.value.trim() ? e.target.value : (otherName as string))
            }
          />
        )}
      </div>
    </div>
  );
}
