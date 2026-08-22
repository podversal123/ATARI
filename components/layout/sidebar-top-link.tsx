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
}: SidebarTopLinkProps) {
  const Icon = SIDEBAR_ICONS[iconName];

  if (collapsed) {
    return (
      <Link
        href={href}
        title={label}
        className="flex items-center justify-center rounded-md px-3 py-2 text-sm text-white/80 transition-colors hover:bg-black/10 hover:text-white"
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
        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-white/80 transition-colors hover:bg-black/10 hover:text-white"
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
