"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { SimpleSelect } from "@/components/ui/simple-select";
import { FileUploadField } from "./file-upload-field";
import { MultiImageUploadField } from "./multi-image-upload-field";
import { FormPhotosField, type FormPhoto } from "./form-photos-field";
import { DemographicBreakdown, DemographicGrid, type DemographicValues } from "./demographic-breakdown";
<<<<<<< HEAD
import { NfParametersField } from "./nf-parameters-field";
=======
import { useCascadeOptions } from "./use-cascade-options";
import { isNumericLabel } from "@/lib/numeric-field";
>>>>>>> 8c564673795263a76c44db3f89567bdc06a28aab
import type { MasterColumn } from "@/lib/navigation";

export const DEMOGRAPHIC_KEYS = [
  "generalMale", "generalFemale", "obcMale", "obcFemale",
  "scMale", "scFemale", "stMale", "stFemale",
] as const;

/** "farmers" + "generalMale" -> "farmersGeneralMale" (real Prisma column name) - no prefix leaves the bare suffix untouched. Shared by every reader/writer of a prefixed demographic-breakdown block (this file, EmptyDataTable's openEdit, leaf-record-registry.ts) so they can never drift out of sync on casing. */
export function prefixedDemographicKey(prefix: string, suffix: string): string {
  return prefix ? `${prefix}${suffix[0].toUpperCase()}${suffix.slice(1)}` : suffix;
}

/**
 * Which columns cascade for each `cascadeType`, keyed separately per type
 * rather than one shared set - district-master's own "districtName" column
 * is the free-text name of the record being created, while institute's
 * "districtName" is a real cascading parent picker, so the same key can't
 * share one global membership test across both.
 */
const CASCADE_FIELDS: Record<string, Set<string>> = {
  district: new Set(["zoneName", "stateName"]),
  kvk: new Set(["zoneName", "stateName", "hostOrg"]),
  institute: new Set(["zoneName", "stateName", "districtName"]),
};

/**
 * Options for one `sourceMaster` field, fetched once per source master
 * (not once per field) and cached for the component's lifetime - Category
 * and Sub-category both source from the same "sector" master, so without
 * this cache a form with several sourceMaster fields would re-fetch the
 * same list once per field on every render.
 */
const sourceMasterCache = new Map<string, Promise<Record<string, string>[]>>();

/** Sentinel `sourceMaster.master` value meaning "this KVK's own Staff list" (/api/staff-options) rather than a real zone-wide master slug (/api/master-options) - Staff belongs to one KVK, unlike every other cross-master dropdown, so it needs its own endpoint, not a real "staff" master row. */
const STAFF_SOURCE = "__staff__";

function fetchSourceMasterRows(master: string): Promise<Record<string, string>[]> {
  let cached = sourceMasterCache.get(master);
  if (!cached) {
    const url = master === STAFF_SOURCE ? "/api/staff-options" : `/api/master-options?slug=${encodeURIComponent(master)}`;
    cached = fetch(url)
      .then((res) => (res.ok ? res.json() : { rows: [] }))
      .then((data) => (data.rows ?? []) as Record<string, string>[])
      .catch(() => []);
    sourceMasterCache.set(master, cached);
  }
  return cached;
}

/** Red "*" after a field's label when `MasterColumn.required` is set - same convention as the reference's own Create forms. */
function FieldLabel({ htmlFor, required, children }: { htmlFor: string; required?: boolean; children: ReactNode }) {
  return (
    <Label htmlFor={htmlFor}>
      {children}
      {required && <span className="text-destructive"> *</span>}
    </Label>
  );
}

/** A <select> populated by another master's real saved rows instead of free text - see MasterColumn.sourceMaster. */
function SourceMasterField({
  column,
  fieldId,
  value,
  dependsOnValue,
  dependsOnLabel,
  disabled,
  onChange,
}: {
  column: MasterColumn & { sourceMaster: NonNullable<MasterColumn["sourceMaster"]> };
  fieldId: string;
  value: string;
  dependsOnValue?: string;
  dependsOnLabel?: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [loaded, setLoaded] = useState(false);
  const { master, optionKey, filterKey } = column.sourceMaster;

  useEffect(() => {
    let cancelled = false;
    fetchSourceMasterRows(master).then((r) => {
      if (!cancelled) {
        setRows(r);
        setLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [master]);

  const options = Array.from(
    new Set(
      rows
        .filter((row) => !filterKey || !dependsOnValue || row[filterKey] === dependsOnValue)
        .map((row) => row[optionKey])
        .filter((v): v is string => Boolean(v)),
    ),
  ).sort();

  // Reference's own "empty options" caption (confirmed live, 2026-09-03 client screenshot: "No product types available for this category" / "No products available for this type" under Production & Supply's cascading Product Type/Product selects) - shown whenever the real fetched list resolves to zero rows, not just while genuinely waiting on the parent field.
  const noOptions = loaded && !disabled && options.length === 0;
  const captionNoun = `${(column.formLabel ?? column.label).toLowerCase()}s`;
  const dependsOnNoun = dependsOnLabel?.trim().split(/\s+/).pop()?.toLowerCase();

  return (
    <div>
      <SimpleSelect
        id={fieldId}
        value={value}
        disabled={disabled}
        onValueChange={onChange}
        placeholder={
          disabled
            ? `Select ${dependsOnLabel ?? "the required field"} first`
            : `Select ${column.formLabel ?? column.label}`
        }
        options={options.map((option) => ({ value: option, label: option }))}
        className={cn("h-10", noOptions && "rounded-b-none")}
      />
      {noOptions && (
        <div className="flex items-center gap-1.5 rounded-b-md border border-t-0 border-border bg-muted/60 px-3 py-1.5 text-xs text-muted-foreground">
          <Info className="size-3.5 shrink-0" />
          <span>No {captionNoun} available{dependsOnNoun ? ` for this ${dependsOnNoun}` : ""}</span>
        </div>
      )}
    </div>
  );
}

type MasterFormFieldsProps = {
  columns: MasterColumn[];
  cascadeType?: "district" | "kvk" | "institute";
  formValues: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
  isSimpleMaster: boolean;
  markAsOther: boolean;
  onMarkAsOtherChange: (checked: boolean) => void;
};

/**
 * The per-column Add/Edit field list - one text field per confirmed column,
 * plus the cascading Zone->State->HostOrg selects for the two masters that
 * need them, plus the "Mark as 'Other' option" checkbox for simple
 * single-Name masters. Shared between EmptyDataTable's dialog (Masters,
 * Targets, Notifications) and the dedicated Add page (Form Management, per
 * client direction that Form Management's Add New opens a full page instead
 * of a popup) so the two flows don't duplicate this logic.
 */
export function MasterFormFields({
  columns,
  cascadeType,
  formValues,
  onChange,
  isSimpleMaster,
  markAsOther,
  onMarkAsOtherChange,
}: MasterFormFieldsProps) {
  const instanceId = useId();
  const cascade = useCascadeOptions(Boolean(cascadeType));
  /** Form-field render order only - list columns elsewhere always read the raw `columns` prop untouched. Stable sort (index tiebreak, not relying on Array.sort's own stability) so fields without a formOrder keep their original relative position, just pushed after every numbered field. */
  const orderedColumns = columns
    .map((column, index) => ({ column, index }))
    .sort((a, b) => {
      const orderA = a.column.formOrder ?? Infinity;
      const orderB = b.column.formOrder ?? Infinity;
      return orderA !== orderB ? orderA - orderB : a.index - b.index;
    })
    .map(({ column }) => column);

  /**
   * Groups adjacent `pairWithNext` fields (e.g. Unit + Quantity) into one
   * shared grid cell, everything else stays one field per cell - see
   * MasterColumn's own `pairWithNext` comment for why. Consecutive
   * `fileKind` fields (Photo + Resume, ...) get the same treatment
   * automatically, no flag needed - full-width side by side (client
   * direction, 2026-09-03: "ek hi row me dono rkho jaise add new me kiya h",
   * matching how EmployeeDetailsAddForm's own hand-built "Photo & Resume"
   * section lays its two cards out) instead of the old one-per-row stack.
   */
  const renderUnits: (MasterColumn | MasterColumn[])[] = [];
  for (let i = 0; i < orderedColumns.length; i++) {
    const column = orderedColumns[i];
    const next = orderedColumns[i + 1];
    if (column.pairWithNext && next) {
      renderUnits.push([column, next]);
      i++;
    } else if (column.fileKind && next?.fileKind) {
      const group = [column];
      let j = i + 1;
      while (j < orderedColumns.length && orderedColumns[j].fileKind) {
        group.push(orderedColumns[j]);
        j++;
      }
      renderUnits.push(group);
      i = j - 1;
    } else {
      renderUnits.push(column);
    }
  }

  function renderColumn(column: MasterColumn) {
        // "calculated" is a real-but-disabled form field (has a value, just
        // not editable) - the opposite of what plain `readonly` means here
        // (dropped from the form entirely), so it has to bypass that check.
        if (column.readonly && column.fieldKind !== "calculated") return null;
        const fieldId = `${instanceId}-${column.key}`;
        const isCascading = Boolean(cascadeType && CASCADE_FIELDS[cascadeType]?.has(column.key));
        const isHostOrgField =
          cascadeType === "kvk" && column.key === "hostOrg";
        const isDistrictField =
          cascadeType === "institute" && column.key === "districtName";
        const isStateField = column.key === "stateName";

        if (column.fieldKind === "section-heading") {
          return (
            <p key={column.key} className="col-[1/-1] text-lg font-semibold text-primary">
              {column.label}
            </p>
          );
        }

        if (column.fieldKind === "calculated") {
          return (
            <div key={column.key} className="space-y-1.5">
              <Label htmlFor={fieldId}>
                {column.formLabel ?? column.label} <span className="text-destructive">*</span>
              </Label>
              <Input id={fieldId} disabled value={formValues[column.key] ?? ""} className="h-10 bg-muted" />
              {column.helperText && <p className="text-xs text-muted-foreground">{column.helperText}</p>}
            </div>
          );
        }

        if (column.fieldKind === "demographic-breakdown") {
          const prefix = column.demographicPrefix ?? "";
          const demoValues: DemographicValues = {};
          for (const suffix of DEMOGRAPHIC_KEYS) {
            demoValues[suffix] = formValues[prefixedDemographicKey(prefix, suffix)] ?? "";
          }
          const demoOnChange = (key: string, value: string) =>
            onChange({ ...formValues, [prefixedDemographicKey(prefix, key)]: value });
          return (
            <div key={column.key} className="space-y-2 sm:col-span-2 lg:col-span-3">
              <p className="text-lg font-semibold text-primary">{column.label}</p>
              {column.demographicVariant === "grid" ? (
                <DemographicGrid values={demoValues} onChange={demoOnChange} />
              ) : (
                <DemographicBreakdown values={demoValues} onChange={demoOnChange} />
              )}
            </div>
          );
        }

        if (column.fieldKind === "multi-image" && column.uploadKind) {
          let value: string[] = [];
          try {
            const parsed = JSON.parse(formValues[column.key] || "[]");
            if (Array.isArray(parsed)) value = parsed.filter((v): v is string => typeof v === "string");
          } catch {
            // Leave value empty on malformed JSON rather than throwing.
          }
          // Full width (`col-[1/-1]`, works in both the compact auto-fit
          // grid and the plain numbered one) with its own real section
          // heading above the dropzone instead of MultiImageUploadField's
          // own small field-size label - matches the "Photographs" heading
          // size everywhere else this same section recurs (FormPhotosField,
          // OftResultFields), confirmed live 2026-09-03 (Award and
          // Recognition's own Farmer leaf).
          return (
            <div key={column.key} className="col-[1/-1] space-y-2">
              <p className="text-lg font-semibold text-primary">{column.formLabel ?? column.label}</p>
              <MultiImageUploadField
                uploadKind={column.uploadKind}
                value={value}
                onChange={(urls) => onChange({ ...formValues, [column.key]: JSON.stringify(urls) })}
              />
            </div>
          );
        }

        if (column.fieldKind === "photos") {
          let photos: FormPhoto[] = [];
          try {
            const parsed = JSON.parse(formValues[column.key] || "[]");
            if (Array.isArray(parsed)) {
              photos = parsed
                .filter((p): p is FormPhoto => typeof p?.url === "string")
                .map((p) => ({ url: p.url, caption: typeof p.caption === "string" ? p.caption : "" }));
            }
          } catch {
            // Leave photos empty on malformed JSON rather than throwing.
          }
          return (
            <div key={column.key} className="sm:col-span-2 lg:col-span-3">
              <FormPhotosField
                label={column.formLabel ?? column.label}
                value={photos}
                onChange={(next) => onChange({ ...formValues, [column.key]: JSON.stringify(next) })}
              />
            </div>
          );
        }

        if (column.fieldKind === "nf-parameters") {
          return (
            <div key={column.key} className="space-y-2 sm:col-span-2 lg:col-span-3">
              <p className="text-sm font-semibold text-primary">{column.formLabel ?? column.label}</p>
              <NfParametersField
                value={formValues[column.key] ?? ""}
                onChange={(next) => onChange({ ...formValues, [column.key]: next })}
              />
            </div>
          );
        }

        if (column.fieldKind === "checkbox") {
          return (
            <label key={column.key} className="flex items-center gap-2 pt-6 text-sm text-foreground">
              <Checkbox
                id={fieldId}
                checked={formValues[column.key] === "true"}
                onCheckedChange={(checked) =>
                  onChange({ ...formValues, [column.key]: String(checked === true) })
                }
              />
              {column.formLabel ?? column.label}
            </label>
          );
        }

        if (column.staticOptions) {
          return (
            <div key={column.key} className="space-y-1.5">
              <FieldLabel htmlFor={fieldId} required={column.required}>
                {column.formLabel ?? column.label}
              </FieldLabel>
              <SimpleSelect
                id={fieldId}
                value={formValues[column.key] ?? ""}
                onValueChange={(v) => onChange({ ...formValues, [column.key]: v })}
                placeholder={`Select ${column.label}`}
                options={column.staticOptions.map((option) => ({ value: option, label: option }))}
                className="h-10"
              />
            </div>
          );
        }

        if (column.fileKind) {
          // Width/full-row wrapping is handled by the renderUnits grouping
          // above (a lone fileKind field still needs `col-[1/-1]` - the
          // card drop-zone style reads badly squeezed into a single
          // ~280px track - grouped ones get it from their shared wrapper).
          return (
            <FileUploadField
              key={column.key}
              column={column}
              fieldId={fieldId}
              value={formValues[column.key] ?? ""}
              onChange={(url) => onChange({ ...formValues, [column.key]: url })}
            />
          );
        }

        if (column.sourceMaster) {
          const { dependsOnKey } = column.sourceMaster;
          const dependsOnValue = dependsOnKey ? formValues[dependsOnKey] : undefined;
          const disabled = Boolean(dependsOnKey) && !dependsOnValue;
          return (
            <div key={column.key} className="space-y-1.5">
              <FieldLabel htmlFor={fieldId} required={column.required}>
                {column.formLabel ?? column.label}
              </FieldLabel>
              <SourceMasterField
                column={column as MasterColumn & { sourceMaster: NonNullable<MasterColumn["sourceMaster"]> }}
                fieldId={fieldId}
                value={formValues[column.key] ?? ""}
                dependsOnValue={dependsOnValue}
                dependsOnLabel={columns.find((c) => c.key === dependsOnKey)?.label}
                disabled={disabled}
                onChange={(value) => {
                  // Clear any field that itself sources from this one, so a changed parent can't leave a stale, now-invalid child selection behind.
                  const dependents = Object.fromEntries(
                    columns
                      .filter((c) => c.sourceMaster?.dependsOnKey === column.key)
                      .map((c) => [c.key, ""]),
                  );
                  onChange({ ...formValues, [column.key]: value, ...dependents });
                }}
              />
            </div>
          );
        }

        if (isCascading) {
          const options =
            column.key === "zoneName"
              ? cascade.zoneOptions
              : isStateField
                ? cascade.statesForZone(formValues.zoneName ?? "")
                : isHostOrgField
                  ? cascade.hostOrgsForState(formValues.stateName ?? "")
                  : isDistrictField
                    ? cascade.districtsForState(formValues.stateName ?? "")
                    : [];
          const disabled =
            (isStateField && !formValues.zoneName) ||
            (isHostOrgField && !formValues.stateName) ||
            (isDistrictField && !formValues.stateName);
          // A changed Zone/State must clear whatever downstream cascading field it invalidates - but only the ones this cascadeType actually cascades (institute's own districtName picks a real district, while district-master's own same-named field is the free-text name of the record being created, which must survive a Zone/State change untouched).
          const clearedDownstream: Record<string, string> =
            cascadeType === "institute" ? { hostOrg: "", districtName: "" } : { hostOrg: "" };

          return (
            <div key={column.key} className="space-y-1.5">
              <FieldLabel htmlFor={fieldId} required={column.required}>
                {column.label}
              </FieldLabel>
              <SimpleSelect
                id={fieldId}
                value={formValues[column.key] ?? ""}
                disabled={disabled}
                onValueChange={(v) =>
                  onChange({
                    ...formValues,
                    [column.key]: v,
                    ...(column.key === "zoneName" ? { stateName: "", ...clearedDownstream } : {}),
                    ...(isStateField ? clearedDownstream : {}),
                  })
                }
                placeholder={
                  disabled
                    ? `Select ${column.key === "stateName" ? "a zone" : "a state"} first`
                    : `Select ${column.label}`
                }
                options={options.map((option) => ({ value: option, label: option }))}
                className="h-10"
              />
            </div>
          );
        }

        return (
          <div key={column.key} className="space-y-1.5">
            <FieldLabel htmlFor={fieldId} required={column.required}>
              {column.formLabel ?? column.label}
            </FieldLabel>
            <Input
              id={fieldId}
              type={
                column.fieldKind === "date"
                  ? "date"
                  : isNumericLabel(column.formLabel ?? column.label)
                    ? "number"
                    : undefined
              }
              className="h-10"
              value={formValues[column.key] ?? ""}
              placeholder={
                column.fieldKind === "date"
                  ? undefined
                  : (column.placeholder ?? `Enter ${(column.formLabel ?? column.label).toLowerCase()}`)
              }
              onChange={(event) =>
                onChange({ ...formValues, [column.key]: event.target.value })
              }
            />
          </div>
        );
  }

  return (
    <>
      {renderUnits.map((unit) => {
        if (Array.isArray(unit)) {
          const key = unit.map((c) => c.key).join("-");
          // A grouped run of fileKind fields (Photo + Resume, ...) - full
          // width, side by side, same as a pairWithNext pair's own shared
          // cell but spanning the whole row instead of one grid track.
          // auto-fit + a bounded 260-380px track (not an even split) so the
          // cards stay naturally sized instead of stretching to fill
          // whatever width the row has (client report, 2026-09-03).
          if (unit[0].fileKind) {
            return (
              <div key={key} className="col-[1/-1] grid grid-cols-[repeat(auto-fit,minmax(260px,380px))] gap-5">
                {unit.map((column) => renderColumn(column))}
              </div>
            );
          }
          return (
            <div key={key} className="grid grid-cols-2 gap-3">
              {renderColumn(unit[0])}
              {renderColumn(unit[1])}
            </div>
          );
        }
        // A lone (ungrouped) fileKind field spans the full row (`col-[1/-1]`)
        // but still gets a bounded 260-380px track of its own rather than
        // stretching to fill it (same reasoning as the grouped case above).
        return unit.fileKind ? (
          <div key={unit.key} className="col-[1/-1] grid grid-cols-[repeat(auto-fit,minmax(260px,380px))]">
            {renderColumn(unit)}
          </div>
        ) : (
          renderColumn(unit)
        );
      })}

      {isSimpleMaster && (
        // `col-[1/-1]` always puts this on its own full-width last line (client
        // direction, 2026-09-02) instead of landing wherever the compact
        // auto-fit grid happens to have room next to it - a no-op outside a
        // grid parent (e.g. EmptyDataTable's dialog), so safe unconditionally.
        <label className="col-[1/-1] flex items-center gap-2 text-sm text-foreground">
          <Checkbox
            checked={markAsOther}
            onCheckedChange={(checked) => onMarkAsOtherChange(checked === true)}
          />
          Mark as &quot;Other&quot; option{" "}
          <span className="text-muted-foreground">(lets users type a custom value in forms)</span>
        </label>
      )}
    </>
  );
}
