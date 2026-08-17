import { notFound } from "next/navigation";
import { FORM_MANAGEMENT, resolveNavPath, type NavItem } from "@/lib/navigation";
import { PageHeader, type Crumb } from "@/components/layout/page-header";
import { NavCardGrid } from "@/components/layout/nav-card-grid";
import { EmptyDataTable, type MasterTab } from "@/components/data-table/empty-data-table";

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

  return (
    <div>
      <PageHeader
        backHref="/forms"
        trail={trailCrumbs}
        title={node.type === "group" ? node.label : undefined}
      />
      {node.type === "group" ? (
        <NavCardGrid items={node.children} basePath={`/forms/${slug.join("/")}`} />
      ) : (
        <EmptyDataTable
          title={node.label}
          columns={node.columns}
          subtitle={`Manage and view all ${node.label.toLowerCase()} in the system`}
          tabs={tabs}
        />
      )}
    </div>
  );
}
