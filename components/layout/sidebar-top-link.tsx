"use client";

import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SidebarIconName } from "@/lib/navigation";
import { SIDEBAR_ICONS } from "./sidebar-icons";

type SidebarTopLinkProps = {
  label: string;
  iconName: SidebarIconName;
  href: string;
  children: ReactNode;
};

/**
 * A top-level, collapsible sidebar entry (e.g. "All Masters", "Form Management").
 *
 * Takes an icon *name* rather than the icon component itself — passing a
 * component reference as a prop from a Server Component (Sidebar) into a
 * Client Component isn't serializable across the RSC boundary, so the
 * lookup happens here instead.
 */
export function SidebarTopLink({ label, iconName, href, children }: SidebarTopLinkProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(pathname.startsWith(href));
  const Icon = SIDEBAR_ICONS[iconName];

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-white/80 transition-colors hover:bg-black/10 hover:text-white"
      >
        <span className="flex items-center gap-2.5">
          <Icon className="size-4 shrink-0" />
          {label}
        </span>
        <ChevronDown className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && children}
    </div>
  );
}
