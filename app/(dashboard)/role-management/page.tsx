import { PageHeader } from "@/components/layout/page-header";
import { EmptyDataTable } from "@/components/data-table/empty-data-table";

const COLUMNS = [
  { key: "roleName", label: "Role Name" },
  { key: "description", label: "Description" },
  { key: "usersAssigned", label: "Users Assigned" },
];

export default function RoleManagementPage() {
  return (
    <div>
      <PageHeader
        trail={[{ label: "Role Management" }]}
        title="Role Management"
        description="Define roles and the permissions each one grants."
      />
      <EmptyDataTable columns={COLUMNS} />
    </div>
  );
}
