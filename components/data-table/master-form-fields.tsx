"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { SimpleSelect } from "@/components/ui/simple-select";
import { FileUploadField } from "./file-upload-field";
import { DemographicBreakdown, type DemographicValues } from "./demographic-breakdown";
import type { MasterColumn } from "@/lib/navigation";

export const DEMOGRAPHIC_KEYS = [
  "generalMale", "generalFemale", "obcMale", "obcFemale",
  "scMale", "scFemale", "stMale", "stFemale",
] as const;

/** "farmers" + "generalMale" -> "farmersGeneralMale" (real Prisma column name) - no prefix leaves the bare suffix untouched. Shared by every reader/writer of a prefixed demographic-breakdown block (this file, EmptyDataTable's openEdit, leaf-record-registry.ts) so they can never drift out of sync on casing. */
export function prefixedDemographicKey(prefix: string, suffix: string): string {
  return prefix ? `${prefix}${suffix[0].toUpperCase()}${suffix.slice(1)}` : suffix;
}
import {
  REPORT_ZONE_OPTIONS,
  districtsForState,
  hostOrgsForState,
  statesForZone,
} from "@/lib/reports";

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

function fetchSourceMasterRows(master: string): Promise<Record<string, string>[]> {
  let cached = sourceMasterCache.get(master);
  if (!cached) {
    cached = fetch(`/api/master-options?slug=${encodeURIComponent(master)}`)
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
  const { master, optionKey, filterKey } = column.sourceMaster;

  useEffect(() => {
    let cancelled = false;
    fetchSourceMasterRows(master).then((r) => {
      if (!cancelled) setRows(r);
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

  return (
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
      className="h-10"
    />
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

  return (
    <>
      {columns.map((column) => {
        if (column.readonly) return null;
        const fieldId = `${instanceId}-${column.key}`;
        const isCascading = Boolean(cascadeType && CASCADE_FIELDS[cascadeType]?.has(column.key));
        const isHostOrgField =
          cascadeType === "kvk" && column.key === "hostOrg";
        const isDistrictField =
          cascadeType === "institute" && column.key === "districtName";
        const isStateField = column.key === "stateName";

        if (column.fieldKind === "demographic-breakdown") {
          const prefix = column.demographicPrefix ?? "";
          const demoValues: DemographicValues = {};
          for (const suffix of DEMOGRAPHIC_KEYS) {
            demoValues[suffix] = formValues[prefixedDemographicKey(prefix, suffix)] ?? "";
          }
          return (
            <div key={column.key} className="space-y-2 sm:col-span-2 lg:col-span-3">
              <p className="text-sm font-semibold text-primary">{column.label}</p>
              <DemographicBreakdown
                values={demoValues}
                onChange={(key, value) =>
                  onChange({ ...formValues, [prefixedDemographicKey(prefix, key)]: value })
                }
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
              ? REPORT_ZONE_OPTIONS
              : isStateField
                ? statesForZone(formValues.zoneName ?? "")
                : isHostOrgField
                  ? hostOrgsForState(formValues.stateName ?? "")
                  : isDistrictField
                    ? districtsForState(formValues.stateName ?? "")
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
              className="h-10"
              value={formValues[column.key] ?? ""}
              placeholder={column.placeholder ?? `Enter ${(column.formLabel ?? column.label).toLowerCase()}`}
              onChange={(event) =>
                onChange({ ...formValues, [column.key]: event.target.value })
              }
            />
          </div>
        );
      })}

      {isSimpleMaster && (
        <label className="flex items-center gap-2 text-sm text-foreground">
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
