"use client";

import { type ReactNode, useId, useMemo, useRef, useState } from "react";
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
  GripVertical,
  ArrowRightCircle,
  ClipboardCheck,
} from "lucide-react";
import type { SidebarIconName } from "@/lib/navigation";
import { SIDEBAR_ICONS } from "@/components/layout/sidebar-icons";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/session";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ColumnFilterMenu, type ColumnFilterState } from "./column-filter-menu";
import { downloadTablePdf } from "@/lib/table-pdf";
import type { MasterColumn } from "@/lib/navigation";
import {
  CfldTechnicalParameterDialog,
  type TabName as CfldTabName,
} from "./cfld-technical-parameter-dialog";
import { EventDemographicDialog } from "./event-demographic-dialog";
import { MasterFormFields } from "./master-form-fields";

export type MasterTab = { label: string; href: string; active: boolean };

type EmptyDataTableProps = {
  /** Page title, rendered inside the card next to the export/Add New buttons (confirmed placement from the reference - not a separate PageHeader title above the tabs). */
  title: string;
  /**
   * Module icon shown next to the title, matching the section's sidebar
   * icon (client request: every module heading needs a relevant icon).
   * Taken as a name rather than the icon component itself - this renders
   * from Server Component pages (masters/[...slug], forms/[...slug]), and a
   * component reference isn't serializable across that RSC boundary into
   * this Client Component (same reasoning as SidebarTopLink's iconName).
   */
  icon?: SidebarIconName;
  columns: MasterColumn[];
  /** "Manage and view all zone master in the system" - shown under the title. */
  subtitle?: string;
  /** Sibling leaves in the same group, rendered as pills above the card (e.g. Zone/State/District/... in All Masters, DRMR Details/DRMR Activity in Form Management). */
  tabs?: MasterTab[];
  /** Real reference rows, keyed by column `key`. Omit to keep the original all-empty placeholder behavior. */
  rows?: Record<string, ReactNode>[];
  /** Real total row count for the pagination footer, when it differs from `rows.length` (a partial first page). */
  totalCount?: number;
  /**
   * Real cascading-dropdown behaviour confirmed for a couple of Basic
   * Masters' Add New forms (District Master, KVK Master both cascade
   * Zone -> State ->... in the reference) - turns the matching columns
   * (zoneName/stateName/hostOrg) into dependent selects reusing the same
   * Zone/State/Host-Org data Reports already draws from, instead of the
   * generic plain-text field every other leaf gets.
   */
  cascadeType?: "district" | "kvk";
  /** When set, Add New/Edit open a bespoke dialog instead of the generic per-column form - for the handful of leaves whose real Add/Edit shape genuinely isn't a flat field list (CFLD's 4-tab wizard, and the event forms carrying the recurring demographic-breakdown block). */
  customForm?: "cfld-technical-parameter" | "event-demographic";
  /** Leaf slug for the "event-demographic" customForm, so it can render the right leaf-specific fields (e.g. Technology Week Celebration's confirmed Start/End Date + activity fields vs the generic fallback). */
  eventSlug?: string;
  /**
   * When set, "Add New" navigates here instead of opening the dialog - per
   * client direction (2026-08-24), every leaf's Add New now opens a
   * dedicated page rather than a popup, matching the reference's own Add
   * screens (which are always full pages with a Back button, never a
   * modal). Editing an existing row still uses the dialog either way (not
   * part of that request).
   */
  addNewHref?: string;
  /** Targets/Notifications already have their own dedicated inline "Assign"/"Send" panel above the table - the generic Add New button would just duplicate that with unrelated fields, so it's hidden there instead of getting a pointless page of its own. */
  hideAddNew?: boolean;
  /**
   * View OFT / View FLD only (client pointer, 2026-08-24): rows carry a
   * "status" value ("Ongoing" | "Completed" | "Transferred to Next Year"),
   * rendered as a colored badge instead of plain text, and the row Action
   * dropdown gains Transfer (only while Ongoing - the client's spec: once
   * Completed or already Transferred, Transfer stops appearing so a record
   * can't be transferred twice) and Add Result alongside Edit/Delete. Per
   * the same spec ("only valid for KVKs not superadmin"), a Super Admin
   * gets a read-only Action column instead - no dropdown.
   */
  oftFldStatus?: boolean;
  /** Shown as a note banner above the table - e.g. OFT/FLD's "mark your result as Completed" instruction. */
  note?: string;
};

const STATUS_BADGE_STYLES: Record<string, string> = {
  Ongoing: "bg-[#eaa624]/15 text-[#b5790a] border-[#eaa624]/40",
  Completed: "bg-primary/10 text-primary border-primary/30",
  "Transferred to Next Year":
    "bg-muted text-muted-foreground border-border",
};

/**
 * The list-page shell repeated across nearly every master and form screen:
 * tabs above a card, then inside the card a title+export-buttons row, a
 * search/date-filter row, and the table. This exact ordering (tabs before
 * the card; title sharing a row with PDF/Excel/Word/Add New; search+dates
 * as their own row below that) was confirmed pixel-for-pixel against the
 * reference - do not reorder without re-checking the video.
 *
 * Most masters have no data source wired up yet (Step 3 of the build), so
 * they render the real empty state - "Showing 0-0 of 0" - rather than
 * fabricated rows. A handful of Basic Masters (Zone/State/District/Host/KVK)
 * pass real reference rows via `rows`; everything else keeps the original
 * empty behavior. Search/date inputs are live pieces of UI state; export,
 * "Add New", row actions, and the per-column filter icon are presentational
 * until the database step lands.
 */

export function EmptyDataTable({
  title,
  icon,
  columns,
  subtitle,
  tabs,
  rows,
  totalCount,
  cascadeType,
  customForm,
  eventSlug,
  addNewHref,
  hideAddNew,
  oftFldStatus,
  note,
}: EmptyDataTableProps) {
  const session = useSession();
  const isSuperAdmin = session.role === "super-admin";
  const Icon = icon ? SIDEBAR_ICONS[icon] : undefined;
  /** Unique per instance - a page can render more than one EmptyDataTable (e.g. Notifications' Received + Sent tables), and duplicate ids break label association. */
  const instanceId = useId();
  const fromDateId = `${instanceId}-from-date`;
  const toDateId = `${instanceId}-to-date`;
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  /** OFT/FLD only - defaults to the current year, per the client's "display current year's data first by default" note. */
  const [reportingYear, setReportingYear] = useState(() =>
    String(new Date().getFullYear()),
  );
  const reportingYearOptions = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) =>
        String(new Date().getFullYear() - index),
      ),
    [],
  );
  const [columnFilters, setColumnFilters] = useState<
    Record<string, ColumnFilterState>
  >({});

  /**
   * The search/date-filter bar can be dragged and repositioned by the user
   * (client request: "sorting/filter box should be movable"), via a grip
   * handle. Position is plain in-memory offset state - resets on
   * navigation/refresh, same as every other Phase 1 UI-only interaction;
   * persisting a chosen layout across sessions needs the backend.
   */
  const [filterBarOffset, setFilterBarOffset] = useState({ x: 0, y: 0 });
  const dragState = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  function handleFilterBarDragStart(
    event: React.PointerEvent<HTMLButtonElement>,
  ) {
    event.preventDefault();
    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: filterBarOffset.x,
      originY: filterBarOffset.y,
    };
    window.addEventListener("pointermove", handleFilterBarDragMove);
    window.addEventListener("pointerup", handleFilterBarDragEnd);
  }

  function handleFilterBarDragMove(event: PointerEvent) {
    if (!dragState.current) return;
    setFilterBarOffset({
      x: dragState.current.originX + (event.clientX - dragState.current.startX),
      y: dragState.current.originY + (event.clientY - dragState.current.startY),
    });
  }

  function handleFilterBarDragEnd() {
    dragState.current = null;
    window.removeEventListener("pointermove", handleFilterBarDragMove);
    window.removeEventListener("pointerup", handleFilterBarDragEnd);
  }

  const [formOpen, setFormOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Record<
    string,
    ReactNode
  > | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [markAsOther, setMarkAsOther] = useState(false);
  const [deleteRow, setDeleteRow] = useState<Record<string, ReactNode> | null>(
    null,
  );
  const [transferRow, setTransferRow] = useState<Record<
    string,
    ReactNode
  > | null>(null);
  /** CFLD Technical Parameter only - which tab to land on when the dialog opens from a direct Action-dropdown shortcut (Edit/Economic/Socio-Economic/Farmers Perception). */
  const [cfldInitialTab, setCfldInitialTab] = useState<CfldTabName>();
  const isCfldTechnicalParameter = customForm === "cfld-technical-parameter";
  const [resultRow, setResultRow] = useState<Record<string, ReactNode> | null>(
    null,
  );

  /** Real confirmed pattern for every "simple" single-Name master (Subject, Funding Source, Asset Funding Source, NARI Nutrition Garden Type, Pay Scale, TSP/SCSP Activity, and every other single-column master sharing this exact shape): the real Create form is one Name field plus a "Mark as 'Other' option" checkbox. */
  const isSimpleMaster = columns.length === 1 && columns[0].key === "name";

  const hasActiveDates = fromDate !== "" || toDate !== "";
  const hasActiveColumnFilters = Object.values(columnFilters).some(
    (state) => state.sort !== null || state.selected !== null,
  );
  const hasActiveFilters =
    hasActiveDates || search !== "" || hasActiveColumnFilters;

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

  /**
   * Add/Edit form is generated from `columns` - one text field per confirmed
   * field name, since this phase has no backend to persist to and the real
   * input widget for each field (select vs text vs date, which are
   * required) isn't confirmed per-leaf across all ~40 Form Management
   * pages. Matches the rest of this app's Phase 1 convention: a real,
   * working dialog that doesn't invent field types it can't confirm.
   */
  function openAdd() {
    setEditingRow(null);
    setFormValues({});
    setMarkAsOther(false);
    setCfldInitialTab(undefined);
    setFormOpen(true);
  }

  function openEdit(row: Record<string, ReactNode>, tab?: CfldTabName) {
    const values: Record<string, string> = {};
    for (const column of columns) {
      const value = row[column.key];
      values[column.key] =
        typeof value === "string" || typeof value === "number"
          ? String(value)
          : "";
    }
    setEditingRow(row);
    setFormValues(values);
    setMarkAsOther(false);
    setCfldInitialTab(tab);
    setFormOpen(true);
  }

  function submitForm() {
    setFormOpen(false);
  }

  const deleteRowLabel =
    deleteRow && columns[0] && typeof deleteRow[columns[0].key] === "string"
      ? (deleteRow[columns[0].key] as string)
      : "this record";

  /** Distinct values (with counts) for a column, sourced from the real rows passed in - matches the reference's per-column "Unique Values" checklist. */
  function columnValues(key: string): { value: string; count: number }[] {
    if (!rows) return [];
    const counts = new Map<string, number>();
    for (const row of rows) {
      const value = String(row[key] ?? "");
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return Array.from(counts, ([value, count]) => ({ value, count })).sort(
      (a, b) => a.value.localeCompare(b.value),
    );
  }

  const filteredRows = useMemo(() => {
    if (!rows) return rows;
    let next = rows.filter((row) =>
      Object.entries(columnFilters).every(([key, state]) => {
        if (state.selected === null) return true;
        return state.selected.has(String(row[key] ?? ""));
      }),
    );
    const sortEntry = Object.entries(columnFilters).find(
      ([, state]) => state.sort !== null,
    );
    if (sortEntry) {
      const [key, state] = sortEntry;
      next = [...next].sort((a, b) => {
        const cmp = String(a[key] ?? "").localeCompare(String(b[key] ?? ""));
        return state.sort === "desc" ? -cmp : cmp;
      });
    }
    return next;
  }, [rows, columnFilters]);

  /**
   * 10 rows per page, matching the reference's own "Showing 1-10 of N"
   * footer - resets to page 1 whenever the filtered set changes so a stale
   * page number never points past the end. Reset happens during render
   * (React's documented pattern for "adjusting state when a prop changes")
   * rather than in a useEffect, which would cause an extra render pass.
   */
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const [prevFilteredRows, setPrevFilteredRows] = useState(filteredRows);
  if (filteredRows !== prevFilteredRows) {
    setPrevFilteredRows(filteredRows);
    setPage(1);
  }
  const filteredCount = filteredRows?.length ?? 0;
  const pageCount = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);

  const displayedRows = useMemo(() => {
    if (!filteredRows) return filteredRows;
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, currentPage]);

  const rowCount = displayedRows?.length ?? 0;
  const total = totalCount ?? filteredCount;
  const rangeStart = filteredCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = filteredCount === 0 ? 0 : rangeStart + rowCount - 1;

  return (
    <div>
      {tabs && tabs.length > 1 ? (
        <div className="mb-4 inline-flex flex-wrap gap-1 rounded-lg bg-primary p-1">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                tab.active
                  ? "bg-white text-primary"
                  : "text-primary-foreground/85 hover:text-primary-foreground",
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="rounded-lg border border-border bg-card">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-4">
          <div>
            <div className="flex items-center gap-2">
              {Icon && <Icon className="size-4.5 shrink-0 text-primary" />}
              <h1 className="text-lg font-semibold text-primary">{title}</h1>
            </div>
            {subtitle && (
              <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() => downloadTablePdf(title, columns, displayedRows)}
            >
              <FileDown className="size-3.5" />
              PDF
            </Button>
            <Button variant="outline" size="lg">
              <FileSpreadsheet className="size-3.5" />
              Excel
            </Button>
            <Button variant="outline" size="lg">
              <FileType className="size-3.5" />
              Word
            </Button>
            {hideAddNew ? null : addNewHref ? (
              <Link
                href={addNewHref}
                className={cn(buttonVariants({ size: "lg" }))}
              >
                <Plus className="size-3.5" />
                Add New
              </Link>
            ) : (
              <Button size="lg" onClick={openAdd}>
                <Plus className="size-3.5" />
                Add New
              </Button>
            )}
          </div>
        </div>

        <div
          className="relative z-10 flex flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-5"
          style={
            filterBarOffset.x !== 0 || filterBarOffset.y !== 0
              ? {
                  transform: `translate(${filterBarOffset.x}px, ${filterBarOffset.y}px)`,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                }
              : undefined
          }
        >
          <button
            type="button"
            onPointerDown={handleFilterBarDragStart}
            onDoubleClick={() => setFilterBarOffset({ x: 0, y: 0 })}
            title="Drag to reposition - double-click to reset"
            className="flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
          >
            <GripVertical className="size-4" />
          </button>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search..."
              className="h-9 w-56 pl-8"
            />
          </div>
          {oftFldStatus ? (
            <div className="flex items-center gap-1.5">
              <Label
                htmlFor={fromDateId}
                className="text-xs text-muted-foreground"
              >
                Reporting Year
              </Label>
              <select
                id={fromDateId}
                value={reportingYear}
                onChange={(event) => setReportingYear(event.target.value)}
                className="h-9 rounded-md border border-border bg-card px-2 text-sm text-foreground outline-none focus-visible:border-ring"
              >
                {reportingYearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <Label
                  htmlFor={fromDateId}
                  className="text-xs text-muted-foreground"
                >
                  From Date
                </Label>
                <Input
                  id={fromDateId}
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                  className="h-9 w-40 text-muted-foreground"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <Label
                  htmlFor={toDateId}
                  className="text-xs text-muted-foreground"
                >
                  To Date
                </Label>
                <Input
                  id={toDateId}
                  type="date"
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                  className="h-9 w-40 text-muted-foreground"
                />
              </div>
              <Button
                variant="default"
                size="lg"
                onClick={resetDates}
                disabled={!hasActiveDates}
              >
                <RotateCcw className="size-3.5" />
                Reset dates
              </Button>
            </>
          )}
          <Button
            variant="outline-primary"
            size="lg"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
          >
            <RotateCcw className="size-3.5" />
            Reset filters
          </Button>
        </div>

        {note && (
          <p className="border-b border-border bg-primary/5 px-4 py-2.5 text-xs font-medium text-primary">
            {note}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="divide-x divide-border border-b border-border bg-muted/50 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-muted-foreground uppercase">
                <th className="w-14 px-4 py-3">S.No</th>
                {columns.map((column) => (
                  <th key={column.key} className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">
                      {column.label}
                      <ColumnFilterMenu
                        columnLabel={column.label}
                        values={columnValues(column.key)}
                        state={
                          columnFilters[column.key] ?? {
                            selected: null,
                            sort: null,
                          }
                        }
                        onApply={(state) =>
                          setColumnFilters((prev) => ({
                            ...prev,
                            [column.key]: state,
                          }))
                        }
                      />
                    </span>
                  </th>
                ))}
                <th className="w-20 px-4 py-3 text-right">
                  {oftFldStatus && isSuperAdmin ? "" : "Action"}
                </th>
              </tr>
            </thead>
            <tbody>
              {rowCount === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="px-4 py-16 text-center text-muted-foreground"
                  >
                    No records found.
                  </td>
                </tr>
              ) : (
                displayedRows!.map((row, index) => (
                  <tr
                    key={index}
                    className="divide-x divide-border border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 align-top text-muted-foreground">
                      {index + 1}
                    </td>
                    {columns.map((column) => {
                      const value = row[column.key];
                      if (
                        (oftFldStatus || isCfldTechnicalParameter) &&
                        column.key === "status"
                      ) {
                        const label = typeof value === "string" ? value : "";
                        return (
                          <td key={column.key} className="px-4 py-3 align-top">
                            <span
                              className={cn(
                                "inline-block rounded-md border px-2 py-0.5 text-xs font-semibold",
                                STATUS_BADGE_STYLES[label] ??
                                  "border-border text-muted-foreground",
                              )}
                            >
                              {label}
                            </span>
                          </td>
                        );
                      }
                      return (
                        <td
                          key={column.key}
                          className="px-4 py-3 align-top text-foreground"
                        >
                          {typeof value === "string" ? (
                            <span
                              className="line-clamp-2 max-w-xs"
                              title={value}
                            >
                              {value}
                            </span>
                          ) : (
                            value
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-right align-top">
                      {oftFldStatus && isSuperAdmin ? null : (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="ghost" size="icon-sm">
                                <MoreVertical className="size-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(row)}>
                              <Pencil className="size-3.5" />
                              Edit
                            </DropdownMenuItem>
                            {oftFldStatus && (
                              <>
                                {row.status === "Ongoing" && (
                                  <DropdownMenuItem
                                    onClick={() => setTransferRow(row)}
                                  >
                                    <ArrowRightCircle className="size-3.5" />
                                    Transfer
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => setResultRow(row)}
                                >
                                  <ClipboardCheck className="size-3.5" />
                                  Add Result
                                </DropdownMenuItem>
                              </>
                            )}
                            {isCfldTechnicalParameter && (
                              <>
                                {row.status === "Ongoing" && (
                                  <DropdownMenuItem
                                    onClick={() => setTransferRow(row)}
                                  >
                                    <ArrowRightCircle className="size-3.5" />
                                    Transfer
                                  </DropdownMenuItem>
                                )}
                                {/* Delete sits here (not trailing) to match the real reference's exact dropdown order: Edit, Transfer, Delete, Economic parameters, Socio-economic impact parameters, Farmer's perception. */}
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => setDeleteRow(row)}
                                >
                                  <Trash2 className="size-3.5" />
                                  Delete
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    openEdit(row, "Economic Parameters")
                                  }
                                >
                                  <ClipboardCheck className="size-3.5" />
                                  Economic Parameters
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    openEdit(
                                      row,
                                      "Socio Economic Parameters",
                                    )
                                  }
                                >
                                  <ClipboardCheck className="size-3.5" />
                                  Socio-economic Impact Parameters
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    openEdit(row, "Farmers Perception")
                                  }
                                >
                                  <ClipboardCheck className="size-3.5" />
                                  Farmer&rsquo;s Perception
                                </DropdownMenuItem>
                              </>
                            )}
                            {!isCfldTechnicalParameter && (
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleteRow(row)}
                              >
                                <Trash2 className="size-3.5" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
          <span>
            {rowCount === 0
              ? "Showing 0-0 of 0"
              : `Showing ${rangeStart}-${rangeEnd} of ${total}`}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Add / Edit */}
      {customForm === "cfld-technical-parameter" ? (
        <CfldTechnicalParameterDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          editingRow={editingRow}
          initialTab={cfldInitialTab}
        />
      ) : customForm === "event-demographic" ? (
        <EventDemographicDialog
          title={title}
          slug={eventSlug}
          open={formOpen}
          onOpenChange={setFormOpen}
          editingRow={editingRow}
        />
      ) : (
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingRow ? `Edit ${title}` : `Add ${title}`}
              </DialogTitle>
            </DialogHeader>

            <div className="max-h-[60vh] space-y-4 overflow-y-auto">
              <MasterFormFields
                columns={columns}
                cascadeType={cascadeType}
                formValues={formValues}
                onChange={setFormValues}
                isSimpleMaster={isSimpleMaster}
                markAsOther={markAsOther}
                onMarkAsOtherChange={setMarkAsOther}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitForm}>
                {editingRow ? "Save Changes" : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete confirm */}
      <AlertDialog
        open={deleteRow !== null}
        onOpenChange={(open) => !open && setDeleteRow(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleteRowLabel}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the record. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => setDeleteRow(null)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Transfer to next reporting year - OFT/FLD and CFLD Technical Parameter, manual per client spec (never automatic). */}
      {(oftFldStatus || isCfldTechnicalParameter) && (
        <AlertDialog
          open={transferRow !== null}
          onOpenChange={(open) => !open && setTransferRow(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Transfer to next reporting year?</AlertDialogTitle>
              <AlertDialogDescription>
                This record stays visible in its original reporting year,
                marked &ldquo;Transferred to Next Year&rdquo;. A copy opens
                under next year&rsquo;s reporting year with status
                &ldquo;Ongoing&rdquo;.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => setTransferRow(null)}>
                Transfer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Add Result - OFT/FLD only; saving a result is how a record moves from Ongoing to Completed. */}
      {oftFldStatus && (
        <Dialog
          open={resultRow !== null}
          onOpenChange={(open) => !open && setResultRow(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Result</DialogTitle>
            </DialogHeader>
            <div className="space-y-1.5">
              <Label htmlFor="result-notes">Result / Outcome</Label>
              <textarea
                id="result-notes"
                rows={4}
                placeholder="Describe the outcome of this trial/demonstration"
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResultRow(null)}>
                Cancel
              </Button>
              <Button onClick={() => setResultRow(null)}>
                Mark as Completed
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
