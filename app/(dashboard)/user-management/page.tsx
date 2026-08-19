"use client";

import { PageHeader } from "@/components/layout/page-header";
import { UserManagementView } from "@/components/user-management/user-management-view";
import { useSession } from "@/lib/session";

export default function UserManagementPage() {
  const session = useSession();
  const isKvk = session.role !== "super-admin";

  return (
    <div>
      <PageHeader
        backHref="/dashboard"
        trail={[{ label: "Dashboard", href: "/dashboard" }, { label: "User Management" }]}
        title="User Management"
        description={
          isKvk
            ? `Create and manage users for ${session.kvkName ?? "your KVK"}`
            : "Manage system users and their access"
        }
      />
      <UserManagementView />
    </div>
  );
}
