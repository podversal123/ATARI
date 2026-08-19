"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SIDEBAR } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { NavTree } from "./sidebar-nav";
import { SidebarTopLink } from "./sidebar-top-link";
import { SidebarSectionLink } from "./sidebar-section-link";
import { SidebarSearch } from "./sidebar-search";

/**
 * The fixed green Super Admin sidebar. Structure mirrors the reference
 * app: a top section (Dashboard, Form Summary), the All Masters group, then
 * Role/User Management, Form Management, and the remaining utility links.
 *
 * Header is plain "ATARI Zone IV" text + a collapse chevron — no logo next
 * to it in the real reference (confirmed against the screenshot; the ICAR
 * mark only appears on the login page, not in the sidebar). The reference
 * recording never showed the collapsed (icon-only) state despite the
 * chevron implying it's collapsible, so that state's exact look isn't
 * reference-verified — built as a standard icon-rail collapse since the
 * toggle needs to actually work.
 */
export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex h-screen shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex items-center px-5 pt-5 pb-4",
          collapsed ? "justify-center px-0" : "justify-between"
        )}
      >
        {!collapsed && <p className="truncate text-sm font-bold">ATARI Zone IV</p>}
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="text-white/70 transition-colors hover:text-white"
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>

      <div className={cn("pb-4", collapsed ? "px-2" : "px-4")}>
        {collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            aria-label="Search"
            title="Search (Ctrl+K)"
            className="flex w-full items-center justify-center rounded-md border border-white/15 bg-black/10 py-2 text-white/60 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
        ) : (
          <SidebarSearch />
        )}
      </div>

      <nav
        className={cn(
          "sidebar-scroll flex-1 overflow-y-auto pb-6",
          collapsed ? "px-2" : "px-3"
        )}
      >
        {!collapsed && (
          <p className="px-3 pt-2 pb-2 text-[11px] font-semibold tracking-wider text-white/50">
            NAVIGATION
          </p>
        )}
        <ul className="space-y-0.5">
          {SIDEBAR.map((section) => {
            if (section.children) {
              return (
                <li key={section.slug}>
                  <SidebarTopLink
                    label={section.label}
                    iconName={section.icon}
                    href={`/${section.slug}`}
                    collapsed={collapsed}
                  >
                    <NavTree items={section.children} basePath={`/${section.slug}`} />
                  </SidebarTopLink>
                </li>
              );
            }
            return (
              <li key={section.slug}>
                <SidebarSectionLink
                  href={section.href!}
                  label={section.label}
                  iconName={section.icon}
                  collapsed={collapsed}
                />
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
