"use client";

import { Landmark } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { KVKS } from "@/lib/rbac";

const ALL_KVK_NAMES = KVKS.map((kvk) => kvk.name);

type SelectKvksMultiDropdownProps = {
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
};

/**
 * "Select KVKs" filter - per the spec (section 3/7), leaving every KVK
 * checked downloads photographs collectively across all of them, while
 * unchecking some scopes the download to just those KVKs (selective).
 * Unlike Reports' equivalent picker, this one isn't gated behind a Host
 * Organisation first - the spec's own example lists KVKs flat.
 */
export function SelectKvksMultiDropdown({
  selected,
  onChange,
}: SelectKvksMultiDropdownProps) {
  const allSelected = selected.size === ALL_KVK_NAMES.length;
  const noneSelected = selected.size === 0;

  const label =
    allSelected || noneSelected
      ? "All KVKs"
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
            className="flex h-9 w-full items-center justify-between rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring"
          >
            <span className="flex items-center gap-1.5 truncate">
              <Landmark className="size-3.5 shrink-0 text-muted-foreground" />
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
          All KVKs
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        {ALL_KVK_NAMES.map((name) => (
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
