"use client";

import { PageHeader } from "@/components/layout/page-header";
import { RoleManagementView } from "@/components/role-management/role-management-view";
import { useSession } from "@/lib/session";

export default function RoleManagementPage() {
  const session = useSession();
  const isKvk = session.role !== "super-admin";

  return (
    <div>
      <PageHeader
        backHref="/dashboard"
        trail={[{ label: "Dashboard", href: "/dashboard" }, { label: "Role Management" }]}
        title="Role Management"
        description={
          isKvk ? "Roles used within your KVK" : "Manage system roles and their permissions"
        }
      />
      <RoleManagementView />
    </div>
  );
}
