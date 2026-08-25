"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, type Crumb } from "@/components/layout/page-header";
import { MasterFormFields } from "./master-form-fields";
import type { MasterColumn } from "@/lib/navigation";

type AddLeafPageProps = {
  title: string;
  trail: Crumb[];
  backHref: string;
  columns: MasterColumn[];
  cascadeType?: "district" | "kvk";
  /** Overrides the "Mark as Other" checkbox's visibility when confirmed against the real reference (lib/navigation.ts's NavLeaf.showMarkAsOther) - falls back to the single-"name"-column heuristic below when unset. */
  showMarkAsOther?: boolean;
  /** "Create" for All Masters ("Create Zone", "Create Host", ...), "Add" for Form Management ("Add Staff", "Add OFT", ...) - both confirmed real, per-module titles (client screenshots, 2026-08-24). */
  titlePrefix?: "Add" | "Create";
  /** Registry key in lib/leaf-record-registry.ts (Form Management) or lib/masters-registry.ts (All Masters), depending on `recordKind`. Omit for leaves not wired to the database yet - submit then falls back to the old navigate-back-only behavior. */
  recordPath?: string;
  /** Which registry/endpoint `recordPath` refers to - "form" (default, KVK-scoped Form Management leaves) or "master" (zone-scoped, Super Admin only, All Masters leaves). */
  recordKind?: "form" | "master";
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
}: AddLeafPageProps) {
  const router = useRouter();
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [markAsOther, setMarkAsOther] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isSimpleMaster =
    showMarkAsOther ?? (columns.length === 1 && columns[0].key === "name");

  async function submit() {
    if (!recordPath) {
      router.push(backHref);
      return;
    }
    setError(null);
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

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
