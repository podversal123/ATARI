import { notFound } from "next/navigation";
import { FORM_MANAGEMENT, resolveNavPath, landingCards, type NavItem, type NavGroup } from "@/lib/navigation";
import { PageHeader, type Crumb } from "@/components/layout/page-header";
import { SectionedMasterGrid } from "@/components/layout/sectioned-master-grid";
import { EmptyDataTable, type MasterTab } from "@/components/data-table/empty-data-table";

const EVENT_DEMOGRAPHIC_SLUGS = new Set(["technology-week-celebration", "world-soil-day"]);

type FormsPageProps = {
  params: Promise<{ slug: string[] }>;
};

export default async function FormsPage({ params }: FormsPageProps) {
  const { slug } = await params;
  const resolved = resolveNavPath(FORM_MANAGEMENT, slug);
  if (!resolved) notFound();

  const { node, trail } = resolved;

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
