"use client";

import { type ReactNode, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  FileDown,
  FileSpreadsheet,
  FileType,
  Filter,
  Plus,
  RotateCcw,
  MoreVertical,
  Pencil,
  Trash2,
  ArrowRightCircle,
  ClipboardCheck,
  ImageIcon,
  FileText,
  AlertTriangle,
  GripVertical,
} from "lucide-react";
import type { SidebarIconName } from "@/lib/navigation";
import { SIDEBAR_ICONS } from "@/components/layout/sidebar-icons";
import { cn, downloadBlob } from "@/lib/utils";
import { useSession } from "@/lib/session";
import { Input } from "@/components/ui/input";
import { SimpleSelect } from "@/components/ui/simple-select";
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
import type { MasterColumn } from "@/lib/navigation";
import {
  CfldTechnicalParameterDialog,
  type TabName as CfldTabName,
} from "./cfld-technical-parameter-dialog";
import { EventDemographicDialog } from "./event-demographic-dialog";
import { FldResultDialog } from "./fld-result-dialog";
import { MasterFormFields, DEMOGRAPHIC_KEYS, prefixedDemographicKey } from "./master-form-fields";

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
  cascadeType?: "district" | "kvk" | "institute";
  /** Overrides the Edit dialog's "Mark as Other" checkbox visibility when confirmed against the real reference (lib/navigation.ts's NavLeaf.showMarkAsOther) - falls back to the single-"name"-column heuristic below when unset. Edit reuses the same field set as the real Create screen for a given master. */
  showMarkAsOther?: boolean;
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
  /** Which real "Add/Edit Result" dialog Add Result opens - "fld" (real, wired to /api/fld-result) or "oft" (still the placeholder textarea pending its own real dynamic-table result feature). Only meaningful when oftFldStatus is true. */
  resultKind?: "oft" | "fld";
  /** Shown as a note banner above the table - e.g. OFT/FLD's "mark your result as Completed" instruction. */
  note?: string;
  /** Registry key in lib/leaf-record-registry.ts (Form Management) or lib/masters-registry.ts (All Masters) - enables real Edit/Delete for this leaf's rows. Omit for leaves not wired to the database yet. For recordKind "notification" this is just a truthy sentinel (the row's own `id` drives the real /api/notifications/[id] URL, not a registry path). */
  recordPath?: string;
  /** Which registry/endpoint `recordPath` refers to - "form" (default, KVK-scoped Form Management leaves), "master" (zone-scoped, Super Admin only, All Masters leaves), or "notification" (Notifications page's Sent/Received tables, /api/notifications/[id]). */
  recordKind?: "form" | "master" | "notification";
  /** Restricts the Edit dialog to only these column keys (Notifications: title/message only - recipient/from/sentOn are derived/read-only, not real editable fields). Omit to edit every column, the default for every other leaf. */
  editableColumnKeys?: string[];
  /**
   * Called after a successful Edit or Delete, in addition to the usual
   * `router.refresh()`. Most callers get their `rows` from a Server
   * Component (Masters/Form Management), where `router.refresh()` alone
   * re-fetches everything - but a page like Notifications loads its rows
   * itself via a client-side `useEffect` + `fetch`, which `router.refresh()`
   * never re-runs, so the deleted/edited row silently stayed on screen
   * until a real page reload. Pass the page's own re-fetch function here to
   * fix that for any client-fetched caller.
   */
  onMutated?: () => void;
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
  showMarkAsOther,
  customForm,
  eventSlug,
  addNewHref,
  hideAddNew,
  oftFldStatus,
  resultKind,
  note,
  recordPath,
  recordKind = "form",
  editableColumnKeys,
  onMutated,
}: EmptyDataTableProps) {
  const session = useSession();
  const router = useRouter();
  const isSuperAdmin = session.role === "super-admin";
  /** Every list table gets a real Action column (Edit/Delete) regardless of role, matching every other leaf in the app - Transfer/Add Result specifically stay KVK-only below (transferring or marking a trial's own result isn't a Super Admin action), but that no longer means hiding Edit/Delete from Super Admin too. */
  const showActionColumn = true;
  /** `columns` includes any `formOnly` entries (demographic-breakdown blocks) needed by the Add/Edit form below - the list table itself only ever renders real, single-value columns, so every table concern (header, rows, colSpan, exports) uses this filtered list instead. */
  const tableColumns = columns.filter((c) => !c.formOnly);
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
   * Movable columns (client request, 2026-08-25): drag a header by its grip
   * to reorder it. Order is tracked as a list of keys, separate from
   * `columns` itself, so the confirmed real column definitions never
   * mutate - only their on-screen order does. Resets whenever the leaf
   * changes (a different `columns` array arrives) rather than carrying a
   * stale order from a previous table into a new one.
   */
  const [columnOrder, setColumnOrder] = useState(() => tableColumns.map((c) => c.key));
  const columnKeySignature = tableColumns.map((c) => c.key).join("|");
  const [lastColumnKeySignature, setLastColumnKeySignature] = useState(columnKeySignature);
  if (columnKeySignature !== lastColumnKeySignature) {
    setLastColumnKeySignature(columnKeySignature);
    setColumnOrder(tableColumns.map((c) => c.key));
  }
  const orderedColumns = columnOrder
    .map((key) => tableColumns.find((c) => c.key === key))
    .filter((c): c is MasterColumn => c !== undefined);
  const draggedColumnKey = useRef<string | null>(null);
  const [dragOverColumnKey, setDragOverColumnKey] = useState<string | null>(null);

  function moveColumn(targetKey: string) {
    const draggedKey = draggedColumnKey.current;
    if (!draggedKey || draggedKey === targetKey) return;
    setColumnOrder((prev) => {
      const next = prev.filter((k) => k !== draggedKey);
      const targetIndex = next.indexOf(targetKey);
      next.splice(targetIndex, 0, draggedKey);
      return next;
    });
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
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    const id = deleteRow?.id;
    if (!recordPath || typeof id !== "string") {
      setDeleteRow(null);
      return;
    }
    setDeleteError(null);
    setDeleting(true);
    try {
      const response =
        recordKind === "notification"
          ? await fetch(`/api/notifications/${id}`, { method: "DELETE" })
          : await fetch(recordKind === "master" ? "/api/master-record/delete" : "/api/leaf-record/delete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ path: recordPath, id }),
            });
      const data = await response.json();
      if (!response.ok) {
        setDeleteError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDeleteRow(null);
      router.refresh();
      onMutated?.();
    } catch {
      setDeleteError("Could not reach the server. Please try again.");
    } finally {
      setDeleting(false);
    }
  }
  const [transferRow, setTransferRow] = useState<Record<
    string,
    ReactNode
  > | null>(null);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferring, setTransferring] = useState(false);

  async function confirmTransfer() {
    const id = transferRow?.id;
    if (!recordPath || typeof id !== "string") {
      setTransferRow(null);
      return;
    }
    setTransferError(null);
    setTransferring(true);
    try {
      const response = await fetch("/api/leaf-record/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: recordPath, id }),
      });
      const data = await response.json();
      if (!response.ok) {
        setTransferError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setTransferRow(null);
      router.refresh();
    } catch {
      setTransferError("Could not reach the server. Please try again.");
    } finally {
      setTransferring(false);
    }
  }
  /** CFLD Technical Parameter only - which tab to land on when the dialog opens from a direct Action-dropdown shortcut (Edit/Economic/Socio-Economic/Farmers Perception). */
  const [cfldInitialTab, setCfldInitialTab] = useState<CfldTabName>();
  const isCfldTechnicalParameter = customForm === "cfld-technical-parameter";
  const [resultRow, setResultRow] = useState<Record<string, ReactNode> | null>(
    null,
  );

  /** Real confirmed pattern for every "simple" single-Name master (Subject, Funding Source, Asset Funding Source, NARI Nutrition Garden Type, Pay Scale, TSP/SCSP Activity, and every other single-column master sharing this exact shape): the real Create form is one Name field plus a "Mark as 'Other' option" checkbox. */
  const isSimpleMaster =
    showMarkAsOther ?? (columns.length === 1 && columns[0].key === "name");

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
    setFormError(null);
    setFormOpen(true);
  }

  const editColumns = editableColumnKeys
    ? columns.filter((c) => editableColumnKeys.includes(c.key))
    : columns;

  function openEdit(row: Record<string, ReactNode>, tab?: CfldTabName) {
    const values: Record<string, string> = {};
    for (const column of editColumns) {
      if (column.fieldKind === "demographic-breakdown") {
        // Represents 8 real row fields (prefix + DEMOGRAPHIC_KEYS), not row[column.key] itself.
        const prefix = column.demographicPrefix ?? "";
        for (const suffix of DEMOGRAPHIC_KEYS) {
          const key = prefixedDemographicKey(prefix, suffix);
          const value = row[key];
          values[key] = typeof value === "string" || typeof value === "number" ? String(value) : "";
        }
        continue;
      }
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
    setFormError(null);
    setFormOpen(true);
  }

  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  async function submitForm() {
    const id = editingRow?.id;
    if (!recordPath || typeof id !== "string") {
      setFormOpen(false);
      return;
    }
    setFormError(null);
    setFormSubmitting(true);
    try {
      const response =
        recordKind === "notification"
          ? await fetch(`/api/notifications/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title: formValues.title, message: formValues.message }),
            })
          : await fetch(recordKind === "master" ? "/api/master-record/update" : "/api/leaf-record/update", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ path: recordPath, id, values: formValues }),
            });
      const data = await response.json();
      if (!response.ok) {
        setFormError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setFormOpen(false);
      router.refresh();
      onMutated?.();
    } catch {
      setFormError("Could not reach the server. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
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

  /** Every column whose key is a date field, by this schema's own consistent naming (startDate/endDate/dateOfVisit/activityDate/meetingDate/... always end in "Date", or the bare key "date") - used by the From/To Date range filter below, since which single column is "the" date varies per leaf and there's no one universal key. */
  const dateColumnKeys = useMemo(
    () => tableColumns.map((c) => c.key).filter((key) => key === "date" || /Date$/.test(key)),
    [tableColumns],
  );

  const filteredRows = useMemo(() => {
    if (!rows) return rows;
    const searchText = search.trim().toLowerCase();
    let next = rows.filter((row) => {
      if (searchText) {
        const matches = columns.some((c) =>
          String(row[c.key] ?? "").toLowerCase().includes(searchText),
        );
        if (!matches) return false;
      }
      if (oftFldStatus) {
        if (String(row.reportingYear ?? "") !== reportingYear) return false;
      } else if (hasActiveDates) {
        const inRange = dateColumnKeys.some((key) => {
          const raw = String(row[key] ?? "");
          if (!raw) return false;
          const value = raw.slice(0, 10);
          if (fromDate && value < fromDate) return false;
          if (toDate && value > toDate) return false;
          return true;
        });
        if (dateColumnKeys.length > 0 && !inRange) return false;
      }
      return Object.entries(columnFilters).every(([key, state]) => {
        if (state.selected === null) return true;
        return state.selected.has(String(row[key] ?? ""));
      });
    });
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
  }, [rows, columnFilters, search, columns, oftFldStatus, reportingYear, hasActiveDates, dateColumnKeys, fromDate, toDate]);

  /**
   * 10 rows per page, matching the reference's own "Showing 1-10 of N"
   * footer - resets to page 1 whenever the *filter criteria themselves*
   * change (typing a search, picking a column filter, a date range), not
   * whenever `filteredRows` merely gets a new array identity. AutoRefresh
   * (components/layout/auto-refresh.tsx) re-fetches `rows` from the server
   * every ~20s, which built a brand-new `filteredRows` array on every tick
   * regardless of whether anything actually changed - comparing that array
   * by reference was a real bug: search to page 300, wait 20s, and the
   * table silently snapped back to page 1 out from under the user. `page`
   * still gets clamped separately below if the real row count shrinks.
   * Reset happens during render (React's documented pattern for "adjusting
   * state when a prop changes") rather than in a useEffect, which would
   * cause an extra render pass.
   */
  const filterSignature = useMemo(
    () =>
      JSON.stringify({
        search: search.trim().toLowerCase(),
        columnFilters: Object.fromEntries(
          Object.entries(columnFilters).map(([key, state]) => [
            key,
            { selected: state.selected ? Array.from(state.selected).sort() : null, sort: state.sort },
          ]),
        ),
        oftFldStatus,
        reportingYear,
        hasActiveDates,
        fromDate,
        toDate,
      }),
    [search, columnFilters, oftFldStatus, reportingYear, hasActiveDates, fromDate, toDate],
  );
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const [prevFilterSignature, setPrevFilterSignature] = useState(filterSignature);
  if (filterSignature !== prevFilterSignature) {
    setPrevFilterSignature(filterSignature);
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
              onClick={async () => {
                // Lazy-loaded: jsPDF + autotable are large and only needed by
                // the handful of visits that actually click this button -
                // bundling them at module scope would ship their weight to
                // every single Masters/Form Management page load. Exports
                // every filtered row, not just the current on-screen page
                // (`displayedRows` is a pagination slice of `filteredRows` -
                // exporting that silently dropped every row past page 1).
                const { downloadTablePdf } = await import("@/lib/table-pdf");
                downloadTablePdf(title, tableColumns, filteredRows);
              }}
            >
              <FileDown className="size-3.5" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={async () => {
                const { generateTableExcel } = await import("@/lib/table-excel");
                const wb = await generateTableExcel(title, tableColumns, filteredRows);
                const buffer = await wb.xlsx.writeBuffer();
                downloadBlob(
                  new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
                  `${title}.xlsx`,
                );
              }}
            >
              <FileSpreadsheet className="size-3.5" />
              Excel
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={async () => {
                const { generateTableWord } = await import("@/lib/table-word");
                const blob = await generateTableWord(title, tableColumns, filteredRows);
                downloadBlob(blob, `${title}.docx`);
              }}
            >
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

        <div className="relative z-10 flex flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-5">
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
              <SimpleSelect
                id={fromDateId}
                value={reportingYear}
                onValueChange={setReportingYear}
                options={reportingYearOptions.map((year) => ({ value: year, label: year }))}
                className="w-28"
              />
            </div>
          ) : (
            <>
              <div className="relative">
                <Input
                  id={fromDateId}
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                  aria-label="From date"
                  className={cn(
                    "h-9 w-40",
                    fromDate ? "text-muted-foreground" : "text-transparent",
                  )}
                />
                {!fromDate && (
                  <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-sm text-muted-foreground">
                    From date
                  </span>
                )}
              </div>
              <div className="relative">
                <Input
                  id={toDateId}
                  type="date"
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                  aria-label="To date"
                  className={cn(
                    "h-9 w-40",
                    toDate ? "text-muted-foreground" : "text-transparent",
                  )}
                />
                {!toDate && (
                  <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-sm text-muted-foreground">
                    To date
                  </span>
                )}
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
            <Filter className="size-3.5" />
            Reset filters
          </Button>
        </div>

        {note && (
          <p className="flex items-center gap-2 border-b border-[#eaa624]/40 bg-[#eaa624]/15 px-4 py-2.5 text-xs font-semibold text-[#8a5a00]">
            <AlertTriangle className="size-4 shrink-0" />
            {note}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="divide-x divide-border border-b border-border bg-muted/50 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-muted-foreground uppercase">
                <th className="w-14 px-4 py-3">S.No</th>
                {orderedColumns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-4 py-3",
                      dragOverColumnKey === column.key && "bg-primary/10",
                    )}
                    draggable
                    onDragStart={() => {
                      draggedColumnKey.current = column.key;
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragOverColumnKey(column.key);
                    }}
                    onDragLeave={() =>
                      setDragOverColumnKey((prev) => (prev === column.key ? null : prev))
                    }
                    onDrop={(event) => {
                      event.preventDefault();
                      moveColumn(column.key);
                      draggedColumnKey.current = null;
                      setDragOverColumnKey(null);
                    }}
                    onDragEnd={() => {
                      draggedColumnKey.current = null;
                      setDragOverColumnKey(null);
                    }}
                  >
                    <span className="flex w-full cursor-move items-center justify-between gap-2 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <GripVertical className="size-3 shrink-0 text-muted-foreground/50" />
                        {column.label}
                      </span>
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
                {showActionColumn && (
                  <th className="w-20 px-4 py-3 text-right">Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {rowCount === 0 ? (
                <tr>
                  <td
                    colSpan={tableColumns.length + (showActionColumn ? 2 : 1)}
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
                    <td className="px-4 py-3.5 align-top text-muted-foreground">
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </td>
                    {orderedColumns.map((column) => {
                      const value = row[column.key];
                      if (
                        (oftFldStatus || isCfldTechnicalParameter) &&
                        column.key === "status"
                      ) {
                        const label = typeof value === "string" ? value : "";
                        return (
                          <td key={column.key} className="px-4 py-3.5 align-top">
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
                      if (column.fileKind) {
                        const url = typeof value === "string" ? value : "";
                        return (
                          <td key={column.key} className="px-4 py-3.5 align-top">
                            {url ? (
                              column.fileKind === "image" ? (
                                <a
                                  href={`/api/files/view?url=${encodeURIComponent(url)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block"
                                >
                                  {/* unoptimized: Next's image optimizer fetches this URL server-side and won't forward the browser's session cookie, but /api/files/view requires one - a plain browser-side request (which does carry it) is required here. */}
                                  <Image
                                    src={`/api/files/view?url=${encodeURIComponent(url)}`}
                                    alt={column.label}
                                    width={36}
                                    height={36}
                                    unoptimized
                                    className="size-9 rounded-md border border-border object-cover"
                                  />
                                </a>
                              ) : (
                                <a
                                  href={`/api/files/view?url=${encodeURIComponent(url)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-primary hover:underline"
                                >
                                  <FileText className="size-3.5" />
                                  View
                                </a>
                              )
                            ) : (
                              <span className="inline-flex items-center gap-1 text-muted-foreground">
                                <ImageIcon className="size-3.5" />-
                              </span>
                            )}
                          </td>
                        );
                      }
                      return (
                        <td
                          key={column.key}
                          className="px-4 py-3.5 align-top text-foreground"
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
                    {showActionColumn && (
                    <td className="px-4 py-3.5 text-right align-top">
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
                            {oftFldStatus && !isSuperAdmin && (
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
                    </td>
                    )}
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
                columns={editColumns}
                cascadeType={cascadeType}
                formValues={formValues}
                onChange={setFormValues}
                isSimpleMaster={isSimpleMaster}
                markAsOther={markAsOther}
                onMarkAsOtherChange={setMarkAsOther}
              />
            </div>

            {formError && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {formError}
              </p>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setFormOpen(false)}
                disabled={formSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={submitForm} disabled={formSubmitting}>
                {formSubmitting ? "Saving…" : editingRow ? "Save Changes" : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete confirm */}
      <AlertDialog
        open={deleteRow !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteRow(null);
            setDeleteError(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleteRowLabel}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the record. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {deleteError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                confirmDelete();
              }}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Transfer to next reporting year - OFT/FLD and CFLD Technical Parameter, manual per client spec (never automatic). */}
      {(oftFldStatus || isCfldTechnicalParameter) && (
        <AlertDialog
          open={transferRow !== null}
          onOpenChange={(open) => {
            if (!open) {
              setTransferRow(null);
              setTransferError(null);
            }
          }}
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
            {transferError && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {transferError}
              </p>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={transferring}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(event) => {
                  event.preventDefault();
                  confirmTransfer();
                }}
                disabled={transferring}
              >
                {transferring ? "Transferring…" : "Transfer"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Add Result - OFT/FLD only; saving a result is how a record moves from Ongoing to Completed. FLD's is real (FldResultDialog, wired to /api/fld-result); OFT's stays this placeholder until its own real dynamic-table result feature lands. */}
      {oftFldStatus && resultKind === "fld" && (
        <FldResultDialog
          fldId={typeof resultRow?.id === "string" ? resultRow.id : null}
          open={resultRow !== null}
          onOpenChange={(open) => !open && setResultRow(null)}
        />
      )}
      {oftFldStatus && resultKind !== "fld" && (
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
