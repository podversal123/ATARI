import { Database } from "lucide-react";
import { ALL_MASTERS } from "@/lib/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { NavCardGrid } from "@/components/layout/nav-card-grid";

export default function AllMastersPage() {
  return (
    <div>
      <PageHeader
        trail={[{ label: "All Masters" }]}
        title="All Masters"
        icon={Database}
        description="Manage all master data including zones, states, organizations, OFT, FLD, training, extension, production, and publications."
      />
      <NavCardGrid items={ALL_MASTERS} basePath="/masters" />
    </div>
  );
}
