"use client";

import { Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { KVKS } from "@/lib/rbac";

const ALL_KVK_NAMES = new Set(KVKS.map((kvk) => kvk.name));

type SelectKvksDropdownProps = {
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
};

/**
 * Multi-select checklist for the Super Admin's notification Recipient field
 * - picking several specific KVKs at once, not just "All" or one, per client
 * direction ("checkbox laga do ki jiska notification chahe wo dekh paaye").
 * Same checklist pattern as Reports' Select Form dropdown.
 */
export function SelectKvksDropdown({
  selected,
  onChange,
}: SelectKvksDropdownProps) {
  const allSelected = selected.size === ALL_KVK_NAMES.size;
  const noneSelected = selected.size === 0;

  const label = allSelected
    ? "All KVKs"
    : noneSelected
      ? "No KVKs Selected"
      : selected.size === 1
        ? Array.from(selected)[0]
        : `${selected.size} KVKs Selected`;

  function toggleAll() {
    onChange(allSelected ? new Set() : new Set(ALL_KVK_NAMES));
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
            className="mt-1 flex h-9 w-full items-center justify-between rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring"
          >
            <span className="flex items-center gap-1.5 truncate">
              <Users className="size-3.5 shrink-0 text-muted-foreground" />
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
          Select All KVKs
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        {KVKS.map((kvk) => (
          <DropdownMenuCheckboxItem
            key={kvk.name}
            checked={selected.has(kvk.name)}
            onCheckedChange={() => toggleOne(kvk.name)}
          >
            {kvk.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
