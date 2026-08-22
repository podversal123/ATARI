"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  Download,
  Eye,
  EyeOff,
  FileDown,
  FileSpreadsheet,
  Filter as FilterIcon,
  ImageOff,
  Plus,
  RotateCcw,
  Search,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SelectCategoryDropdown } from "./select-category-dropdown";
import {
  ALL_CATEGORY_PATHS,
  MODULE_IMAGE_REPORTING_YEARS,
  MODULE_IMAGE_ROWS,
  PUBLISH_FILTER_OPTIONS,
  type ModuleImageRecord,
  type PublishFilter,
} from "@/lib/module-images";
import { useSession } from "@/lib/session";
import { KVK_MASTER_ROWS } from "@/lib/masters";

/**
 * KVK Admin's own Module Images. Per the spec (section 11), a KVK uploads
 * photographs against a Form Management category via the dedicated Add
 * Image page, and this list shows only their own KVK's uploads, filterable
 * by Reporting Year / Category / date range - no cross-KVK picker (data
 * isolation, same rule as Log History). Rows are scoped to `session.kvkName`
 * before anything else runs, so this can never render another KVK's data
 * even once `MODULE_IMAGE_ROWS` has real rows in it.
 */
export function KvkModuleImagesView() {
  const session = useSession();
  const currentKvkName = session.kvkName ?? KVK_MASTER_ROWS[0].kvk;

  const [reportingYear, setReportingYear] = useState(
    MODULE_IMAGE_REPORTING_YEARS[0],
  );
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(ALL_CATEGORY_PATHS),
  );
  const [publishFilter, setPublishFilter] = useState<PublishFilter>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  /** This KVK's own publish toggles, keyed by row id - in-memory only until the backend lands. */
  const [publishOverrides, setPublishOverrides] = useState<
    Record<string, boolean>
  >({});

  const allCategoriesSelected =
    selectedCategories.size === ALL_CATEGORY_PATHS.size;
  const dateRangeInvalid =
    fromDate !== "" && toDate !== "" && fromDate > toDate;

  const isPublished = useCallback(
    (row: ModuleImageRecord) => publishOverrides[row.id] ?? row.published,
    [publishOverrides],
  );

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return MODULE_IMAGE_ROWS.filter((row) => {
      if (row.kvk !== currentKvkName) return false;
      if (row.reportingYear !== reportingYear) return false;
      if (!selectedCategories.has(row.categoryPath)) return false;
      if (publishFilter === "published" && !isPublished(row)) return false;
      if (publishFilter === "unpublished" && isPublished(row)) return false;
      if (fromDate && row.date < fromDate) return false;
      if (toDate && row.date > toDate) return false;
      if (
        query &&
        !(
          row.categoryLabel.toLowerCase().includes(query) ||
          row.caption.toLowerCase().includes(query)
        )
      ) {
        return false;
      }
      return true;
    });
  }, [
    currentKvkName,
    reportingYear,
    selectedCategories,
    publishFilter,
    isPublished,
    fromDate,
    toDate,
    search,
  ]);

  const hasActiveFilters =
    !allCategoriesSelected ||
    publishFilter !== "all" ||
    fromDate !== "" ||
    toDate !== "";

  function resetFilters() {
    setSelectedCategories(new Set(ALL_CATEGORY_PATHS));
    setPublishFilter("all");
    setFromDate("");
    setToDate("");
  }

  function togglePublish(id: string, current: boolean) {
    setPublishOverrides((prev) => ({ ...prev, [id]: !current }));
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
            <FilterIcon className="size-3.5" />
            Filter Images
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
            >
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
            <Link
              href="/module-images/add-image"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              <Plus className="size-3.5" />
              Add Images
            </Link>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
          <p className="text-sm font-semibold text-foreground">
            Your Uploaded Images ({filteredRows.length})
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by category, caption..."
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
            <Button size="sm" disabled={filteredRows.length === 0}>
              <Download className="size-3.5" />
              Bulk Download
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="divide-x divide-border border-b border-border bg-muted/50 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <th className="w-14 px-4 py-3">S.No</th>
                <th className="px-4 py-3">Category / Form</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Caption</th>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Status</th>
                <th className="w-28 px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-16 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <ImageOff className="size-8 text-muted-foreground/40" />
                      <span>No photographs uploaded yet.</span>
                      <Link
                        href="/module-images/add-image"
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Add your first image
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="divide-x divide-border border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 align-top text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 align-top text-foreground">
                      {row.categoryLabel}
                    </td>
                    <td className="px-4 py-3 align-top text-muted-foreground">
                      {row.date}
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
