import { PageHeader } from "@/components/layout/page-header";
import { EmptyDataTable } from "@/components/data-table/empty-data-table";

const COLUMNS = [
  { key: "reportName", label: "Report Name" },
  { key: "zone", label: "Zone" },
  { key: "generatedOn", label: "Generated On" },
];

export default function ReportsPage() {
  return (
    <div>
      <PageHeader trail={[{ label: "Reports" }]} title="Reports" />
      <EmptyDataTable columns={COLUMNS} />
    </div>
  );
}
