"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Download,
  ImageIcon,
  Images,
  LayoutGrid,
  List,
  Upload,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { SimpleSelect } from "@/components/ui/simple-select";
import { SelectKvksMultiDropdown } from "@/components/module-images/select-kvks-multi-dropdown";
import { cn, downloadImageFile } from "@/lib/utils";
import { GALLERY_MODULES, type GalleryLeaf } from "@/lib/gallery-modules";
import { MODULE_IMAGE_REPORTING_YEARS, type ModuleImageRecord } from "@/lib/module-images";
import { KVKS } from "@/lib/rbac";
import { useSession } from "@/lib/session";

type ViewMode = "grid" | "list";

/**
 * KVK filter + year filter, grid/list toggle, an active-filter chip row, a
 * left "MODULES" panel (expandable groups, each with a photo count) driving
 * which module/form the grid is filtered to, and an empty state offering to
 * clear filters. The KVK filter replaced the original free-text search box
 * (client direction, 2026-08-31 - matches Module Images' own "Select KVKs"
 * picker instead of a caption/KVK/module text search). Real backend wired
 * 2026-08-28 - reads every *published*
 * photo across the zone from the same ModuleImage table Module Images
 * writes to (GET /api/module-images?published=true); a photo only shows up
 * here once its own KVK (or Super Admin) has chosen to publish it. Upload
 * routes to the same Add Image flow Module Images already has, rather than
 * duplicating it. Year options switched from the earlier hardcoded
 * "2026-27" fiscal-range strings to plain calendar years, matching the
 * real reportingYear the rest of the app (and this table) actually stores.
 */
export default function GalleryPage() {
  const session = useSession();
  /** Upload is KVK-only on the backend (POST /api/module-images rejects Super Admin - "Super Admin only ever browses/downloads across every KVK, never uploads", spec section 1), matching Module Images' own Super Admin view, which already has no Upload button. Gallery's button used to render unconditionally, so a Super Admin could fill out the whole Add Image form and only get blocked at the very last "Save & Submit" step with a real "Not authorized" error (real bug, 2026-08-31). */
  const canUpload = session.role !== "super-admin";
  const [rows, setRows] = useState<ModuleImageRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/module-images?published=true")
      .then((res) => (res.ok ? res.json() : { rows: [] }))
      .then((data) => setRows(data.rows ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const [selectedKvks, setSelectedKvks] = useState<Set<string>>(
    new Set(KVKS.map((k) => k.name)),
  );
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
    setSelectedKvks(new Set(KVKS.map((k) => k.name)));
    setYear("All");
  }

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (activeLeaf && row.categoryPath !== activeLeaf.path) return false;
      if (year !== "All" && row.reportingYear !== year) return false;
      if (selectedKvks.size > 0 && !selectedKvks.has(row.kvk)) return false;
      return true;
    });
  }, [rows, activeLeaf, year, selectedKvks]);

  const countForLeaf = (path: string) =>
    rows.filter((r) => r.categoryPath === path && (year === "All" || r.reportingYear === year)).length;
  const countForModule = (leaves: GalleryLeaf[]) =>
    leaves.reduce((sum, leaf) => sum + countForLeaf(leaf.path), 0);

  const uploadHref = activeLeaf
    ? `/module-images/add-image?category=${encodeURIComponent(activeLeaf.path)}`
    : "/module-images/add-image";

  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function handleDownload(event: MouseEvent, row: ModuleImageRecord) {
    event.preventDefault();
    event.stopPropagation();
    if (!row.previewUrl) return;
    try {
      await downloadImageFile(row.previewUrl, `${row.kvk} - ${row.categoryLabel} - ${row.caption}`);
    } catch {
      setDownloadError("Could not download this photograph.");
    }
  }

  return (
    <div>
      <PageHeader trail={[{ label: "Gallery" }]} title="Gallery" icon={Images} />

      {downloadError && (
        <p role="alert" className="mb-2 text-sm font-medium text-destructive">
          {downloadError}
        </p>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="w-64">
          <SelectKvksMultiDropdown selected={selectedKvks} onChange={setSelectedKvks} />
        </div>
        <SimpleSelect
          value={year}
          onValueChange={setYear}
          options={[
            { value: "All", label: "All" },
            ...MODULE_IMAGE_REPORTING_YEARS.map((y) => ({ value: y, label: y })),
          ]}
          className="h-8 w-28"
        />
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
              {canUpload && (
                <Link href={uploadHref} className={cn(buttonVariants({ size: "sm" }))}>
                  <Upload className="size-3.5" />
                  Upload {activeLeaf ? `to ${activeLeaf.label}` : "Photos"}
                </Link>
              )}
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
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={row.previewUrl}
                    alt={row.caption}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={(event) => handleDownload(event, row)}
                    aria-label="Download"
                    title="Download"
                    className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-md bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                  >
                    <Download className="size-3.5" />
                  </button>
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
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground" title={row.caption}>
                    {row.caption}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {row.kvk} · {row.categoryLabel} · {row.date}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(event) => handleDownload(event, row)}
                  aria-label="Download"
                  title="Download"
                  className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Download className="size-4" />
                </button>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
