import { PageHeader } from "@/components/layout/page-header";
import { EmptyDataTable } from "@/components/data-table/empty-data-table";

/** No reference screenshot exists anywhere in the client's materials for this page — kept generic rather than guessed. */
const COLUMNS = [{ key: "name", label: "Name" }];

export default function GalleryPage() {
  return (
    <div>
      <PageHeader trail={[{ label: "Gallery" }]} />
      <EmptyDataTable title="Gallery" columns={COLUMNS} />
    </div>
  );
}
