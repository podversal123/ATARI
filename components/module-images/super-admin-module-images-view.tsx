"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Download,
  Eye,
  EyeOff,
  FileDown,
  FileSpreadsheet,
  Filter as FilterIcon,
  ImageOff,
  RotateCcw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SelectKvksMultiDropdown } from "./select-kvks-multi-dropdown";
import { SelectCategoryDropdown } from "./select-category-dropdown";
import {
  ALL_CATEGORY_PATHS,
  BULK_DOWNLOAD_OPTIONS,
  MODULE_IMAGE_CATEGORIES,
  MODULE_IMAGE_REPORTING_YEARS,
  MODULE_IMAGE_ROWS,
  PUBLISH_FILTER_OPTIONS,
  type ModuleImageRecord,
  type PublishFilter,
} from "@/lib/module-images";
import { KVKS } from "@/lib/rbac";

/**
 * Super Admin - Module Images → Category Wise Photographs. Matches
 * "Module Images UI.pdf" section 2-9 & 17: Reporting Year + multi-select
 * KVKs + Category/Form + date range filters, a results table with a
 * per-row Download plus a checkbox for bulk selection, and a "Download
 * Images By" menu offering Selected Records / Selected KVKs & Category /
 * All Images. Super Admin has no Upload/Edit here (spec section 1) - every
 * action is view/filter/download only.
 *
 * `MODULE_IMAGE_ROWS` is empty today (no backend/storage yet), but the
 * filtering + row-rendering below is real, not stubbed - the same
 * "filter real rows client-side, show the honest empty state only when
 * there truly are none" pattern `EmptyDataTable` already uses for Masters.
 * That way this table actually works the moment real rows exist, instead
 * of needing a rewrite later.
 */
export function SuperAdminModuleImagesView() {
  const [reportingYear, setReportingYear] = useState(
    MODULE_IMAGE_REPORTING_YEARS[0],
  );
  const [selectedKvks, setSelectedKvks] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(ALL_CATEGORY_PATHS),
  );
  const [publishFilter, setPublishFilter] = useState<PublishFilter>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  /** Super Admin's publish overrides, keyed by row id - in-memory only until the backend lands. */
  const [publishOverrides, setPublishOverrides] = useState<
    Record<string, boolean>
  >({});

  const allCategoriesSelected =
    selectedCategories.size === ALL_CATEGORY_PATHS.size;
  const categoryLabel = allCategoriesSelected
    ? "All Categories"
    : selectedCategories.size === 0
      ? "No Category Selected"
      : selectedCategories.size === 1
        ? (MODULE_IMAGE_CATEGORIES.find((c) => selectedCategories.has(c.path))
            ?.label ?? "1 Category")
        : `${selectedCategories.size} Categories`;

  const dateRangeInvalid =
    fromDate !== "" && toDate !== "" && fromDate > toDate;

  /** A row's effective publish state: the Super Admin's override if they've set one, otherwise what the KVK saved. */
  const isPublished = useCallback(
    (row: ModuleImageRecord) => publishOverrides[row.id] ?? row.published,
    [publishOverrides],
  );

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return MODULE_IMAGE_ROWS.filter((row) => {
      if (row.reportingYear !== reportingYear) return false;
      if (selectedKvks.size > 0 && !selectedKvks.has(row.kvk)) return false;
      if (!selectedCategories.has(row.categoryPath)) return false;
      if (publishFilter === "published" && !isPublished(row)) return false;
      if (publishFilter === "unpublished" && isPublished(row)) return false;
      if (fromDate && row.date < fromDate) return false;
      if (toDate && row.date > toDate) return false;
      if (
        query &&
        !(
          row.kvk.toLowerCase().includes(query) ||
          row.caption.toLowerCase().includes(query)
        )
      ) {
        return false;
      }
      return true;
    });
  }, [
    reportingYear,
    selectedKvks,
    selectedCategories,
    publishFilter,
    isPublished,
    fromDate,
    toDate,
    search,
  ]);

  const hasActiveFilters =
    selectedKvks.size > 0 ||
    !allCategoriesSelected ||
    publishFilter !== "all" ||
    fromDate !== "" ||
    toDate !== "" ||
    search !== "";

  function resetFilters() {
    setSelectedKvks(new Set());
    setSelectedCategories(new Set(ALL_CATEGORY_PATHS));
    setPublishFilter("all");
    setFromDate("");
    setToDate("");
    setSearch("");
    setSelectedRows(new Set());
  }

  function togglePublish(id: string, current: boolean) {
    setPublishOverrides((prev) => ({ ...prev, [id]: !current }));
  }

  const kvkLabel = useMemo(() => {
    if (selectedKvks.size === 0 || selectedKvks.size === KVKS.length)
      return "All KVKs";
    if (selectedKvks.size === 1) return Array.from(selectedKvks)[0];
    return `${selectedKvks.size} KVKs`;
  }, [selectedKvks]);

  const allRowsSelected =
    filteredRows.length > 0 &&
    filteredRows.every((row) => selectedRows.has(row.id));

  function toggleAllRows() {
    setSelectedRows(
      allRowsSelected ? new Set() : new Set(filteredRows.map((row) => row.id)),
    );
  }

  function toggleRow(id: string) {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleBulkDownload() {
    // No backend/storage yet - nothing to actually zip and download until Phase 2/3.
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
            <FilterIcon className="size-3.5" />
            Image Filters
          </div>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Reporting Year
            </label>
            <select
              value={reportingYear}
              onChange={(e) => setReportingYear(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring"
            >
              {MODULE_IMAGE_REPORTING_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Select KVKs
            </label>
            <div className="mt-1">
              <SelectKvksMultiDropdown
                selected={selectedKvks}
                onChange={setSelectedKvks}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Category / Form
            </label>
            <div className="mt-1">
              <SelectCategoryDropdown
                selected={selectedCategories}
                onChange={setSelectedCategories}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Publish Status
            </label>
            <select
              value={publishFilter}
              onChange={(e) =>
                setPublishFilter(e.target.value as PublishFilter)
              }
              className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring"
            >
              {PUBLISH_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">From Date</Label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">To Date</Label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        {dateRangeInvalid && (
          <p className="mt-2 text-xs text-destructive">
            To Date cannot be earlier than From Date.
          </p>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Uploaded Images ({filteredRows.length})
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {kvkLabel} · {categoryLabel} · Reporting Year {reportingYear}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by KVK, Caption..."
                className="w-56 pl-8"
              />
            </div>
            <Button variant="outline" size="sm">
              <FileSpreadsheet className="size-3.5" />
              Export Excel
            </Button>
            <Button variant="outline" size="sm">
              <FileDown className="size-3.5" />
              Export PDF
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button size="sm" disabled={filteredRows.length === 0}>
                    <Download className="size-3.5" />
                    Download Images By
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-72">
                {BULK_DOWNLOAD_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.mode}
                    onClick={handleBulkDownload}
                    disabled={
                      option.mode === "selected-records" &&
                      selectedRows.size === 0
                    }
                    className="flex-col items-start gap-0.5 py-1.5"
                  >
                    <span className="font-medium text-foreground">
                      {option.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="divide-x divide-border border-b border-border bg-muted/50 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <th className="w-10 px-4 py-3">
                  <Checkbox
                    checked={allRowsSelected}
                    onCheckedChange={toggleAllRows}
                    disabled={filteredRows.length === 0}
                    aria-label="Select all rows"
                  />
                </th>
                <th className="w-14 px-4 py-3">S.No</th>
                <th className="px-4 py-3">KVK Name</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Category / Form</th>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Caption</th>
                <th className="px-4 py-3">Status</th>
                <th className="w-28 px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-16 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <ImageOff className="size-8 text-muted-foreground/40" />
                      <span>
                        No photographs uploaded yet for the selected filters.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="divide-x divide-border border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 align-top">
                      <Checkbox
                        checked={selectedRows.has(row.id)}
                        onCheckedChange={() => toggleRow(row.id)}
                        aria-label={`Select photograph from ${row.kvk}`}
                      />
                    </td>
                    <td className="px-4 py-3 align-top text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 align-top text-foreground">
                      {row.kvk}
                    </td>
                    <td className="px-4 py-3 align-top text-muted-foreground">
                      {row.date}
                    </td>
                    <td className="px-4 py-3 align-top text-foreground">
                      {row.categoryLabel}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {row.previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.previewUrl}
                          alt={row.caption}
                          className="size-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                          <ImageOff className="size-4 text-muted-foreground/50" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-foreground">
                      <span
                        className="line-clamp-2 max-w-xs"
                        title={row.caption}
                      >
                        {row.caption}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                          isPublished(row)
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {isPublished(row) ? "Published" : "Not Published"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right align-top">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() =>
                            togglePublish(row.id, isPublished(row))
                          }
                          title={
                            isPublished(row)
                              ? "Unpublish this photograph"
                              : "Publish this photograph"
                          }
                        >
                          {isPublished(row) ? (
                            <EyeOff className="size-3.5" />
                          ) : (
                            <Eye className="size-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={!row.previewUrl}
                          title="Download"
                        >
                          <Download className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
          <span>
            {filteredRows.length === 0
              ? "Showing 0-0 of 0"
              : `Showing 1-${filteredRows.length} of ${filteredRows.length}`}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Prev
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
