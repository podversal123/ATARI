import Link from "next/link";
import { Folder, FileText } from "lucide-react";
import type { NavItem } from "@/lib/navigation";

type NavCardGridProps = {
  items: NavItem[];
  basePath: string;
};

/** Card grid used for a group's landing page (e.g. "Other Masters" listing its sub-groups). */
export function NavCardGrid({ items, basePath }: NavCardGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const href = `${basePath}/${item.slug}`;
        const Icon = item.type === "group" ? Folder : FileText;
        return (
          <Link
            key={href}
            href={href}
            className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent"
          >
            <Icon className="mb-3 size-5 text-primary" />
            <p className="text-sm font-medium text-foreground">{item.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {item.type === "group"
                ? `${item.children.length} item${item.children.length === 1 ? "" : "s"}`
                : "Master list"}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
