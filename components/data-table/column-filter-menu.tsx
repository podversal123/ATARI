"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Filter, Search } from "lucide-react";
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
    }
  }

  function toggleAll(checked: boolean) {
    setDraft((prev) => ({ ...prev, selected: checked ? null : new Set() }));
  }

  function toggleValue(value: string, checked: boolean) {
    setDraft((prev) => {
      const next = new Set(prev.selected ?? values.map((v) => v.value));
      if (checked) next.add(value);
      else next.delete(value);
      return { ...prev, selected: next.size === values.length ? null : next };
    });
  }

  function apply() {
    onApply(draft);
    setOpen(false);
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
      <DropdownMenuContent align="start" className="w-64 p-3">
        <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {columnLabel}
        </p>

        <div className="flex gap-1.5">
          <Button
            variant={draft.sort === "asc" ? "default" : "outline"}
            size="xs"
            className="flex-1"
            onClick={() =>
              setDraft((prev) => ({
                ...prev,
                sort: prev.sort === "asc" ? null : "asc",
              }))
            }
          >
            <ArrowUp className="size-3" />
            Asc
          </Button>
          <Button
            variant={draft.sort === "desc" ? "default" : "outline"}
            size="xs"
            className="flex-1"
            onClick={() =>
              setDraft((prev) => ({
                ...prev,
                sort: prev.sort === "desc" ? null : "desc",
              }))
            }
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
                  <span className="flex items-center gap-2">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(next) =>
                        toggleValue(v.value, next === true)
                      }
                    />
                    <span className="text-foreground uppercase">{v.value}</span>
                  </span>
                  <span className="text-muted-foreground">({v.count})</span>
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
