"use client";

import { type ReactNode, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  FileDown,
  FileSpreadsheet,
  FileType,
  Plus,
  RotateCcw,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnFilterMenu, type ColumnFilterState } from "./column-filter-menu";
import type { MasterColumn } from "@/lib/navigation";

export type MasterTab = { label: string; href: string; active: boolean };

type EmptyDataTableProps = {
  /** Page title, rendered inside the card next to the export/Add New buttons (confirmed placement from the reference recording — not a separate PageHeader title above the tabs). */
  title: string;
  columns: MasterColumn[];
  /** "Manage and view all zone master in the system" — shown under the title. */
  subtitle?: string;
  /** Sibling masters in the same group, rendered as pills above the card (e.g. Zone/State/District/...). */
  tabs?: MasterTab[];
  /** Real reference rows, keyed by column `key`. Omit to keep the original all-empty placeholder behavior. */
  rows?: Record<string, ReactNode>[];
  /** Real total row count for the pagination footer, when it differs from `rows.length` (a partial first page). */
  totalCount?: number;
};

/**
 * The list-page shell repeated across nearly every master and form screen:
 * tabs above a card, then inside the card a title+export-buttons row, a
 * search/date-filter row, and the table. This exact ordering (tabs before
 * the card; title sharing a row with PDF/Excel/Word/Add New; search+dates
 * as their own row below that) was confirmed pixel-for-pixel against the
 * reference recording — do not reorder without re-checking the video.
 *
 * Most masters have no data source wired up yet (Step 3 of the build), so
 * they render the real empty state — "Showing 0-0 of 0" — rather than
 * fabricated rows. A handful of Basic Masters (Zone/State/District/Host/KVK)
 * pass real reference rows via `rows`; everything else keeps the original
 * empty behavior. Search/date inputs are live pieces of UI state; export,
 * "Add New", row actions, and the per-column filter icon are presentational
 * until the database step lands.
 */
export function EmptyDataTable({
  title,
  columns,
  subtitle,
  tabs,
  rows,
  totalCount,
}: EmptyDataTableProps) {
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, ColumnFilterState>>({});

  const hasActiveDates = fromDate !== "" || toDate !== "";
  const hasActiveColumnFilters = Object.values(columnFilters).some(
    (state) => state.sort !== null || state.selected !== null
  );
  const hasActiveFilters = hasActiveDates || search !== "" || hasActiveColumnFilters;

  function resetDates() {
    setFromDate("");
    setToDate("");
  }

  function resetFilters() {
    setSearch("");
    setFromDate("");
    setToDate("");
    setColumnFilters({});
  }

  /** Distinct values (with counts) for a column, sourced from the real rows passed in — matches the reference's per-column "Unique Values" checklist. */
  function columnValues(key: string): { value: string; count: number }[] {
    if (!rows) return [];
    const counts = new Map<string, number>();
    for (const row of rows) {
      const value = String(row[key] ?? "");
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return Array.from(counts, ([value, count]) => ({ value, count })).sort((a, b) =>
      a.value.localeCompare(b.value)
    );
  }

  const displayedRows = useMemo(() => {
    if (!rows) return rows;
    let next = rows.filter((row) =>
      Object.entries(columnFilters).every(([key, state]) => {
        if (state.selected === null) return true;
        return state.selected.has(String(row[key] ?? ""));
      })
    );
    const sortEntry = Object.entries(columnFilters).find(([, state]) => state.sort !== null);
    if (sortEntry) {
      const [key, state] = sortEntry;
      next = [...next].sort((a, b) => {
        const cmp = String(a[key] ?? "").localeCompare(String(b[key] ?? ""));
        return state.sort === "desc" ? -cmp : cmp;
      });
    }
    return next;
  }, [rows, columnFilters]);

  const rowCount = displayedRows?.length ?? 0;
  const total = totalCount ?? rows?.length ?? 0;

  return (
    <div>
      {tabs && tabs.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-1 rounded-lg bg-primary p-1">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                tab.active
                  ? "bg-white text-primary"
                  : "text-primary-foreground/85 hover:text-primary-foreground"
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-border bg-card">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <FileDown className="size-3.5" />
              PDF
            </Button>
            <Button variant="outline" size="sm">
              <FileSpreadsheet className="size-3.5" />
              Excel
            </Button>
            <Button variant="outline" size="sm">
              <FileType className="size-3.5" />
              Word
            </Button>
            <Button size="sm">
              <Plus className="size-3.5" />
              Add New
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search..."
              className="w-56 pl-8"
            />
          </div>
          <Input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="w-40 text-muted-foreground"
          />
          <Input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            className="w-40 text-muted-foreground"
          />
          <Button variant="secondary" size="sm" onClick={resetDates} disabled={!hasActiveDates}>
            <RotateCcw className="size-3.5" />
            Reset dates
          </Button>
          <Button variant="ghost" size="sm" onClick={resetFilters} disabled={!hasActiveFilters}>
            <RotateCcw className="size-3.5" />
            Reset filters
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <th className="w-14 px-4 py-3">S.No</th>
                {columns.map((column) => (
                  <th key={column.key} className="px-4 py-3">
                    <span className="inline-flex items-center gap-1">
                      {column.label}
                      <ColumnFilterMenu
                        columnLabel={column.label}
                        values={columnValues(column.key)}
                        state={columnFilters[column.key] ?? { selected: null, sort: null }}
                        onApply={(state) =>
                          setColumnFilters((prev) => ({ ...prev, [column.key]: state }))
                        }
                      />
                    </span>
                  </th>
                ))}
                <th className="w-20 px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rowCount === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} className="px-4 py-16 text-center text-muted-foreground">
                    No records found.
                  </td>
                </tr>
              ) : (
                displayedRows!.map((row, index) => (
                  <tr key={index} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-3 text-foreground">
                        {row[column.key]}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-sm">
                              <MoreVertical className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Pencil className="size-3.5" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive">
                            <Trash2 className="size-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
          <span>
            {rowCount === 0 ? "Showing 0-0 of 0" : `Showing 1-${rowCount} of ${total}`}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Prev
            </Button>
            <Button variant="outline" size="sm" disabled={total <= rowCount}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
