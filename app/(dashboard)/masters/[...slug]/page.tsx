import { notFound } from "next/navigation";
import { ALL_MASTERS, resolveNavPath, landingCards, type NavItem, type NavGroup } from "@/lib/navigation";
import { PageHeader, type Crumb } from "@/components/layout/page-header";
import { SectionedMasterGrid } from "@/components/layout/sectioned-master-grid";
import { EmptyDataTable, type MasterTab } from "@/components/data-table/empty-data-table";
import {
  ZONE_MASTER_ROWS,
  STATE_MASTER_ROWS,
  DISTRICT_MASTER_ROWS,
  DISTRICT_MASTER_TOTAL,
  HOST_MASTER_ROWS,
  HOST_MASTER_TOTAL,
  KVK_MASTER_ROWS,
  KVK_MASTER_TOTAL,
  INSTITUTE_MASTER_ROWS,
  INSTITUTE_MASTER_TOTAL,
  OFT_THEMATIC_AREA_ROWS,
  OFT_THEMATIC_AREA_TOTAL,
  FLD_SUB_CATEGORY_ROWS,
  FLD_SUB_CATEGORY_TOTAL,
  CROP_MASTER_ROWS,
  CROP_MASTER_TOTAL,
  FUNDING_SOURCE_ROWS,
  FUNDING_SOURCE_TOTAL,
  EXTENSION_ACTIVITY_ROWS,
  EXTENSION_ACTIVITY_TOTAL,
  CROPPING_SYSTEM_ROWS,
  CROPPING_SYSTEM_TOTAL,
  FARMING_SYSTEM_ROWS,
  FARMING_SYSTEM_TOTAL,
  PUBLICATION_ITEM_ROWS,
  PUBLICATION_ITEM_TOTAL,
} from "@/lib/masters";

type MastersPageProps = {
  params: Promise<{ slug: string[] }>;
};

/** Real reference rows for Masters leaves that have confirmed data, keyed by their nav slug. */
const MASTERS_DATA: Record<string, { rows: Record<string, string>[]; totalCount: number }> = {
  "zone-master": { rows: ZONE_MASTER_ROWS, totalCount: ZONE_MASTER_ROWS.length },
  "state-master": { rows: STATE_MASTER_ROWS, totalCount: STATE_MASTER_ROWS.length },
  "district-master": { rows: DISTRICT_MASTER_ROWS, totalCount: DISTRICT_MASTER_TOTAL },
  "host-master": { rows: HOST_MASTER_ROWS, totalCount: HOST_MASTER_TOTAL },
  "kvk-master": { rows: KVK_MASTER_ROWS, totalCount: KVK_MASTER_TOTAL },
  "institute-master": { rows: INSTITUTE_MASTER_ROWS, totalCount: INSTITUTE_MASTER_TOTAL },
  "oft-thematic-area": { rows: OFT_THEMATIC_AREA_ROWS, totalCount: OFT_THEMATIC_AREA_TOTAL },
  "sub-category": { rows: FLD_SUB_CATEGORY_ROWS, totalCount: FLD_SUB_CATEGORY_TOTAL },
  crop: { rows: CROP_MASTER_ROWS, totalCount: CROP_MASTER_TOTAL },
  "funding-source": { rows: FUNDING_SOURCE_ROWS, totalCount: FUNDING_SOURCE_TOTAL },
  "extension-activity": { rows: EXTENSION_ACTIVITY_ROWS, totalCount: EXTENSION_ACTIVITY_TOTAL },
  "cropping-system": { rows: CROPPING_SYSTEM_ROWS, totalCount: CROPPING_SYSTEM_TOTAL },
  "farming-system": { rows: FARMING_SYSTEM_ROWS, totalCount: FARMING_SYSTEM_TOTAL },
  "publication-items": { rows: PUBLICATION_ITEM_ROWS, totalCount: PUBLICATION_ITEM_TOTAL },
};

export default async function MastersPage({ params }: MastersPageProps) {
  const { slug } = await params;
  const resolved = resolveNavPath(ALL_MASTERS, slug);
  if (!resolved) notFound();

  const { node, trail } = resolved;

  const trailCrumbs: Crumb[] = [{ label: "All Masters", href: "/masters" }];
  trail.slice(0, -1).forEach((item, index) => {
    trailCrumbs.push({
      label: item.label,
      href: `/masters/${trail
        .slice(0, index + 1)
        .map((t) => t.slug)
        .join("/")}`,
    });
  });
  trailCrumbs.push({ label: node.label });

  let tabs: MasterTab[] | undefined;
  if (node.type === "leaf" && trail.length >= 2) {
    const parent = trail[trail.length - 2] as NavItem;
    if (parent.type === "group") {
      const basePath = `/masters/${slug.slice(0, -1).join("/")}`;
      tabs = parent.children
        .filter((item): item is Extract<NavItem, { type: "leaf" }> => item.type === "leaf")
        .map((item) => ({
          label: item.label,
          href: `${basePath}/${item.slug}`,
          active: item.slug === node.slug,
        }));
    }
  }

  const masterData = node.type === "leaf" ? MASTERS_DATA[node.slug] : undefined;

  /**
   * Every "All Masters" group's landing page — confirmed via live screenshots
   * of Basic Masters, OFT & FLD Masters, Production & Projects, and Other
   * Masters (atari-photo-zip/IMG-20260815-WA0063.jpg, IMG-20260817-WA0278.jpg,
   * IMG-20260817-WA0233.jpg, and the two Other Masters PNGs) — renders as a
   * single page of cards, each listing its own masters inline and clickable.
   * When a group's children are themselves groups (e.g. OFT/FLD/CFLD), each
   * child becomes its own card; when the children are already leaves (e.g.
   * Basic Masters' 6 masters), the group wraps itself as the single card.
   */
  let sectionedGroups: NavGroup[] | null = null;
  let sectionedBasePath = `/masters/${slug.join("/")}`;
  if (node.type === "group") {
    sectionedGroups = landingCards(node);
    if (sectionedGroups.length === 1 && sectionedGroups[0].slug === node.slug) {
      // Group wraps itself as the single card, so links must skip past its own slug (already the last segment of the current path).
      sectionedBasePath = `/masters/${slug.slice(0, -1).join("/")}`;
    }
  }

  return (
    <div>
      <PageHeader
        backHref="/masters"
        trail={trailCrumbs}
        title={node.type === "group" ? (node.pageTitle ?? node.label) : undefined}
        description={node.type === "group" ? node.description : undefined}
      />
      {sectionedGroups ? (
        <SectionedMasterGrid groups={sectionedGroups} basePath={sectionedBasePath} />
      ) : node.type === "leaf" ? (
        <EmptyDataTable
          title={node.label}
          columns={node.columns}
          subtitle={`Manage and view all ${node.label.toLowerCase()} in the system`}
          tabs={tabs}
          rows={masterData?.rows}
          totalCount={masterData?.totalCount}
        />
      ) : null}
    </div>
  );
}
