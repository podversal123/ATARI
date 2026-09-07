"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { RoleManagementView } from "@/components/role-management/role-management-view";
import { useSession, useSessionReady } from "@/lib/session";

export default function RoleManagementPage() {
  const router = useRouter();
  const session = useSession();
  const sessionReady = useSessionReady();
  const isKvk = session.role !== "super-admin";

  /**
   * Hidden for KVK roles for now (client direction, 2026-09-07) - the
   * sidebar and Ctrl+K search drop it, and a direct URL bounces back to the
   * dashboard. Remove this guard (and the KVK_HIDDEN_SLUGS entry) when
   * KVK-level role administration is switched on.
   */
  useEffect(() => {
    if (sessionReady && isKvk) router.replace("/dashboard");
  }, [sessionReady, isKvk, router]);
  if (!sessionReady || isKvk) return null;

  return (
    <div>
      <PageHeader
        backHref="/dashboard"
        trail={[{ label: "Dashboard", href: "/dashboard" }, { label: "Role Management" }]}
        title="Role Management"
        icon={Settings}
        description={
          isKvk ? "Roles used within your KVK" : "Manage system roles and their permissions"
        }
      />
      <RoleManagementView />
    </div>
  );
}
