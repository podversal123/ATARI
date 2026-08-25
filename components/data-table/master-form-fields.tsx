"use client";

import { useId } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUploadField } from "./file-upload-field";
import type { MasterColumn } from "@/lib/navigation";
import {
  REPORT_ZONE_OPTIONS,
  hostOrgsForState,
  statesForZone,
} from "@/lib/reports";

const CASCADE_KEYS = new Set(["zoneName", "stateName", "hostOrg"]);

type MasterFormFieldsProps = {
  columns: MasterColumn[];
  cascadeType?: "district" | "kvk";
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
        const isCascading = cascadeType && CASCADE_KEYS.has(column.key);
        const isHostOrgField =
          cascadeType === "kvk" && column.key === "hostOrg";
        const isStateField = column.key === "stateName";

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

        if (isCascading) {
          const options =
            column.key === "zoneName"
              ? REPORT_ZONE_OPTIONS
              : isStateField
                ? statesForZone(formValues.zoneName ?? "")
                : isHostOrgField
                  ? hostOrgsForState(formValues.stateName ?? "")
                  : [];
          const disabled =
            (isStateField && !formValues.zoneName) ||
            (isHostOrgField && !formValues.stateName);

          return (
            <div key={column.key} className="space-y-1.5">
              <Label htmlFor={fieldId}>{column.label}</Label>
              <select
                id={fieldId}
                value={formValues[column.key] ?? ""}
                disabled={disabled}
                onChange={(event) =>
                  onChange({
                    ...formValues,
                    [column.key]: event.target.value,
                    ...(column.key === "zoneName"
                      ? { stateName: "", hostOrg: "" }
                      : {}),
                    ...(isStateField ? { hostOrg: "" } : {}),
                  })
                }
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>
                  {disabled
                    ? `Select ${column.key === "stateName" ? "a zone" : "a state"} first`
                    : `Select ${column.label}`}
                </option>
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        return (
          <div key={column.key} className="space-y-1.5">
            <Label htmlFor={fieldId}>{column.label}</Label>
            <Input
              id={fieldId}
              value={formValues[column.key] ?? ""}
              placeholder={`Enter ${column.label.toLowerCase()}`}
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
          Mark as &quot;Other&quot; option
        </label>
      )}
    </>
  );
}
