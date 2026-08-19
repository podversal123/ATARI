import Link from "next/link";
import {
  ArrowRight,
  IndianRupee,
  Landmark,
  Leaf,
  ShieldCheck,
  TrendingUp,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavGroup } from "@/lib/navigation";

/** Per-card icon, pixel-matched to the reference screenshot (each Other Masters card has its own). */
const GROUP_ICONS: Record<string, LucideIcon> = {
  employee: Users,
  bank: IndianRupee,
  "calendar-context": Landmark,
  resource: Wrench,
  nari: Leaf,
  nicra: ShieldCheck,
  "performance-indicator": TrendingUp,
  "project-wise-budget": IndianRupee,
};

type SectionedMasterGridProps = {
  /** Sub-groups (Employee Masters, Bank Masters, ...), each rendered as its own card. */
  groups: NavGroup[];
  basePath: string;
};

/**
 * "Other Masters" landing page. Unlike every other Masters group, the real
 * reference renders all of its sub-groups as cards on a single page, each
 * listing its individual masters as clickable text rows — there is no
 * intermediate sub-group landing page to click through first (confirmed by
 * directly viewing atari-master-data/master/6.Other Masters/1st and 2nd pic
 * of other masters.png, real screenshots of atari-client.vercel.app/
 * all-master/other-masters). Rows have no divider lines and default to dark
 * text; only on hover does the row turn green and grow a trailing arrow —
 * also confirmed directly from those screenshots. Leaf links below jump
 * straight from this page to the master's data table, skipping the generic
 * NavCardGrid drill-down used everywhere else in All Masters.
 */
export function SectionedMasterGrid({ groups, basePath }: SectionedMasterGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {groups.map((group) => {
        const Icon = GROUP_ICONS[group.slug];
        return (
          <div key={group.slug} className="rounded-lg border border-border bg-card p-4">
            <p className={cn("mb-1 flex items-center gap-2 text-sm font-semibold text-primary", !Icon && "mb-2")}>
              {Icon && <Icon className="size-4" />}
              {group.label}
            </p>
            <ul>
              {group.children.map((child) => {
                // A card wrapping a single same-slug leaf is a synthetic single-item
                // card (see `landingCards`) — the leaf itself lives directly under
                // basePath, not nested one level deeper under the card's own slug.
                const isSelfWrap = group.children.length === 1 && child.slug === group.slug;
                const href = isSelfWrap
                  ? `${basePath}/${child.slug}`
                  : `${basePath}/${group.slug}/${child.slug}`;
                return (
                  <li key={child.slug}>
                    <Link
                      href={href}
                      className="group flex items-center justify-between gap-2 py-2.5 text-sm text-foreground transition-colors hover:text-primary"
                    >
                      {child.label}
                      <ArrowRight className="size-3.5 shrink-0 -translate-x-1 text-primary opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
