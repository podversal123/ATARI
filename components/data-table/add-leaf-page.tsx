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
};

/**
 * Form Management's "Add New" - per client direction, opens a dedicated
 * page instead of the popup EmptyDataTable/Masters keep. Same field set and
 * "Mark as Other" behaviour as the dialog version (shared via
 * MasterFormFields), just laid out full-page. No backend yet, so Save just
 * returns to the list like every other Phase 1 form.
 */
export function AddLeafPage({
  title,
  trail,
  backHref,
  columns,
}: AddLeafPageProps) {
  const router = useRouter();
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [markAsOther, setMarkAsOther] = useState(false);
  const isSimpleMaster = columns.length === 1 && columns[0].key === "name";

  return (
    <div>
      <PageHeader backHref={backHref} trail={trail} title={`Add ${title}`} />

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MasterFormFields
            columns={columns}
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
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
