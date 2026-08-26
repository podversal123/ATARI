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
import { SectionedMasterGrid } from "@/components/layout/sectioned-master-grid";
import {
  EmptyDataTable,
  type MasterTab,
} from "@/components/data-table/empty-data-table";
import { AddLeafPage } from "@/components/data-table/add-leaf-page";
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
  const slug = isAddPage ? rawSlug.slice(0, -1) : rawSlug;

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

  if (isAddPage) {
    if (node.type !== "leaf") notFound();
    const addTrail: Crumb[] = [{ label: "All Masters", href: "/masters" }];
    trail.forEach((item, index) => {
      addTrail.push({
        label: item.label,
        href: `/masters/${trail
          .slice(0, index + 1)
          .map((t) => t.slug)
          .join("/")}`,
      });
    });
    const addBackHref = `/masters/${slug.join("/")}`;
    if (node.slug === "host-master") {
      return <HostMasterAddForm trail={addTrail} backHref={addBackHref} />;
    }
    if (node.slug === "kvk-master") {
      return <KvkMasterAddForm trail={addTrail} backHref={addBackHref} />;
    }
    return (
      <AddLeafPage
        title={node.label}
        trail={addTrail}
        backHref={addBackHref}
        columns={node.columns}
        cascadeType={cascadeType}
        showMarkAsOther={node.showMarkAsOther}
        titlePrefix="Create"
        recordPath={node.slug}
        recordKind="master"
      />
    );
  }

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
      <PageHeader
        backHref={listBackHref}
        trail={trailCrumbs}
        title={
          node.type === "group" ? (node.pageTitle ?? node.label) : undefined
        }
        icon={node.type === "group" ? Database : undefined}
        description={node.type === "group" ? node.description : undefined}
      />
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
          recordPath={node.slug}
          recordKind="master"
        />
      ) : null}
    </div>
  );
}
