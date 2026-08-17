import { ChevronLeft, Search } from "lucide-react";
import { SIDEBAR } from "@/lib/navigation";
import { NavTree } from "./sidebar-nav";
import { SidebarTopLink } from "./sidebar-top-link";
import { SidebarSectionLink } from "./sidebar-section-link";

/**
 * The fixed green Super Admin sidebar. Structure mirrors the reference
 * app: a top section (Dashboard, Form Summary), the All Masters group, then
 * Role/User Management, Form Management, and the remaining utility links.
 *
 * Header is plain "ATARI Zone IV" text + a collapse chevron — no logo next
 * to it in the real reference (confirmed against the screenshot; the ICAR
 * mark only appears on the login page, not in the sidebar).
 */
export function Sidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <p className="text-sm font-bold">ATARI Zone IV</p>
        <ChevronLeft className="size-4 text-white/70" />
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 rounded-md border border-white/15 bg-black/10 px-3 py-2 text-sm text-white/60">
          <Search className="size-4" />
          <span>Search... (Ctrl+K)</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        <p className="px-3 pt-2 pb-2 text-[11px] font-semibold tracking-wider text-white/50">
          NAVIGATION
        </p>
        <ul className="space-y-0.5">
          {SIDEBAR.map((section) => {
            if (section.children) {
              return (
                <li key={section.slug}>
                  <SidebarTopLink label={section.label} iconName={section.icon} href={`/${section.slug}`}>
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
                />
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
