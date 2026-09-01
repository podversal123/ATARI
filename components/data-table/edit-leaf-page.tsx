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
  formColumns?: 2;
};

/**
 * Form Management's "Edit" opens this dedicated full page instead of the
 * popup EmptyDataTable's own dialog uses (client direction, 2026-09-01 -
 * same reasoning as AddLeafPage's own "Add New" conversion). Reuses the
 * exact same MasterFormFields field list and /api/leaf-record/update
 * endpoint the dialog already submits to - only the container changes, not
 * the field set or save behavior. The row being edited is handed off via
 * sessionStorage (set by EmptyDataTable's own "Edit" click, which already
 * has the full row in memory from the list's own fetch) rather than a new
 * per-leaf server lookup, since every leaf's list page already loads its
 * own rows and a second generic single-record API doesn't exist yet.
 */
export function EditLeafPage({
  title,
  trail,
  backHref,
  columns,
  recordPath,
  id,
  formColumns,
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
      const response = await fetch("/api/leaf-record/update", {
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
      <PageHeader backHref={backHref} trail={trail} title={`Edit ${title}`} />

      <div className="animate-in fade-in-0 slide-in-from-bottom-2 rounded-lg border border-border bg-card p-6 duration-300">
        {formValues && (
          <div className={cn("grid grid-cols-1 gap-5", formColumns === 2 && "sm:grid-cols-2")}>
            <MasterFormFields
              columns={columns}
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
