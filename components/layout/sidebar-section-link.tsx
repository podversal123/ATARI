"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { SidebarIconName } from "@/lib/navigation";
import { SIDEBAR_ICONS } from "./sidebar-icons";

type SidebarSectionLinkProps = {
  href: string;
  label: string;
  iconName: SidebarIconName;
  collapsed?: boolean;
};

/** A standalone top-level sidebar link (Dashboard, Gallery, ...) with an active-page pill. */
export function SidebarSectionLink({ href, label, iconName, collapsed }: SidebarSectionLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const Icon = SIDEBAR_ICONS[iconName];

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "flex min-w-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
        collapsed && "justify-center",
        isActive
          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
          : "text-white/85 hover:bg-black/10 hover:text-white"
      )}
    >
      <Icon className="size-4 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}
