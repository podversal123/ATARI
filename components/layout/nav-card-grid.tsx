import Link from "next/link";
import {
  Award,
  Building,
  CalendarClock,
  ClipboardList,
  Database,
  FileText,
  Folder,
  Landmark,
  ListTree,
  Newspaper,
  TrendingUp,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { NavItem } from "@/lib/navigation";

/**
 * Distinct icon per top-level module card (All Masters' 6 groups, Form
 * Management's 6 groups) - client request ("logo laga do jo masters ke
 * module aur submodule hai usme"). No the reference exists for these
 * cards' icons, so these are reasonable design choices, not fabricated data.
 */
const MODULE_ICONS: Record<string, LucideIcon> = {
  // All Masters
  basic: Database,
  "oft-fld": ListTree,
  "training-extension": CalendarClock,
  production: Wrench,
  publication: Newspaper,
  other: Folder,
  // Form Management
  "about-kvk": Building,
  achievements: Award,
  projects: ClipboardList,
  performance: TrendingUp,
  meetings: CalendarClock,
  miscellaneous: Landmark,
};

type NavCardGridProps = {
  items: NavItem[];
  basePath: string;
};

/** Card grid used for a group's landing page (e.g. "Other Masters" listing its sub-groups). */
export function NavCardGrid({ items, basePath }: NavCardGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const href = `${basePath}/${item.slug}`;
        const Icon =
          MODULE_ICONS[item.slug] ??
          (item.type === "group" ? Folder : FileText);
        return (
          <Link
            key={href}
            href={href}
            className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent"
          >
            <Icon className="mb-3 size-5 text-primary" />
            <p className="truncate text-sm font-medium text-primary">
              {item.label}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {item.type === "group"
                ? `${item.children.length} item${item.children.length === 1 ? "" : "s"}`
                : "Master list"}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
