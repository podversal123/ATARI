import { notFound } from "next/navigation";
import { Database } from "lucide-react";
import {
  ALL_MASTERS,
  resolveNavPath,
  landingCards,
  type NavItem,
  type NavGroup,
} from "@/lib/navigation";
import { PageHeader, type Crumb } from "@/components/layout/page-header";
import { AutoRefresh } from "@/components/layout/auto-refresh";
import { SectionedMasterGrid } from "@/components/layout/sectioned-master-grid";
import {
  EmptyDataTable,
  type MasterTab,
} from "@/components/data-table/empty-data-table";
import { AddLeafPage } from "@/components/data-table/add-leaf-page";
import { EditLeafPage } from "@/components/data-table/edit-leaf-page";
import { HostMasterAddForm } from "@/components/data-table/host-master-add-form";
import { KvkMasterAddForm } from "@/components/data-table/kvk-master-add-form";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { MASTER_LIST_REGISTRY } from "@/lib/masters-registry";

type MastersPageProps = {
  params: Promise<{ slug: string[] }>;
};

export default async function MastersPage({ params }: MastersPageProps) {
  const { slug: rawSlug } = await params;

  /**
   * "Add New" for All Masters now opens a dedicated page too (client
   * direction, 2026-08-24 - previously only Form Management did this, with
   * Masters/Targets/Notifications kept on the popup dialog). Rather than a
   * sibling route file (which Next.js can't nest under a catch-all segment
   * folder), a trailing "add" slug segment is handled right here - same
   * pattern as forms/[...slug]/page.tsx.
   */
  const isAddPage = rawSlug[rawSlug.length - 1] === "add";
  /**
   * "Edit" opens this same kind of dedicated page instead of the popup
   * EmptyDataTable's dialog otherwise uses (client direction, 2026-09-02 -
   * same reasoning and trailing-segment technique as "Add New" above, and
   * as Form Management's own identical Edit conversion, 2026-09-01). The
   * record id is the final segment, "edit" the one before it. Approved
   * first on Zone Master, then rolled out as the standard Edit for every
   * All Masters leaf (`editHrefBase` below), same rollout shape as
   * `compactFields`. Host Master and KVK Master go through this same
   * generic path too (they only have bespoke *Add* forms, not bespoke
   * Edit ones) - their own `columns` already omit the location-cascade
   * fields their Add form has, same gap the popup dialog already had, so
   * this is a container change only, not a field-set regression.
   */
  const isEditPage = rawSlug[rawSlug.length - 2] === "edit";
  const editId = isEditPage ? rawSlug[rawSlug.length - 1] : undefined;
  const slug = isAddPage ? rawSlug.slice(0, -1) : isEditPage ? rawSlug.slice(0, -2) : rawSlug;

  const resolved = resolveNavPath(ALL_MASTERS, slug);
  if (!resolved) notFound();

  const { node, trail } = resolved;

  const cascadeType =
    node.type === "leaf" && node.slug === "district-master"
      ? "district"
      : node.type === "leaf" && node.slug === "kvk-master"
        ? "kvk"
        : node.type === "leaf" && node.slug === "institute-master"
          ? "institute"
          : undefined;

  if (isEditPage) {
    if (node.type !== "leaf" || !editId) notFound();
    const editTrail: Crumb[] = [];
    const editBackHref = `/masters/${slug.join("/")}`;
    return (
      <EditLeafPage
        title={node.label.replace(/ Master$/, "")}
        trail={editTrail}
        backHref={editBackHref}
        columns={node.columns}
        cascadeType={cascadeType}
        formColumns={node.formColumns}
        compactFields={node.compactFields ?? true}
        recordPath={node.slug}
        recordKind="master"
        id={editId}
      />
    );
  }

  if (isAddPage) {
    if (node.type !== "leaf") notFound();
    /** No breadcrumb trail here (confirmed against the real "Create Zone"/"Create State"/"Create Host"/"Create KVK" reference screenshots, 2026-08-31) - every real Add/Create page under All Masters shows just "Back" + the title, not the multi-crumb chain the list pages use. */
    const addTrail: Crumb[] = [];
    const addBackHref = `/masters/${slug.join("/")}`;
    if (node.slug === "host-master") {
      return <HostMasterAddForm trail={addTrail} backHref={addBackHref} />;
    }
    if (node.slug === "kvk-master") {
      return <KvkMasterAddForm trail={addTrail} backHref={addBackHref} />;
    }
    return (
      <AddLeafPage
        // "Create X" never carries the trailing " Master" the leaf's own
        // list-page title/breadcrumb does (confirmed against 15+ real
        // "Create ..." reference screenshots, 2026-08-31 - Zone/State/
        // District/Institute/Sector/Category/Crop/Publication Items/
        // Product Category/... all drop it, while every list page keeps
        // it, e.g. "Publication Items Master").
        title={node.label.replace(/ Master$/, "")}
        trail={addTrail}
        backHref={addBackHref}
        columns={node.columns}
        cascadeType={cascadeType}
        showMarkAsOther={node.showMarkAsOther}
        formColumns={node.formColumns}
        // Compact auto-fit field layout (client direction, 2026-09-02,
        // approved first on Zone Master) is now the standard Add/Create
        // layout for every All Masters leaf that goes through this generic
        // page - defaults on rather than needing every one of this file's
        // ~50 leaf() entries individually flagged. `node.compactFields`
        // stays available as a per-leaf opt-out (`false`) if a future
        // master's field shape doesn't suit it. Form Management's own Add
        // page (app/(dashboard)/forms/[...slug]/page.tsx) is a separate
        // route/component and never sets this, so it's unaffected.
        compactFields={node.compactFields ?? true}
        titlePrefix="Create"
        recordPath={node.slug}
        recordKind="master"
      />
    );
  }

  /**
   * Only the top-level section (e.g. "Other Masters", "OFT & FLD Masters")
   * gets its own crumb, not every intermediate sub-group in between - real
   * reference (2026-08-31, "NICRA Seed/Fodder Bank Master") shows "All
   * Masters > Other Masters > NICRA Seed/Fodder Bank Master", skipping the
   * "NICRA Masters" sub-group crumb entirely, since that same context is
   * already shown by the tab row right below.
   */
  const trailCrumbs: Crumb[] = [{ label: "All Masters", href: "/masters" }];
  if (trail.length > 1) {
    trailCrumbs.push({ label: trail[0].label, href: `/masters/${trail[0].slug}` });
  }
  trailCrumbs.push({ label: node.label });

  let tabs: MasterTab[] | undefined;
  if (node.type === "leaf" && trail.length >= 2) {
    const parent = trail[trail.length - 2] as NavItem;
    if (parent.type === "group") {
      const basePath = `/masters/${slug.slice(0, -1).join("/")}`;
      tabs = parent.children
        .filter(
          (item): item is Extract<NavItem, { type: "leaf" }> =>
            item.type === "leaf",
        )
        .map((item) => ({
          label: item.label,
          href: `${basePath}/${item.slug}`,
          active: item.slug === node.slug,
        }));
    }
  }

  let masterData: { rows: Record<string, string>[]; totalCount: number } | undefined;

  if (node.type === "leaf" && node.slug === "kvk-master") {
    /** KVK Master keeps its own direct query (first module wired end-to-end, richer join than the generic registry needs). */
    const user = await getCurrentUser();
    if (user) {
      const kvks = await prisma.kvk.findMany({
        where: { zoneId: user.zoneId },
        include: { state: true, district: true, hostOrg: true, zone: true },
        orderBy: { name: "asc" },
      });
      const rows = kvks.map((kvk) => ({
        id: kvk.id,
        zoneName: kvk.zone.name,
        stateName: kvk.state.name,
        hostOrg: kvk.hostOrg.name,
        districtName: kvk.district.name,
        kvk: kvk.name,
        mobile: kvk.officePhone ?? "-",
        fax: kvk.fax ?? "-",
        email: kvk.email ?? "",
        address: kvk.address ?? "",
        sanctionYear: kvk.sanctionYear ? String(kvk.sanctionYear) : "",
      }));
      masterData = { rows, totalCount: rows.length };
    }
  } else if (node.type === "leaf" && MASTER_LIST_REGISTRY[node.slug]) {
    const user = await getCurrentUser();
    if (user) {
      const rows = await MASTER_LIST_REGISTRY[node.slug](user.zoneId);
      masterData = { rows, totalCount: rows.length };
    }
  }

  /**
   * Every "All Masters" group's landing page - confirmed via live the reference
   * of Basic Masters, OFT & FLD Masters, Production & Projects, and Other
   * Masters - renders as a
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

  /** Back must return to the immediate parent page (the crumb to the left), not the All Masters root - same fix as Form Management's catch-all route (client pointer, 2026-08-24). */
  const listBackHref =
    trailCrumbs[trailCrumbs.length - 2]?.href ?? "/masters";

  return (
    <div>
      <AutoRefresh />
      <PageHeader
        backHref={listBackHref}
        trail={trailCrumbs}
        title={node.type === "group" ? "All Masters" : undefined}
        icon={node.type === "group" ? Database : undefined}
        description={
          node.type === "group"
            ? "Manage all master data including zones, states, organizations, OFT, FLD, training, extension, production, and publications."
            : undefined
        }
      />
      {node.type === "group" && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-primary">{node.pageTitle ?? node.label}</h2>
          {node.description && (
            <p className="mt-1 text-sm text-muted-foreground">{node.description}</p>
          )}
        </div>
      )}
      {sectionedGroups ? (
        <SectionedMasterGrid
          groups={sectionedGroups}
          basePath={sectionedBasePath}
        />
      ) : node.type === "leaf" ? (
        <EmptyDataTable
          title={node.label}
          icon="masters"
          columns={node.columns}
          subtitle={`Manage and view all ${node.label.toLowerCase()} in the system`}
          tabs={tabs}
          rows={masterData?.rows}
          totalCount={masterData?.totalCount}
          cascadeType={cascadeType}
          showMarkAsOther={node.showMarkAsOther}
          addNewHref={`/masters/${slug.join("/")}/add`}
          // Full-page Edit (client direction, 2026-09-02, approved first
          // on Zone Master) - now the standard Edit for every All Masters
          // leaf, same rollout shape as `compactFields`.
          editHrefBase={`/masters/${slug.join("/")}`}
          recordPath={node.slug}
          recordKind="master"
        />
      ) : null}
    </div>
  );
}
