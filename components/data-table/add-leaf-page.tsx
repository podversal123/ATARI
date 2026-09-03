"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, type Crumb } from "@/components/layout/page-header";
import { MasterFormFields } from "./master-form-fields";
import type { MasterColumn } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type AddLeafPageProps = {
  title: string;
  trail: Crumb[];
  backHref: string;
  columns: MasterColumn[];
  cascadeType?: "district" | "kvk" | "institute";
  /** Overrides the "Mark as Other" checkbox's visibility when confirmed against the real reference (lib/navigation.ts's NavLeaf.showMarkAsOther) - falls back to the single-"name"-column heuristic below when unset. */
  showMarkAsOther?: boolean;
  /** "Create" for All Masters ("Create Zone", "Create Host", ...), "Add" for Form Management ("Add Staff", "Add OFT", ...) - both confirmed real, per-module titles (client screenshots, 2026-08-24). */
  titlePrefix?: "Add" | "Create";
  /** Registry key in lib/leaf-record-registry.ts (Form Management) or lib/masters-registry.ts (All Masters), depending on `recordKind`. Omit for leaves not wired to the database yet - submit then falls back to the old navigate-back-only behavior. */
  recordPath?: string;
  /** Which registry/endpoint `recordPath` refers to - "form" (default, KVK-scoped Form Management leaves) or "master" (zone-scoped, Super Admin only, All Masters leaves). */
  recordKind?: "form" | "master";
  /** Packs fields two-per-row instead of the default one-per-row - see lib/navigation.ts's NavLeaf.formColumns for when this is real vs guessed. */
  formColumns?: 2;
};

/**
 * "Add New" for both All Masters and Form Management opens this same
 * dedicated full page instead of a popup (client direction). Same field set
 * and "Mark as Other" behaviour as the dialog version (shared via
 * MasterFormFields). The button reads "Submit", matching every real
 * Add/Create screen in the client's own reference - not "Save". No backend
 * yet, so submitting just returns to the list like every other Phase 1 form.
 */
export function AddLeafPage({
  title,
  trail,
  backHref,
  columns,
  cascadeType,
  showMarkAsOther,
  titlePrefix = "Add",
  recordPath,
  recordKind = "form",
  formColumns,
}: AddLeafPageProps) {
  const router = useRouter();
  // Pre-fill any column with a confirmed real default (e.g. Vehicle/Equipment Present Status's Hide in Next Year -> "No") instead of starting every field blank.
  const [formValues, setFormValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(columns.filter((c) => c.defaultValue !== undefined).map((c) => [c.key, c.defaultValue!])),
  );
  const [markAsOther, setMarkAsOther] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isSimpleMaster =
    showMarkAsOther ?? (columns.length === 1 && columns[0].key === "name");

  async function submit() {
    setError(null);
    const missing = columns.filter(
      (column) => column.required && !column.readonly && !formValues[column.key]?.trim(),
    );
    if (missing.length > 0) {
      setError("Please fill all required fields.");
      return;
    }
    if (!recordPath) {
      router.push(backHref);
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(recordKind === "master" ? "/api/master-record" : "/api/leaf-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: recordPath, values: formValues }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      router.push(backHref);
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        backHref={backHref}
        trail={trail}
        title={`${titlePrefix} ${title}`}
      />

      {/* Fade/slide-in on mount (client report, 2026-08-31: "add new karne pe animation hai") - same animate-in vocabulary the app's own dialogs/dropdowns already use (see components/ui/dialog.tsx), so this Add page's own entrance matches the rest of the app's motion language instead of introducing a new one. */}
      <div className="animate-in fade-in-0 slide-in-from-bottom-2 rounded-lg border border-border bg-card p-6 duration-300">
        {/* One field per row by default (client report, 2026-08-31) - the real reference never packs these simple masters' fields side by side, confirmed against Zone (1 field)/State (2)/District (3)/Institute (4) Master's own Create screenshots, each stacked in a single column regardless of field count. `formColumns` opts a specific leaf into two-per-row when its own reference confirmed that instead (e.g. Vehicle/Equipment Present Status). */}
        <div className={cn("grid grid-cols-1 gap-5", formColumns === 2 && "sm:grid-cols-2")}>
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

        {error && (
          <p role="alert" className="mt-4 text-sm font-medium text-destructive">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={() => router.push(backHref)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting}>
            <Save className="size-3.5" />
            {submitting ? "Saving…" : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
}
