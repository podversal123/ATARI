"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  ImageIcon,
  Images,
  LayoutGrid,
  List,
  Search,
  Upload,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GALLERY_MODULES, type GalleryLeaf } from "@/lib/gallery-modules";
import { MODULE_IMAGE_REPORTING_YEARS, type ModuleImageRecord } from "@/lib/module-images";

type ViewMode = "grid" | "list";

/**
 * Real structure confirmed from a the reference of /gallery:
 * search + year filter, grid/list toggle, an active-filter chip row, a left
 * "MODULES" panel (expandable groups, each with a photo count) driving
 * which module/form the grid is filtered to, and an empty state offering to
 * clear filters. Real backend wired 2026-08-28 - reads every *published*
 * photo across the zone from the same ModuleImage table Module Images
 * writes to (GET /api/module-images?published=true); a photo only shows up
 * here once its own KVK (or Super Admin) has chosen to publish it. Upload
 * routes to the same Add Image flow Module Images already has, rather than
 * duplicating it. Year options switched from the earlier hardcoded
 * "2026-27" fiscal-range strings to plain calendar years, matching the
 * real reportingYear the rest of the app (and this table) actually stores.
 */
export default function GalleryPage() {
  const [rows, setRows] = useState<ModuleImageRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/module-images?published=true")
      .then((res) => (res.ok ? res.json() : { rows: [] }))
      .then((data) => setRows(data.rows ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const [search, setSearch] = useState("");
  const [year, setYear] = useState("All");
  const [view, setView] = useState<ViewMode>("grid");
  /** Accordion, same as the main Sidebar's own top-level groups (client request, 2026-08-24): opening one module auto-closes whichever other one was open, rather than letting several stay expanded at once. */
  const [openModule, setOpenModule] = useState<string | null>(
    GALLERY_MODULES[0]?.slug ?? null,
  );
  const [activeLeaf, setActiveLeaf] = useState<GalleryLeaf | null>(null);

  function toggleModule(slug: string) {
    setOpenModule((prev) => (prev === slug ? null : slug));
  }

  function clearAll() {
    setActiveLeaf(null);
    setSearch("");
    setYear("All");
  }

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (activeLeaf && row.categoryPath !== activeLeaf.path) return false;
      if (year !== "All" && row.reportingYear !== year) return false;
      if (
        query &&
        !(
          row.caption.toLowerCase().includes(query) ||
          row.kvk.toLowerCase().includes(query) ||
          row.categoryLabel.toLowerCase().includes(query)
        )
      ) {
        return false;
      }
      return true;
    });
  }, [rows, activeLeaf, year, search]);

  const countForLeaf = (path: string) =>
    rows.filter((r) => r.categoryPath === path && (year === "All" || r.reportingYear === year)).length;
  const countForModule = (leaves: GalleryLeaf[]) =>
    leaves.reduce((sum, leaf) => sum + countForLeaf(leaf.path), 0);

  const uploadHref = activeLeaf
    ? `/module-images/add-image?category=${encodeURIComponent(activeLeaf.path)}`
    : "/module-images/add-image";

  return (
    <div>
      <PageHeader trail={[{ label: "Gallery" }]} title="Gallery" icon={Images} />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-56">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search captions, KVK, module..."
            className="pl-8"
          />
        </div>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="h-8 rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring"
        >
          <option>All</option>
          {MODULE_IMAGE_REPORTING_YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-1 rounded-md border border-border bg-muted/50 p-0.5">
          <button
            type="button"
            onClick={() => setView("grid")}
            aria-label="Grid view"
            className={cn(
              "rounded-[calc(var(--radius-md)-2px)] p-1.5 transition-colors",
              view === "grid"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            aria-label="List view"
            className={cn(
              "rounded-[calc(var(--radius-md)-2px)] p-1.5 transition-colors",
              view === "list"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <List className="size-4" />
          </button>
        </div>
      </div>

      {activeLeaf && (
        <div className="mb-3 flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-accent-foreground">
            Module: {activeLeaf.trail}
            <button type="button" onClick={() => setActiveLeaf(null)} aria-label="Remove filter">
              <X className="size-3.5" />
            </button>
          </span>
          <button
            type="button"
            onClick={clearAll}
            className="text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Modules
          </p>

          <button
            type="button"
            onClick={() => setActiveLeaf(null)}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
              !activeLeaf
                ? "bg-accent font-medium text-accent-foreground"
                : "text-foreground hover:bg-muted",
            )}
          >
            All modules
            <span className="text-xs text-muted-foreground">
              {year === "All" ? rows.length : rows.filter((r) => r.reportingYear === year).length}
            </span>
          </button>

          <div className="mt-1 space-y-0.5">
            {GALLERY_MODULES.map((module) => {
              const isOpen = openModule === module.slug;
              return (
                <div key={module.slug}>
                  <button
                    type="button"
                    onClick={() => toggleModule(module.slug)}
                    title={module.label}
                    className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase hover:bg-muted"
                  >
                    <span className="flex min-w-0 items-center gap-1">
                      {isOpen ? (
                        <ChevronDown className="size-3.5 shrink-0" />
                      ) : (
                        <ChevronRight className="size-3.5 shrink-0" />
                      )}
                      <span className="min-w-0 truncate">{module.label}</span>
                    </span>
                    <span className="shrink-0">{countForModule(module.leaves)}</span>
                  </button>
                  {isOpen && (
                    <div className="ml-4 space-y-0.5 border-l border-border pl-2">
                      {module.leaves.map((leaf) => (
                        <button
                          key={leaf.path}
                          type="button"
                          onClick={() => setActiveLeaf(leaf)}
                          title={leaf.label}
                          className={cn(
                            "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                            activeLeaf?.path === leaf.path
                              ? "bg-accent font-medium text-accent-foreground"
                              : "text-foreground hover:bg-muted",
                          )}
                        >
                          <span className="min-w-0 truncate">{leaf.label}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {countForLeaf(leaf.path)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-96 items-center justify-center rounded-lg border border-border bg-card p-10 text-sm text-muted-foreground">
            Loading…
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-border bg-card p-10 text-center">
            <ImageIcon className="mb-3 size-10 text-muted-foreground/40" />
            <p className="text-sm font-semibold text-foreground">No images found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try clearing the active filters or pick a different year.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear all filters
              </Button>
              <Link href={uploadHref} className={cn(buttonVariants({ size: "sm" }))}>
                <Upload className="size-3.5" />
                Upload {activeLeaf ? `to ${activeLeaf.label}` : "Photos"}
              </Link>
            </div>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {filteredRows.map((row) => (
              <a
                key={row.id}
                href={row.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group overflow-hidden rounded-lg border border-border bg-card"
              >
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={row.previewUrl}
                    alt={row.caption}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-2.5">
                  <p className="line-clamp-2 text-xs font-medium text-foreground" title={row.caption}>
                    {row.caption}
                  </p>
                  <p className="mt-1 truncate text-[11px] text-muted-foreground">
                    {row.kvk} · {row.categoryLabel} · {row.date}
                  </p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border bg-card">
            {filteredRows.map((row) => (
              <a
                key={row.id}
                href={row.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 hover:bg-muted/50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={row.previewUrl}
                  alt={row.caption}
                  className="size-14 shrink-0 rounded-md object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground" title={row.caption}>
                    {row.caption}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {row.kvk} · {row.categoryLabel} · {row.date}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
