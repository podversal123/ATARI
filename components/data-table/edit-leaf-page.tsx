"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, type Crumb } from "@/components/layout/page-header";
import { MasterFormFields, DEMOGRAPHIC_KEYS, prefixedDemographicKey } from "./master-form-fields";
import type { MasterColumn } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type EditLeafPageProps = {
  title: string;
  trail: Crumb[];
  backHref: string;
  columns: MasterColumn[];
  recordPath: string;
  id: string;
  cascadeType?: "district" | "kvk" | "institute";
  formColumns?: 2;
  /** See lib/navigation.ts's NavLeaf.compactFields - same auto-fit field grid as AddLeafPage, so a leaf's Add and Edit forms always look identical. */
  compactFields?: boolean;
  /** Which registry/endpoint `recordPath` refers to - "form" (default, Form Management, POSTs to /api/leaf-record/update) or "master" (All Masters, POSTs to /api/master-record/update). Mirrors AddLeafPage's own `recordKind`. */
  recordKind?: "form" | "master";
};

/**
 * "Edit" opens this dedicated full page instead of the popup EmptyDataTable's
 * own dialog uses - originally Form Management only (client direction,
 * 2026-09-01, same reasoning as AddLeafPage's own "Add New" conversion), now
 * also All Masters (client direction, 2026-09-02, approved first on Zone
 * Master - see `recordKind`). Reuses the exact same MasterFormFields field
 * list and update endpoint the dialog already submits to - only the
 * container changes, not the field set or save behavior. The row being
 * edited is handed off via sessionStorage (set by EmptyDataTable's own
 * "Edit" click, which already has the full row in memory from the list's
 * own fetch) rather than a new per-leaf server lookup, since every leaf's
 * list page already loads its own rows and a second generic single-record
 * API doesn't exist yet.
 */
export function EditLeafPage({
  title,
  trail,
  backHref,
  columns,
  recordPath,
  id,
  cascadeType,
  formColumns,
  compactFields,
  recordKind = "form",
}: EditLeafPageProps) {
  const router = useRouter();
  const [formValues, setFormValues] = useState<Record<string, string> | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [markAsOther, setMarkAsOther] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isSimpleMaster = columns.length === 1 && columns[0].key === "name";

  useEffect(() => {
    const raw = sessionStorage.getItem(`edit-record:${id}`);
    if (!raw) {
      setLoadError(true);
      return;
    }
    try {
      const row = JSON.parse(raw) as Record<string, string>;
      const values: Record<string, string> = {};
      for (const column of columns) {
        if (column.fieldKind === "demographic-breakdown") {
          const prefix = column.demographicPrefix ?? "";
          for (const suffix of DEMOGRAPHIC_KEYS) {
            const key = prefixedDemographicKey(prefix, suffix);
            values[key] = row[key] != null ? String(row[key]) : "";
          }
          continue;
        }
        values[column.key] = row[column.key] != null ? String(row[column.key]) : "";
      }
      setFormValues(values);
    } catch {
      setLoadError(true);
    }
  }, [id, columns]);

  async function submit() {
    if (!formValues) return;
    setError(null);
    const missing = columns.filter(
      (column) => column.required && !column.readonly && !formValues[column.key]?.trim(),
    );
    if (missing.length > 0) {
      setError("Please fill all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(recordKind === "master" ? "/api/master-record/update" : "/api/leaf-record/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: recordPath, id, values: formValues }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      sessionStorage.removeItem(`edit-record:${id}`);
      router.push(backHref);
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <div>
        <PageHeader backHref={backHref} trail={trail} title={`Edit ${title}`} />
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-sm font-semibold text-foreground">This record could not be loaded.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Please open Edit again from the list page.
          </p>
          <Button className="mt-4" onClick={() => router.push(backHref)}>
            Back to list
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Heading slides in from the left as the card (below) slides in from the right (client direction, 2026-09-03) - the two converge toward the middle instead of both entering the same way. */}
      <div className="animate-in fade-in-0 slide-in-from-left-8 ease-out duration-300">
        <PageHeader backHref={backHref} trail={trail} title={`Edit ${title}`} />
      </div>

      {/* Slide-in-from-the-right entrance (client direction, 2026-09-02) - same motion as AddLeafPage's own entrance, so Add and Edit feel identical to step into. */}
      <div className="animate-in fade-in-0 slide-in-from-right-8 ease-out rounded-lg border border-border bg-card p-6 duration-300">
        {formValues && (
          <div
            className={cn(
              "grid gap-5",
              compactFields
                ? "grid-cols-[repeat(auto-fit,minmax(240px,320px))]"
                : cn("grid-cols-1", formColumns === 2 && "sm:grid-cols-2"),
            )}
          >
            <MasterFormFields
              columns={columns}
              cascadeType={cascadeType}
              formValues={formValues}
              onChange={setFormValues}
              isSimpleMaster={isSimpleMaster}
              markAsOther={markAsOther}
              onMarkAsOtherChange={setMarkAsOther}
            />
          </div>
        )}

        {error && (
          <p role="alert" className="mt-4 text-sm font-medium text-destructive">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={() => router.push(backHref)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting || !formValues}>
            <Save className="size-3.5" />
            {submitting ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
