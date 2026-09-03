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
  /** See lib/navigation.ts's NavLeaf.compactFields. */
  compactFields?: boolean;
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
  compactFields,
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
      {/* Heading slides in from the left as the card (below) slides in from the right (client direction, 2026-09-03) - the two converge toward the middle instead of both entering the same way. */}
      <div className="animate-in fade-in-0 slide-in-from-left-8 ease-out duration-300">
        <PageHeader
          backHref={backHref}
          trail={trail}
          title={`${titlePrefix} ${title}`}
        />
      </div>

      {/* Slide-in-from-the-right entrance (client direction, 2026-09-02 - the original bottom-slide-in-2, 2026-08-31, read as too small/subtle) - reads as "stepping into" this Add page, not just a settling card. Same animate-in vocabulary as everywhere else in the app (components/ui/dialog.tsx), just a bigger, more deliberate distance/duration than the old one. */}
      <div className="animate-in fade-in-0 slide-in-from-right-8 ease-out rounded-lg border border-border bg-card p-6 duration-300">
        {/*
         * One field per row by default (client report, 2026-08-31) - the real
         * reference never packed these simple masters' fields side by side.
         * `formColumns` opts a specific leaf into two-per-row (e.g.
         * Vehicle/Equipment Present Status).
         *
         * `compactFields` (client direction, 2026-09-02) replaces the
         * full-width single column with a CSS grid `auto-fit` track: each
         * field gets a natural 240-320px width and the grid wraps as many
         * as fit per row on its own, so there's never a mismatched "3 then
         * 2" row - every field is the same width, so however many fit is
         * however many fit, consistently. Approved first on Zone Master,
         * now the default for every All Masters leaf (see
         * app/(dashboard)/masters/[...slug]/page.tsx).
         */}
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
