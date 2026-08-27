"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Filter, GripHorizontal, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ColumnSort = "asc" | "desc" | null;

export type ColumnFilterState = {
  /** null = no selection made yet (equivalent to "all"). */
  selected: Set<string> | null;
  sort: ColumnSort;
};

type ColumnFilterMenuProps = {
  columnLabel: string;
  /** Distinct values for this column across all rows, each with its occurrence count. */
  values: { value: string; count: number }[];
  state: ColumnFilterState;
  onApply: (state: ColumnFilterState) => void;
};

/**
 * Per-column filter dropdown (sort + searchable "unique values" checklist),
 * confirmed against the reference's OFT Thematic Area Master the reference
 * - every EmptyDataTable column
 * header has this, not just a decorative funnel icon.
 */
export function ColumnFilterMenu({
  columnLabel,
  values,
  state,
  onApply,
}: ColumnFilterMenuProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<ColumnFilterState>(state);

  /**
   * Client request (2026-08-27): this popup was covering the very row data
   * a user opened it to check, with no way to move it out of the way - drag
   * the whole popup from its own grip handle to reposition it. The offset
   * is applied as a `transform: translate(...)` on top of the library's own
   * computed position, so Base UI's Positioner keeps anchoring/flipping
   * normally and this only shifts the final paint, not its layout math.
   */
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragStateRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!dragging) return;
    function onMove(e: PointerEvent) {
      const drag = dragStateRef.current;
      if (!drag) return;
      setDragOffset({ x: drag.originX + (e.clientX - drag.startX), y: drag.originY + (e.clientY - drag.startY) });
    }
    function onUp() {
      setDragging(false);
      dragStateRef.current = null;
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging]);

  function startDrag(e: React.PointerEvent) {
    e.preventDefault();
    dragStateRef.current = { startX: e.clientX, startY: e.clientY, originX: dragOffset.x, originY: dragOffset.y };
    setDragging(true);
  }

  const filteredValues = useMemo(
    () =>
      values.filter((v) =>
        v.value.toLowerCase().includes(search.toLowerCase()),
      ),
    [values, search],
  );

  const allSelected =
    draft.selected === null || draft.selected.size === values.length;
  const isActive =
    state.sort !== null ||
    (state.selected !== null && state.selected.size < values.length);

  function openMenu(next: boolean) {
    setOpen(next);
    if (next) {
      setDraft(state);
      setSearch("");
      setDragOffset({ x: 0, y: 0 });
    }
  }

  function toggleAll(checked: boolean) {
    setDraft((prev) => ({ ...prev, selected: checked ? null : new Set() }));
  }

  /**
   * Real bug (client report, 2026-08-26): checking 2 boxes left a 3rd
   * checked "by itself". Cause: `prev.selected === null` means "every value
   * implicitly selected", so the old code always started an uncomputed
   * toggle from the FULL value list - checking a box that's already
   * implicitly-checked was a no-op, so nothing ever narrowed down and every
   * value just stayed checked no matter what got clicked. Unchecking a box
   * from that same null state still correctly built up an exclusion set
   * (that direction was never broken) - only the "check a box first" path
   * needs a real, empty starting set instead of the full one.
   */
  function toggleValue(value: string, checked: boolean) {
    setDraft((prev) => {
      const base =
        prev.selected === null
          ? checked
            ? new Set<string>()
            : new Set(values.map((v) => v.value))
          : prev.selected;
      const next = new Set(base);
      if (checked) next.add(value);
      else next.delete(value);
      return { ...prev, selected: next.size === values.length ? null : next };
    });
  }

  function apply() {
    onApply(draft);
    setOpen(false);
  }

  /** Asc/Desc sort the table live, the instant it's clicked - unlike the checkbox selection below (which needs a "Done" to commit a multi-step choice), a sort direction is a single click with nothing to keep adjusting, so it shouldn't wait for one. Popover stays open so the checklist below is still usable afterward. */
  function applySort(dir: "asc" | "desc") {
    setDraft((prev) => {
      const next = { ...prev, sort: prev.sort === dir ? null : dir };
      onApply(next);
      return next;
    });
  }

  /** Resets the filter but leaves the popover open (client fix, 2026-08-25: "Clear filters" was closing the popup, matching Done's behavior instead of its own - the reference keeps it open so the user can see the reset state and keep adjusting). */
  function clear() {
    const cleared: ColumnFilterState = { selected: null, sort: null };
    setDraft(cleared);
    onApply(cleared);
  }

  return (
    <DropdownMenu open={open} onOpenChange={openMenu}>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={`Filter ${columnLabel}`}
            className={cn(
              "rounded p-0.5 transition-colors",
              isActive
                ? "text-primary"
                : "text-muted-foreground/50 hover:text-muted-foreground",
            )}
          >
            <Filter className="size-3" />
          </button>
        }
      />
      <DropdownMenuContent
        align="start"
        className="w-64 p-3"
        style={{ transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)` }}
      >
        <div
          onPointerDown={startDrag}
          className={cn(
            "mb-2 -mt-1 -mx-1 flex items-center justify-center gap-1 rounded-md py-1 text-muted-foreground/60 hover:bg-accent hover:text-muted-foreground",
            dragging ? "cursor-grabbing" : "cursor-grab",
          )}
          title="Drag to move"
        >
          <GripHorizontal className="size-3.5" />
        </div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {columnLabel}
        </p>

        <div className="flex gap-1.5">
          <Button
            variant={draft.sort === "asc" ? "default" : "outline"}
            size="xs"
            className="flex-1"
            onClick={() => applySort("asc")}
          >
            <ArrowUp className="size-3" />
            Asc
          </Button>
          <Button
            variant={draft.sort === "desc" ? "default" : "outline"}
            size="xs"
            className="flex-1"
            onClick={() => applySort("desc")}
          >
            <ArrowDown className="size-3" />
            Desc
          </Button>
        </div>

        <label className="mt-3 flex items-start gap-2 text-xs">
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked) => toggleAll(checked === true)}
            className="mt-0.5"
          />
          <span>
            <span className="font-medium text-foreground">Unique Values</span>
            <span className="block text-muted-foreground">
              Show one row per distinct value, with its count
            </span>
          </span>
        </label>

        <div className="relative mt-2">
          <Search className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search values..."
            className="h-7 pl-7 text-xs"
          />
        </div>

        <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">
          {filteredValues.length === 0 ? (
            <p className="py-3 text-center text-xs text-muted-foreground">
              No values
            </p>
          ) : (
            filteredValues.map((v) => {
              const checked =
                draft.selected === null || draft.selected.has(v.value);
              return (
                <label
                  key={v.value}
                  className="flex items-center justify-between gap-2 py-0.5 text-xs"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(next) =>
                        toggleValue(v.value, next === true)
                      }
                    />
                    <span className="truncate text-foreground uppercase" title={v.value}>
                      {v.value}
                    </span>
                  </span>
                  <span className="shrink-0 text-muted-foreground">({v.count})</span>
                </label>
              );
            })
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-2">
          <button
            type="button"
            onClick={clear}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear Filters
          </button>
          <Button size="xs" onClick={apply}>
            Done
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
