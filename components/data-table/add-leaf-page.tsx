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
  /** "Create" for All Masters ("Create Zone", "Create Host", ...), "Add" for Form Management ("Add Staff", "Add OFT", ...) - both confirmed real, per-module titles (client screenshots, 2026-08-24). */
  titlePrefix?: "Add" | "Create";
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
  titlePrefix = "Add",
}: AddLeafPageProps) {
  const router = useRouter();
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [markAsOther, setMarkAsOther] = useState(false);
  const isSimpleMaster = columns.length === 1 && columns[0].key === "name";

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

        <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={() => router.push(backHref)}>
            Cancel
          </Button>
          <Button onClick={() => router.push(backHref)}>
            <Save className="size-3.5" />
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
