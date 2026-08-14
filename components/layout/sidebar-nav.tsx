"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/navigation";

type NavTreeProps = {
  items: NavItem[];
  basePath: string;
  depth?: number;
};

/**
 * Recursively renders a nav group (All Masters, Other Masters, ...) down to
 * its leaf pages. Groups auto-expand when the current route is inside them,
 * and stay collapsible otherwise, matching the reference app's sidebar.
 */
export function NavTree({ items, basePath, depth = 0 }: NavTreeProps) {
  return (
    <ul className={cn(depth > 0 && "mt-1 ml-3 border-l border-white/15 pl-3")}>
      {items.map((item) => {
        const href = `${basePath}/${item.slug}`;
        return item.type === "leaf" ? (
          <NavLeafLink key={href} href={href} label={item.label} />
        ) : (
          <NavGroupItem
            key={href}
            href={href}
            label={item.label}
            children_={item.children}
            depth={depth}
          />
        );
      })}
    </ul>
  );
}

function NavLeafLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <li>
      <Link
        href={href}
        className={cn(
          "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
          isActive
            ? "bg-white font-medium text-sidebar-accent"
            : "text-white/80 hover:bg-black/10 hover:text-white"
        )}
      >
        {label}
      </Link>
    </li>
  );
}

function NavGroupItem({
  href,
  label,
  children_,
  depth,
}: {
  href: string;
  label: string;
  children_: NavItem[];
  depth: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(pathname.startsWith(href));

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-white/80 transition-colors hover:bg-black/10 hover:text-white"
      >
        <span>{label}</span>
        <ChevronDown
          className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && <NavTree items={children_} basePath={href} depth={depth + 1} />}
    </li>
  );
}
