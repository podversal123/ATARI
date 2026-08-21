import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { FORM_MANAGEMENT, resolveNavPath, landingCards, type NavItem, type NavGroup } from "@/lib/navigation";
import { PageHeader, type Crumb } from "@/components/layout/page-header";
import { SectionedMasterGrid } from "@/components/layout/sectioned-master-grid";
import { EmptyDataTable, type MasterTab } from "@/components/data-table/empty-data-table";
import { AddLeafPage } from "@/components/data-table/add-leaf-page";

const EVENT_DEMOGRAPHIC_SLUGS = new Set(["technology-week-celebration", "world-soil-day"]);
/** Leaves whose real Add/Edit shape isn't a flat field list — these keep opening their existing bespoke dialog instead of the new full-page Add flow. */
const CUSTOM_FORM_SLUGS = new Set(["technical-parameter", ...EVENT_DEMOGRAPHIC_SLUGS]);

type FormsPageProps = {
  params: Promise<{ slug: string[] }>;
};

export default async function FormsPage({ params }: FormsPageProps) {
  const { slug: rawSlug } = await params;

  /**
   * "Add New" for Form Management opens a dedicated page instead of the
   * popup Masters/Targets/Notifications keep (client direction). Rather
   * than a sibling route file (which Next.js can't nest under a catch-all
   * segment folder), a trailing "add" slug segment is handled right here.
   */
  const isAddPage = rawSlug[rawSlug.length - 1] === "add";
  const slug = isAddPage ? rawSlug.slice(0, -1) : rawSlug;

  const resolved = resolveNavPath(FORM_MANAGEMENT, slug);
  if (!resolved) notFound();

  const { node, trail } = resolved;

  if (isAddPage) {
    if (node.type !== "leaf" || CUSTOM_FORM_SLUGS.has(node.slug)) notFound();
    const addTrail: Crumb[] = [{ label: "Form Management", href: "/forms" }];
    trail.forEach((item, index) => {
      addTrail.push({
        label: item.label,
        href: `/forms/${trail
          .slice(0, index + 1)
          .map((t) => t.slug)
          .join("/")}`,
      });
    });
    return (
      <AddLeafPage
        title={node.label}
        trail={addTrail}
        backHref={`/forms/${slug.join("/")}`}
        columns={node.columns}
      />
    );
  }

  const trailCrumbs: Crumb[] = [{ label: "Form Management", href: "/forms" }];
  trail.slice(0, -1).forEach((item, index) => {
    trailCrumbs.push({
      label: item.label,
      href: `/forms/${trail
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
      const basePath = `/forms/${slug.slice(0, -1).join("/")}`;
      tabs = parent.children
        .filter((item): item is Extract<NavItem, { type: "leaf" }> => item.type === "leaf")
        .map((item) => ({
          label: item.label,
          href: `${basePath}/${item.slug}`,
          active: item.slug === node.slug,
        }));
    }
  }

  /** Same flat inline-list card pattern as All Masters — confirmed via atari-master-data screenshots for /forms/about-kvk and Projects. */
  let sectionedGroups: NavGroup[] | null = null;
  let sectionedBasePath = `/forms/${slug.join("/")}`;
  if (node.type === "group") {
    sectionedGroups = landingCards(node);
    if (sectionedGroups.length === 1 && sectionedGroups[0].slug === node.slug) {
      sectionedBasePath = `/forms/${slug.slice(0, -1).join("/")}`;
    }
  }

  return (
    <div>
      <PageHeader
        backHref="/forms"
        trail={trailCrumbs}
        title={node.type === "group" ? (node.pageTitle ?? node.label) : undefined}
        icon={node.type === "group" ? FileText : undefined}
        description={node.type === "group" ? node.description : undefined}
      />
      {sectionedGroups ? (
        <SectionedMasterGrid groups={sectionedGroups} basePath={sectionedBasePath} />
      ) : node.type === "leaf" ? (
        <EmptyDataTable
          title={node.label}
          icon="form-management"
          columns={node.columns}
          subtitle={`Manage and view all ${node.label.toLowerCase()} in the system`}
          tabs={tabs}
          addNewHref={CUSTOM_FORM_SLUGS.has(node.slug) ? undefined : `/forms/${slug.join("/")}/add`}
          customForm={
            node.slug === "technical-parameter"
              ? "cfld-technical-parameter"
              : EVENT_DEMOGRAPHIC_SLUGS.has(node.slug)
                ? "event-demographic"
                : undefined
          }
        />
      ) : null}
    </div>
  );
}
