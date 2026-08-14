import { PageHeader } from "@/components/layout/page-header";
import { UserManagementView } from "@/components/user-management/user-management-view";

export default function UserManagementPage() {
  return (
    <div>
      <PageHeader
        backHref="/dashboard"
        trail={[{ label: "Dashboard", href: "/dashboard" }, { label: "User Management" }]}
        title="User Management"
        description="Manage system users and their access"
      />
      <UserManagementView />
    </div>
  );
}
