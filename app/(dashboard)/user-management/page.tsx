import { PageHeader } from "@/components/layout/page-header";
import { EmptyDataTable } from "@/components/data-table/empty-data-table";

const COLUMNS = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "role", label: "Role" },
  { key: "created", label: "Created" },
  { key: "lastLogin", label: "Last Login" },
];

export default function UserManagementPage() {
  return (
    <div>
      <PageHeader
        trail={[{ label: "User Management" }]}
        title="User Management"
        description="Manage system users and their access."
      />
      <EmptyDataTable columns={COLUMNS} />
    </div>
  );
}
