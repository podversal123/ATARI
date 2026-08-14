import { PageHeader } from "@/components/layout/page-header";
import { EmptyDataTable } from "@/components/data-table/empty-data-table";

const COLUMNS = [
  { key: "indicator", label: "Indicator" },
  { key: "reportingYear", label: "Reporting Year" },
  { key: "target", label: "Target" },
  { key: "achievement", label: "Achievement" },
];

export default function TargetsPage() {
  return (
    <div>
      <PageHeader trail={[{ label: "Targets" }]} title="Targets" />
      <EmptyDataTable columns={COLUMNS} />
    </div>
  );
}
