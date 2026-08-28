"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type MultiFilterSelectProps = {
  label: string;
  options: string[];
  /**
   * True representation of what's checked - empty means "nothing checked"
   * (not "all"), same convention as SelectKvksMultiDropdown. Callers still
   * treat both an empty selection and a full one as "no filter" when
   * building the actual API query (see MultiFilterSelect's own usages), so
   * the *data shown* at the untouched default behaves exactly as before;
   * only the checkbox widget's own toggle behaviour changes here. Real bug
   * fixed 2026-08-29 (client report): the old "empty = All" convention made
   * the "All" checkbox a no-op once already at the default state - clicking
   * it while every box read as checked did nothing, since selecting-all and
   * clearing-all were both represented by the same empty Set. A real
   * select-all checkbox must be able to reach a genuinely empty state by
   * clicking it a second time, so the widget below only ever treats the
   * selection as "checked" when it's explicitly the full option list -
   * never merely empty - even though the closed trigger's own label still
   * reads "All" at the untouched default for a sensible first impression.
   */
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  triggerClassName?: string;
  className?: string;
  /** Skips the built-in inline label - for callers (e.g. AnalyticsFilterBar) that already render their own label above the control in a stacked grid layout. */
  hideLabel?: boolean;
};

/**
 * Real checkbox multi-select (client request, 2026-08-28) for the main
 * Dashboard's Year/KVK filters - was a single-value native `<select>`
 * (still is, for every other page's own simpler filters via FilterSelect).
 * A real "Select All" toggle plus one checkbox per option, each reachable
 * independently. Selecting several sends them comma-joined to
 * /api/dashboard-stats, which resolves that into a real `{in: [...]}`
 * filter; selecting none or every option both omit the filter param
 * entirely (same "no filter" result as the old default).
 */
export function MultiFilterSelect({
  label,
  options,
  selected,
  onChange,
  triggerClassName,
  className,
  hideLabel = false,
}: MultiFilterSelectProps) {
  // Only a genuinely full explicit selection counts as "checked" for the
  // dropdown's own checkboxes and the toggle action below - an empty
  // selection is real "nothing checked" there, even though the closed
  // trigger's label (displayLabel, below) still reads it as "All" since an
  // untouched filter shows unfiltered data either way.
  const isExplicitlyFull = options.length > 0 && selected.size === options.length;
  const looksLikeAll = selected.size === 0 || isExplicitlyFull;

  const displayLabel = looksLikeAll
    ? "All"
    : selected.size === 1
      ? Array.from(selected)[0]
      : `${selected.size} selected`;

  function toggleAll() {
    onChange(isExplicitlyFull ? new Set() : new Set(options));
  }

  function toggleOne(option: string) {
    const next = new Set(selected);
    if (next.has(option)) next.delete(option);
    else next.add(option);
    onChange(next);
  }

  return (
    <div className={cn("flex items-center gap-2 text-xs", className)}>
      {!hideLabel && (
        <span className="font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className={cn(
                "flex h-8 min-w-24 items-center justify-between gap-1 rounded-md border border-border bg-card px-2 text-sm text-foreground outline-none focus-visible:border-ring",
                triggerClassName,
              )}
            >
              <span className="truncate">{displayLabel}</span>
              <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
            </button>
          }
        />
        <DropdownMenuContent align="start" className="max-h-72 w-56 overflow-y-auto">
          <DropdownMenuCheckboxItem checked={isExplicitlyFull} onCheckedChange={toggleAll}>
            All
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option}
              checked={selected.has(option)}
              onCheckedChange={() => toggleOne(option)}
            >
              {option}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
