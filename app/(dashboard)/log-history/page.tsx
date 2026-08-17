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
      <PageHeader trail={[{ label: "Log History" }]} />
      <EmptyDataTable title="Log History" columns={COLUMNS} />
    </div>
  );
}
