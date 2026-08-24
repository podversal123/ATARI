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
import { EmployeeDetailsAddForm } from "@/components/data-table/employee-details-add-form";
import { TechnicalAchievementSummaryPanel } from "@/components/data-table/technical-achievement-summary-panel";

const EVENT_DEMOGRAPHIC_SLUGS = new Set([
  "technology-week-celebration",
  "world-soil-day",
]);
/** View OFT / View FLD only - see EmptyDataTable's `oftFldStatus` prop for the full spec (client pointer, 2026-08-24). */
const OFT_FLD_STATUS_SLUGS = new Set(["oft", "view-fld"]);
/** Leaves whose real Add/Edit shape isn't a flat field list - these keep opening their existing bespoke dialog instead of the new full-page Add flow. */
const CUSTOM_FORM_SLUGS = new Set([
  "technical-parameter",
  ...EVENT_DEMOGRAPHIC_SLUGS,
]);

/**
 * About KVK's 5 sub-groups (Basic Information, Employee Information, Land &
 * Infrastructure Information, Vehicles Information, Equipments Information)
 * exist only to group their leaves into landing-page cards - the real
 * reference's own breadcrumb for every leaf underneath them skips straight
 * from "About KVK" to the leaf name (confirmed directly against every one of
 * the 5: /forms/about-kvk/view-kvks, bank-account, employee-details,
 * infrastructure, vehicles, equipments all render "Form Management > About
 * KVK > {leaf}" with no group crumb in between). Achievements/Projects/CFLD
 * and the rest of Form Management do NOT share this - their own group crumbs
 * (Projects, CFLD, Front Line Demonstrations (FLD), ...) are confirmed to
 * appear in the real breadcrumb, so this suppression is scoped to these 5
 * slugs only, not a general rule. Applied to both the list page's breadcrumb
 * and the Add page's breadcrumb, so the two stay consistent.
 */
const ABOUT_KVK_CARD_ONLY_GROUP_SLUGS = new Set([
  "basic",
  "employee",
  "land-infrastructure",
  "vehicles",
  "equipments",
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
      if (
        trail[0]?.slug === "about-kvk" &&
        item.type === "group" &&
        ABOUT_KVK_CARD_ONLY_GROUP_SLUGS.has(item.slug)
      ) {
        return;
      }
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
    if (node.slug === "employee-details") {
      return <EmployeeDetailsAddForm trail={addTrail} backHref={backHref} />;
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
   * Back must return to the immediate parent page - the crumb directly to
   * the current one's left - not jump straight to the Form Management root.
   * Client pointer (2026-08-24): "Back navigation should follow the user's
   * actual previous page/section", e.g. Achievement -> Extension Activities
   * -> Back should land on Extension's own group page, not the Achievement
   * Dashboard. Reusing `trailCrumbs` (rather than re-deriving from `slug`)
   * means this automatically respects About KVK's card-only sub-group
   * suppression too - its leaves' real previous page is About KVK itself,
   * not the invisible "Basic Information" stop the URL nests them under.
   */
  const listBackHref =
    trailCrumbs[trailCrumbs.length - 2]?.href ?? "/forms";

  /**
   * Sibling-leaf tabs above the table, same pattern All Masters uses -
   * every leaf under the immediate parent group becomes a pill, so clicking
   * across siblings (e.g. DRMR Details <-> DRMR Activity, or View FLD <->
   * Extension & Training <-> Technical Feedback) doesn't require going back
   * to the group's landing page first. Only shown when the parent's
   * children are ALL leaves (a genuine, cohesive sibling set) - client
   * pointer (2026-08-25): a "single" leaf sitting directly under a MIXED
   * parent (Achievements has both real sub-groups like FLD/Extension AND
   * flat standalone leaves like OFT/Trainings/Publications/HRD/Production &
   * Supply/Technical Achievement as direct children) got tabbed together
   * with those unrelated flat leaves purely by accident of the data shape,
   * which read as broken rather than useful - the real atariams.org page
   * for any of these has no such tab strip either. Excluding all of them
   * this way (not just OFT) rather than hardcoding each slug.
   */
  let tabs: MasterTab[] | undefined;
  if (node.type === "leaf" && trail.length >= 2) {
    const parent = trail[trail.length - 2];
    if (
      parent.type === "group" &&
      parent.children.every((item) => item.type === "leaf")
    ) {
      const basePath = `/forms/${slug.slice(0, -1).join("/")}`;
      tabs = parent.children
        .filter((item): item is Extract<typeof item, { type: "leaf" }> =>
          item.type === "leaf",
        )
        .map((item) => ({
          label: item.label,
          href: `${basePath}/${item.slug}`,
          active: item.slug === node.slug,
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
        backHref={listBackHref}
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
          tabs={tabs}
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
          eventSlug={node.slug}
          oftFldStatus={OFT_FLD_STATUS_SLUGS.has(node.slug)}
          note={
            node.slug === "oft"
              ? 'Please mark your result as "Completed" after adding the OFT details, same as in FLD.'
              : node.slug === "view-fld"
                ? 'Please mark your result as "Completed" after adding the FLD details, same as in OFT.'
                : undefined
          }
        />
      ) : null}
    </div>
  );
}
