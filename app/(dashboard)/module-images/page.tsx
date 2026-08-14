import { PageHeader } from "@/components/layout/page-header";
import { EmptyDataTable } from "@/components/data-table/empty-data-table";

const COLUMNS = [
  { key: "module", label: "Module" },
  { key: "image", label: "Image" },
];

export default function ModuleImagesPage() {
  return (
    <div>
      <PageHeader trail={[{ label: "Module Images" }]} title="Module Images" />
      <EmptyDataTable columns={COLUMNS} />
    </div>
  );
}
