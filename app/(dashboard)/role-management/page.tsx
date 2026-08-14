import { PageHeader } from "@/components/layout/page-header";
import { RoleManagementView } from "@/components/role-management/role-management-view";

export default function RoleManagementPage() {
  return (
    <div>
      <PageHeader
        backHref="/dashboard"
        trail={[{ label: "Dashboard", href: "/dashboard" }, { label: "Role Management" }]}
        title="Role Management"
        description="Manage system roles and their permissions"
      />
      <RoleManagementView />
    </div>
  );
}
