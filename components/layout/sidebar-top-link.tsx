"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SidebarIconName } from "@/lib/navigation";
import { SIDEBAR_ICONS } from "./sidebar-icons";

type SidebarTopLinkProps = {
  label: string;
  iconName: SidebarIconName;
  href: string;
  collapsed?: boolean;
  /** Controlled from Sidebar so opening one top-level section (e.g. Form Management) auto-collapses any other one that was open (e.g. All Masters) - client requirement, not independent per-section state. */
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  /** True when the current page is this section's own landing page or any page nested under it - same dark-green active pill as every other sidebar link (SidebarSectionLink, NavTree), per client direction (2026-08-30: one consistent active color everywhere, not white). This header previously had no active state of its own at all - hovering it while already on one of its pages just showed the same dark hover tint as any unvisited section. */
  isActive?: boolean;
};

/**
 * A top-level, collapsible sidebar entry (e.g. "All Masters", "Form Management").
 *
 * Takes an icon *name* rather than the icon component itself - passing a
 * component reference as a prop from a Server Component (Sidebar) into a
 * Client Component isn't serializable across the RSC boundary, so the
 * lookup happens here instead.
 *
 * When the whole sidebar is collapsed to icon-only, there's no room to show
 * an inline submenu, so this renders as a plain link to the section's own
 * landing page instead of an expand/collapse toggle.
 */
export function SidebarTopLink({
  label,
  iconName,
  href,
  collapsed,
  open,
  onToggle,
  children,
  isActive,
}: SidebarTopLinkProps) {
  const Icon = SIDEBAR_ICONS[iconName];
  const activeClass = "bg-sidebar-accent text-sidebar-accent-foreground";
  const inactiveClass = "text-white/80 hover:bg-black/10 hover:text-white";

  if (collapsed) {
    return (
      <Link
        href={href}
        title={label}
        className={cn(
          "flex items-center justify-center rounded-md px-3 py-2 text-sm transition-colors",
          isActive ? activeClass : inactiveClass,
        )}
      >
        <Icon className="size-4 shrink-0" />
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
          isActive ? activeClass : inactiveClass,
        )}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <Icon className="size-4 shrink-0" />
          <span className="truncate">{label}</span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && children}
    </div>
  );
}
