"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/navigation";

type NavTreeProps = {
  items: NavItem[];
  basePath: string;
};

/**
 * Renders the direct children of a top-level sidebar section (All Masters,
 * Form Management) as a single flat list of links - confirmed against the
 * reference that the sidebar only ever expands one level deep.
 * A child that is itself a group (e.g. "About KVK") does NOT expand further
 * inline here; clicking it just navigates to that group's card-grid page,
 * where its own children render as page content (cards, or tab-pills for
 * sibling leaves) instead of more sidebar nesting.
 */
export function NavTree({ items, basePath }: NavTreeProps) {
  const pathname = usePathname();

  return (
    <ul className="mt-1 ml-3 space-y-0.5 border-l border-white/15 pl-3">
      {items.map((item) => {
        const href = `${basePath}/${item.slug}`;
        const isActive = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                "flex min-w-0 items-center rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-white/80 hover:bg-black/10 hover:text-white",
              )}
            >
              <span className="truncate">{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
