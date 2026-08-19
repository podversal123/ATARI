import { PageHeader } from "@/components/layout/page-header";
import { EmptyDataTable } from "@/components/data-table/empty-data-table";

/** No reference screenshot exists anywhere in the client's materials for this page — kept generic rather than guessed. */
const COLUMNS = [{ key: "name", label: "Name" }];

export default function TargetsPage() {
  return (
    <div>
      <PageHeader trail={[{ label: "Targets" }]} />
      <EmptyDataTable title="Targets" columns={COLUMNS} />
    </div>
  );
}
