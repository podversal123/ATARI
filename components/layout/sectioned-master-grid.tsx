import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Bug,
  CalendarClock,
  CalendarDays,
  Car,
  ClipboardCheck,
  ClipboardList,
  CloudSun,
  Cog,
  Crown,
  Droplets,
  FlaskConical,
  GraduationCap,
  HandHeart,
  Handshake,
  Home,
  IndianRupee,
  LandPlot,
  Landmark,
  Leaf,
  Link2,
  Megaphone,
  MapPin,
  Package,
  PartyPopper,
  PawPrint,
  Plane,
  Scale,
  School,
  Shield,
  ShieldCheck,
  Sparkles,
  Sprout,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Users2,
  Wheat,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { NavGroup } from "@/lib/navigation";

/**
 * Per-card icon. The Other Masters set (employee..project-wise-budget) and
 * "basic"/"publication" are all pixel-matched to the reference -
 * a location-pin icon for Basic Masters, an open-book icon for
 * Publications; neither has a border line under the heading in the
 * reference either, just the icon + repeated title, then the list. Every
 * other entry below (OFT & FLD / Training & Extension / Production under
 * All Masters, and the whole Form Management set) has no reference
 * reference for its icon specifically - generic, non-fabricated choices
 * added so every card has one, per client request ("sbme logo hai" /
 * "form management mai bhi sare mai logo laga do"). Slugs that mean the
 * same thing under both All Masters and Form Management (oft, cfld, nicra,
 * nari, arya-related, agri-drone, natural-farming, tsp-scsp, employee,
 * basic) intentionally share one icon - this map is keyed by slug only, so
 * reusing it across pages is fine since the concept is the same.
 */
const GROUP_ICONS: Record<string, LucideIcon> = {
  employee: Users,
  bank: IndianRupee,
  "calendar-context": Landmark,
  resource: Wrench,
  nari: Leaf,
  nicra: ShieldCheck,
  "performance-indicator": TrendingUp,
  "project-wise-budget": IndianRupee,
  basic: MapPin,
  publication: BookOpen,
  // OFT & FLD Masters
  oft: FlaskConical,
  fld: Sprout,
  cfld: Leaf,
  // Training & Extension Masters
  training: BookOpen,
  "extension-activities": Megaphone,
  events: CalendarDays,
  // Production Masters
  "seed-planting-bio": Package,
  "climate-resilient-agriculture": CloudSun,
  arya: Users2,
  "tsp-scsp": HandHeart,
  "natural-farming": Sprout,
  "agri-drone": Plane,
  // Form Management -> About KVK
  "land-infrastructure": Home,
  vehicles: Car,
  equipments: Cog,
  // Form Management -> Achievements
  "technical-achievement": ClipboardCheck,
  "front-line-demonstration": Sprout,
  trainings: BookOpen,
  extension: Megaphone,
  "special-days": PartyPopper,
  "production-supply": Package,
  "soil-water-testing": Droplets,
  publications: BookOpen,
  hrd: Users,
  awards: Trophy,
  "swachhta-bharat-abhiyaan": Sparkles,
  // Form Management -> Projects
  "nicra-others": Shield,
  "arya-safal": Users2,
  "fpo-cbbo": Handshake,
  drmr: Sprout,
  cra: CloudSun,
  csisa: Wheat,
  "seed-hub": Package,
  "other-programmes": ClipboardList,
  // Form Management -> Performance Indicators
  impact: Target,
  "district-village-performance": LandPlot,
  "infrastructure-performance": Building2,
  "financial-performance": IndianRupee,
  linkages: Link2,
  // Form Management -> Meetings (self-wraps into one card)
  meetings: CalendarClock,
  // Form Management -> Miscellaneous
  "prevalent-diseases-crops": Bug,
  "prevalent-diseases-livestock": PawPrint,
  "nyk-training": GraduationCap,
  "ppv-fra-sensitization": Scale,
  "rawe-fet-fit-programme": School,
  "vip-visitors": Crown,
};

type SectionedMasterGridProps = {
  /** Sub-groups (Employee Masters, Bank Masters,...), each rendered as its own card. */
  groups: NavGroup[];
  basePath: string;
};

/**
 * "Other Masters" landing page. Unlike every other Masters group, the real
 * reference renders all of its sub-groups as cards on a single page, each
 * listing its individual masters as clickable text rows - there is no
 * intermediate sub-group landing page to click through first. Rows have no
 * divider lines and default to dark text; only on hover does the row turn
 * green and grow a trailing arrow - both confirmed against the reference.
 * Leaf links below jump
 * straight from this page to the master's data table, skipping the generic
 * NavCardGrid drill-down used everywhere else in All Masters.
 */
export function SectionedMasterGrid({
  groups,
  basePath,
}: SectionedMasterGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {groups.map((group) => {
        const Icon = GROUP_ICONS[group.slug];
        return (
          <div
            key={group.slug}
            className="rounded-lg border border-border bg-card p-4"
          >
            <p className="mb-2 flex items-center gap-2 text-base font-bold text-primary">
              {Icon && <Icon className="size-4.5 shrink-0" />}
              {group.pageTitle ?? group.label}
            </p>
            <ul>
              {group.children.map((child) => {
                // A card wrapping a single same-slug leaf is a synthetic single-item
                // card (see `landingCards`) - the leaf itself lives directly under
                // basePath, not nested one level deeper under the card's own slug.
                const isSelfWrap =
                  group.children.length === 1 && child.slug === group.slug;
                const href = isSelfWrap
                  ? `${basePath}/${child.slug}`
                  : `${basePath}/${group.slug}/${child.slug}`;
                // Where a leaf's card text differs from its own page title (e.g. card
                // "Infrastructure Master" vs page "Infrastructure"), the card must show
                // the card text - that's what `cardLabel` records.
                const cardText =
                  child.type === "leaf"
                    ? (child.cardLabel ?? child.label)
                    : child.label;
                return (
                  <li key={child.slug}>
                    <Link
                      href={href}
                      className="group flex items-center justify-between gap-2 py-2.5 text-sm text-foreground transition-colors hover:text-primary"
                    >
                      {cardText}
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
