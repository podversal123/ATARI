"use client";

import { Image as ImageIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { useSession } from "@/lib/session";
import { SuperAdminModuleImagesView } from "@/components/module-images/super-admin-module-images-view";
import { KvkModuleImagesView } from "@/components/module-images/kvk-module-images-view";

/**
 * Per the client's "Module Image workflow" PDF (2026-09-02): there is no
 * separate upload here anymore for either role - photographs come from the
 * Photographs section at the end of a form (OFT/FLD/Training/Extension
 * Activities to start) and land here automatically. Super Admin gets a
 * cross-KVK, filter-and-download screen ("Category Wise Photographs"); a KVK
 * gets the same browse/filter/download screen scoped to its own uploads.
 * Which one renders is decided by the session role, same split as Reports
 * and Log History.
 */
export default function ModuleImagesPage() {
  const session = useSession();
  const isKvk = session.role !== "super-admin";

  return (
    <div>
      <PageHeader
        trail={[{ label: "Module Images" }]}
        title={
          isKvk ? "Module Images" : "Module Images - Category Wise Photographs"
        }
        icon={ImageIcon}
        description={
          isKvk
            ? `Photographs for ${session.kvkName ?? "your KVK"}, organised by Form Management category - add photos from the Photographs section at the end of a form.`
            : "Find and download KVK-submitted photographs by reporting year, KVK, and Form Management category."
        }
      />
      {isKvk ? <KvkModuleImagesView /> : <SuperAdminModuleImagesView />}
    </div>
  );
}
