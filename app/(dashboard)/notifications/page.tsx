import { PageHeader } from "@/components/layout/page-header";
import { EmptyDataTable } from "@/components/data-table/empty-data-table";

const COLUMNS = [
  { key: "title", label: "Title" },
  { key: "kvk", label: "KVK" },
  { key: "sentOn", label: "Sent On" },
  { key: "status", label: "Status" },
];

export default function NotificationsPage() {
  return (
    <div>
      <PageHeader trail={[{ label: "Notifications" }]} />
      <EmptyDataTable title="Notifications" columns={COLUMNS} />
    </div>
  );
}
