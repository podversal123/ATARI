"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GALLERY_MODULES, type GalleryLeaf } from "@/lib/gallery-modules";

type ViewMode = "grid" | "list";

const YEAR_OPTIONS = ["2026-27", "2025-26", "2024-25"];

/**
 * Real structure confirmed from a the reference of /gallery:
 * search + year filter, grid/list toggle, an active-filter chip row, a left
 * "MODULES" panel (expandable groups, each with a photo count) driving
 * which module/form the grid is filtered to, and an empty state offering to
 * clear filters. No photo backend exists yet (Phase 1), so counts stay 0
 * and the empty state additionally offers to upload directly for whichever
 * module/form is selected, per the client's own described flow.
 */
export default function GalleryPage() {
  const [search, setSearch] = useState("");
  const [year, setYear] = useState(YEAR_OPTIONS[0]);
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
  }

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
          {YEAR_OPTIONS.map((y) => (
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
            <span className="text-xs text-muted-foreground">0</span>
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
                    <span className="shrink-0">0</span>
                  </button>
                  {isOpen && (
                    <div className="ml-4 space-y-0.5 border-l border-border pl-2">
                      {module.leaves.map((leaf) => (
                        <button
                          key={leaf.slug}
                          type="button"
                          onClick={() => setActiveLeaf(leaf)}
                          title={leaf.label}
                          className={cn(
                            "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                            activeLeaf?.slug === leaf.slug
                              ? "bg-accent font-medium text-accent-foreground"
                              : "text-foreground hover:bg-muted",
                          )}
                        >
                          <span className="min-w-0 truncate">{leaf.label}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            0
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
            <Button size="sm">
              <Upload className="size-3.5" />
              Upload {activeLeaf ? `to ${activeLeaf.label}` : "Photos"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
