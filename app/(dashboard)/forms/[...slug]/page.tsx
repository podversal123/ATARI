import { notFound } from "next/navigation";
import { FORM_MANAGEMENT, resolveNavPath } from "@/lib/navigation";
import { PageHeader, type Crumb } from "@/components/layout/page-header";
import { NavCardGrid } from "@/components/layout/nav-card-grid";
import { EmptyDataTable } from "@/components/data-table/empty-data-table";

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

  return (
    <div>
      <PageHeader backHref="/forms" trail={trailCrumbs} title={node.label} />
      {node.type === "group" ? (
        <NavCardGrid items={node.children} basePath={`/forms/${slug.join("/")}`} />
      ) : (
        <EmptyDataTable columns={node.columns} />
      )}
    </div>
  );
}
