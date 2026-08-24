import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import {
  FORM_MANAGEMENT,
  resolveNavPath,
  landingCards,
  type NavGroup,
} from "@/lib/navigation";
import { PageHeader, type Crumb } from "@/components/layout/page-header";
import { SectionedMasterGrid } from "@/components/layout/sectioned-master-grid";
import {
  EmptyDataTable,
  type MasterTab,
} from "@/components/data-table/empty-data-table";
import { AddLeafPage } from "@/components/data-table/add-leaf-page";
import { ViewKvksAddForm } from "@/components/data-table/view-kvks-add-form";
import { TechnicalAchievementSummaryPanel } from "@/components/data-table/technical-achievement-summary-panel";

const EVENT_DEMOGRAPHIC_SLUGS = new Set([
  "technology-week-celebration",
  "world-soil-day",
]);
/** Leaves whose real Add/Edit shape isn't a flat field list - these keep opening their existing bespoke dialog instead of the new full-page Add flow. */
const CUSTOM_FORM_SLUGS = new Set([
  "technical-parameter",
  ...EVENT_DEMOGRAPHIC_SLUGS,
]);

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
    const backHref = `/forms/${slug.join("/")}`;
    if (node.slug === "view-kvks") {
      return <ViewKvksAddForm trail={addTrail} backHref={backHref} />;
    }
    return (
      <AddLeafPage
        title={node.label}
        trail={addTrail}
        backHref={backHref}
        columns={node.columns}
      />
    );
  }

  /**
   * About KVK's 5 sub-groups (Basic Information, Employee Information, Land
   * & Infrastructure Information, Vehicles Information, Equipments
   * Information) exist only to group their leaves into landing-page cards -
   * the real reference's own breadcrumb for every leaf underneath them skips
   * straight from "About KVK" to the leaf name (confirmed directly against
   * every one of the 5: /forms/about-kvk/view-kvks, bank-account,
   * employee-details, infrastructure, vehicles, equipments all render
   * "Form Management > About KVK > {leaf}" with no group crumb in between).
   * Achievements/Projects/CFLD and the rest of Form Management do NOT share
   * this - their own group crumbs (Projects, CFLD, Front Line Demonstrations
   * (FLD), ...) are confirmed to appear in the real breadcrumb, so this
   * suppression is scoped to these 5 slugs only, not a general rule.
   */
  const ABOUT_KVK_CARD_ONLY_GROUP_SLUGS = new Set([
    "basic",
    "employee",
    "land-infrastructure",
    "vehicles",
    "equipments",
  ]);

  const trailCrumbs: Crumb[] = [{ label: "Form Management", href: "/forms" }];
  trail.slice(0, -1).forEach((item, index) => {
    if (
      trail[0]?.slug === "about-kvk" &&
      item.type === "group" &&
      ABOUT_KVK_CARD_ONLY_GROUP_SLUGS.has(item.slug)
    ) {
      return;
    }
    trailCrumbs.push({
      label: item.label,
      href: `/forms/${trail
        .slice(0, index + 1)
        .map((t) => t.slug)
        .join("/")}`,
    });
  });
  trailCrumbs.push({ label: node.label });

  /**
   * Green bar above a Form Management table carries the module → sub-module
   * path only (e.g. "About KVK" › "Employee Information"), not the sibling
   * form list - client direction: "form management mai module and sub module
   * hi rhega, extra nahi dikhna chahiye". The deepest group is marked active.
   */
  let moduleTrail: MasterTab[] | undefined;
  if (node.type === "leaf") {
    const groupTrail = trail
      .filter((item): item is NavGroup => item.type === "group")
      .filter(
        (item) =>
          !(
            trail[0]?.slug === "about-kvk" &&
            ABOUT_KVK_CARD_ONLY_GROUP_SLUGS.has(item.slug)
          ),
      );
    if (groupTrail.length > 0) {
      moduleTrail = groupTrail.map((item, index) => ({
        label: item.label,
        href: `/forms/${trail
          .slice(0, trail.indexOf(item) + 1)
          .map((t) => t.slug)
          .join("/")}`,
        active: index === groupTrail.length - 1,
      }));
    }
  }

  /** Same flat inline-list card pattern as All Masters - confirmed against the reference for /forms/about-kvk and Projects. */
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
        title={
          node.type === "group" ? (node.pageTitle ?? node.label) : undefined
        }
        icon={node.type === "group" ? FileText : undefined}
        description={node.type === "group" ? node.description : undefined}
      />
      {sectionedGroups ? (
        <SectionedMasterGrid
          groups={sectionedGroups}
          basePath={sectionedBasePath}
        />
      ) : node.type === "leaf" && node.slug === "technical-achievement" ? (
        /* The one Form Management leaf that is a matrix report rather than a list table. */
        <TechnicalAchievementSummaryPanel />
      ) : node.type === "leaf" ? (
        <EmptyDataTable
          title={node.label}
          icon="form-management"
          columns={node.columns}
          subtitle={`Manage and view all ${node.label.toLowerCase()} in the system`}
          moduleTrail={moduleTrail}
          addNewHref={
            CUSTOM_FORM_SLUGS.has(node.slug)
              ? undefined
              : `/forms/${slug.join("/")}/add`
          }
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
