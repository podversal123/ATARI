import { PageHeader } from "@/components/layout/page-header";
import { EmptyDataTable } from "@/components/data-table/empty-data-table";

const COLUMNS = [
  { key: "user", label: "User" },
  { key: "action", label: "Action" },
  { key: "module", label: "Module" },
  { key: "timestamp", label: "Timestamp" },
];

export default function LogHistoryPage() {
  return (
    <div>
      <PageHeader
        trail={[{ label: "Log History" }]}
        title="Log History"
        description="Audit trail of who changed what, and when."
      />
      <EmptyDataTable columns={COLUMNS} />
    </div>
  );
}
