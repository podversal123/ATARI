import { PageHeader } from "@/components/layout/page-header";
import { EmptyDataTable } from "@/components/data-table/empty-data-table";

const COLUMNS = [
  { key: "title", label: "Title" },
  { key: "kvk", label: "KVK" },
  { key: "uploadedOn", label: "Uploaded On" },
];

export default function GalleryPage() {
  return (
    <div>
      <PageHeader trail={[{ label: "Gallery" }]} />
      <EmptyDataTable title="Gallery" columns={COLUMNS} />
    </div>
  );
}
