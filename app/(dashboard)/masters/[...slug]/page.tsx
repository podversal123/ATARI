import { notFound } from "next/navigation";
import { ALL_MASTERS, resolveNavPath } from "@/lib/navigation";
import { PageHeader, type Crumb } from "@/components/layout/page-header";
import { NavCardGrid } from "@/components/layout/nav-card-grid";
import { EmptyDataTable } from "@/components/data-table/empty-data-table";

type MastersPageProps = {
  params: Promise<{ slug: string[] }>;
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

  return (
    <div>
      <PageHeader backHref="/masters" trail={trailCrumbs} title={node.label} />
      {node.type === "group" ? (
        <NavCardGrid items={node.children} basePath={`/masters/${slug.join("/")}`} />
      ) : (
        <EmptyDataTable columns={node.columns} />
      )}
    </div>
  );
}
