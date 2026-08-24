"use client";

import type { LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type MultiSelectChecklistProps = {
  /** Every option, e.g. every real state under the current zone. */
  options: string[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  icon: LucideIcon;
  /** Shown collapsed and as the "select everything" checklist row, e.g. "State" -> "All States". */
  allLabel: string;
  disabled?: boolean;
};

/**
 * Reusable checkbox multi-select for Reports' State / Host Organisation /
 * District pickers - each behaves the same way as the KVK picker already
 * did (leave everything checked for a collective selection, uncheck some
 * for a selective one), per client direction that Host Organisations need
 * single/multi checkboxes and that picking every state should expose an
 * "All Hosts / All Districts / All KVKs" scope.
 */
export function MultiSelectChecklist({
  options,
  selected,
  onChange,
  icon: Icon,
  allLabel,
  disabled,
}: MultiSelectChecklistProps) {
  const allSelected = options.length > 0 && selected.size === options.length;
  const noneSelected = selected.size === 0;

  const label =
    disabled || options.length === 0
      ? `Select a ${allLabel.replace(/^All /, "")} first`
      : allSelected || noneSelected
        ? allLabel
        : selected.size === 1
          ? Array.from(selected)[0]
          : `${selected.size} Selected`;

  function toggleAll() {
    onChange(allSelected ? new Set() : new Set(options));
  }

  function toggleOne(name: string) {
    const next = new Set(selected);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    onChange(next);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            disabled={disabled || options.length === 0}
            className="flex h-9 w-full items-center justify-between rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="flex items-center gap-1.5 truncate">
              <Icon className="size-3.5 shrink-0 text-muted-foreground" />
              {label}
            </span>
          </button>
        }
      />
      <DropdownMenuContent align="start" className="w-72 min-w-0 overflow-y-auto">
        <DropdownMenuCheckboxItem checked={allSelected} onCheckedChange={toggleAll}>
          {allLabel}
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        {options.map((name) => (
          <DropdownMenuCheckboxItem
            key={name}
            checked={allSelected || selected.has(name)}
            onCheckedChange={() => toggleOne(name)}
          >
            {name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
