import Image from "next/image";
import { Search } from "lucide-react";
import { SIDEBAR } from "@/lib/navigation";
import { NavTree } from "./sidebar-nav";
import { SidebarTopLink } from "./sidebar-top-link";
import { SidebarSectionLink } from "./sidebar-section-link";

/**
 * The fixed green Super Admin sidebar. Structure mirrors the reference
 * app: a top section (Dashboard, Form Summary), the All Masters group, then
 * Role/User Management, Form Management, and the remaining utility links.
 */
export function Sidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-5 pt-5 pb-4">
        <Image
          src="/brand/icar-logo.png"
          alt=""
          width={28}
          height={28}
          className="rounded-sm bg-white/90 p-0.5"
        />
        <div className="leading-tight">
          <p className="text-sm font-semibold">ATARI Zone IV</p>
        </div>
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
                    <NavTree items={section.children} basePath={`/${section.slug}`} depth={1} />
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
