"use client";

import { useState } from "react";
import { Search, FileDown, FileSpreadsheet, FileType, Plus, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { MasterColumn } from "@/lib/navigation";

type EmptyDataTableProps = {
  columns: MasterColumn[];
};

/**
 * The list-page shell repeated across nearly every master and form screen:
 * search + date range + export actions + a table.
 *
 * There is no data source wired up yet (Step 3 of the build), so this
 * always renders the real empty state — "Showing 0-0 of 0" — rather than
 * fabricated rows. Search/date inputs are live pieces of UI state; export
 * and "Add New" are presentational until the database step lands.
 */
export function EmptyDataTable({ columns }: EmptyDataTableProps) {
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const hasActiveDates = fromDate !== "" || toDate !== "";

  function resetDates() {
    setFromDate("");
    setToDate("");
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <div className="flex flex-wrap items-center gap-2">
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

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <th className="w-14 px-4 py-3">S.No</th>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3">
                  {column.label}
                </th>
              ))}
              <th className="w-20 px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={columns.length + 2} className="px-4 py-16 text-center text-muted-foreground">
                No records found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
        <span>Showing 0-0 of 0</span>
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
  );
}
