"use client";

import { Image as ImageIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { useSession } from "@/lib/session";
import { SuperAdminModuleImagesView } from "@/components/module-images/super-admin-module-images-view";
import { KvkModuleImagesView } from "@/components/module-images/kvk-module-images-view";

/**
 * Per "Module Images UI.pdf": Super Admin gets a cross-KVK, filter-and-download-only
 * screen ("Category Wise Photographs"); a KVK gets its own upload/list screen. Which
 * one renders is decided by the session role, same split as Reports and Log History.
 */
export default function ModuleImagesPage() {
  const session = useSession();
  const isKvk = session.role !== "super-admin";

  return (
    <div>
      <PageHeader
        trail={[{ label: "Module Images" }]}
        title={isKvk ? "Module Images" : "Module Images — Category Wise Photographs"}
        icon={ImageIcon}
        description={
          isKvk
            ? `Upload and manage photographs for ${session.kvkName ?? "your KVK"}, organised by Form Management category.`
            : "Find and download KVK-submitted photographs by reporting year, KVK, and Form Management category."
        }
      />
      {isKvk ? <KvkModuleImagesView /> : <SuperAdminModuleImagesView />}
    </div>
  );
}
