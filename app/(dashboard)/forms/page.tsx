import { FORM_MANAGEMENT } from "@/lib/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { NavCardGrid } from "@/components/layout/nav-card-grid";

export default function FormManagementPage() {
  return (
    <div>
      <PageHeader
        trail={[{ label: "Form Management" }]}
        title="Form Management"
        description="Manage KVK forms, achievements, performance indicators, and miscellaneous data"
      />
      <NavCardGrid items={FORM_MANAGEMENT} basePath="/forms" />
    </div>
  );
}
