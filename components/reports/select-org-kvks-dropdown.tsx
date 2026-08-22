"use client";

import { Building2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SelectOrgKvksDropdownProps = {
  /** KVKs under the currently selected Host Organisation. Empty until a Host Organisation is picked. */
  kvks: string[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  disabled?: boolean;
};

/**
 * Once a Host Organisation is picked, every KVK under it shows here as a
 * checklist - Select All gives the collective report for that organisation,
 * unchecking some gives a selective report for just those KVKs. Client
 * direction: "ek organisation se sare host show ho aur fir collective ya
 * selective report checkbox ke help se le sku."
 */
export function SelectOrgKvksDropdown({
  kvks,
  selected,
  onChange,
  disabled,
}: SelectOrgKvksDropdownProps) {
  const allSelected = kvks.length > 0 && selected.size === kvks.length;
  const noneSelected = selected.size === 0;

  const label =
    disabled || kvks.length === 0
      ? "Select a Host Organisation first"
      : allSelected
        ? `All KVKs (${kvks.length})`
        : noneSelected
          ? "No KVKs Selected"
          : selected.size === 1
            ? Array.from(selected)[0]
            : `${selected.size} of ${kvks.length} KVKs Selected`;

  function toggleAll() {
    onChange(allSelected ? new Set() : new Set(kvks));
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
            disabled={disabled || kvks.length === 0}
            className="mt-1 flex h-9 w-full items-center justify-between rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="flex items-center gap-1.5 truncate">
              <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
              {label}
            </span>
          </button>
        }
      />
      <DropdownMenuContent
        align="start"
        className="w-72 min-w-0 overflow-y-auto"
      >
        <DropdownMenuCheckboxItem
          checked={allSelected}
          onCheckedChange={toggleAll}
        >
          Select All KVKs (Collective Report)
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        {kvks.map((name) => (
          <DropdownMenuCheckboxItem
            key={name}
            checked={selected.has(name)}
            onCheckedChange={() => toggleOne(name)}
          >
            {name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
