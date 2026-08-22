"use client";

import { useMemo } from "react";
import { ChevronDown, FolderTree } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ALL_CATEGORY_PATHS,
  MODULE_IMAGE_CATEGORIES,
} from "@/lib/module-images";

type SelectCategoryDropdownProps = {
  /** Set of selected Form Management leaf paths. All-selected means "every category". */
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
};

/**
 * "Category / Form" filter, as a checklist - same interaction the Reports
 * screen's "Select Form" dropdown already uses (client direction: "module
 * images mai checklist bhi laga do report mai jaise hai"), so a Super Admin
 * can pull photographs for several categories at once instead of one.
 *
 * Per the spec this must never carry a hard-coded category list, so the
 * options are every leaf across Form Management (`MODULE_IMAGE_CATEGORIES`,
 * grouped by its top-level category) rather than a fixed OFT/FLD/Training
 * list re-typed here. Adding a new leaf to Form Management makes it show up
 * here automatically.
 */
export function SelectCategoryDropdown({
  selected,
  onChange,
}: SelectCategoryDropdownProps) {
  const groups = useMemo(() => {
    const byGroup = new Map<string, typeof MODULE_IMAGE_CATEGORIES>();
    for (const leaf of MODULE_IMAGE_CATEGORIES) {
      const list = byGroup.get(leaf.groupLabel) ?? [];
      list.push(leaf);
      byGroup.set(leaf.groupLabel, list);
    }
    return Array.from(byGroup.entries());
  }, []);

  const allSelected = selected.size === ALL_CATEGORY_PATHS.size;
  const noneSelected = selected.size === 0;

  const label = allSelected
    ? "All Categories"
    : noneSelected
      ? "No Category Selected"
      : selected.size === 1
        ? (MODULE_IMAGE_CATEGORIES.find((c) => selected.has(c.path))?.label ??
          "1 Category Selected")
        : `${selected.size} Categories Selected`;

  function toggleAll() {
    onChange(allSelected ? new Set() : new Set(ALL_CATEGORY_PATHS));
  }

  function toggleGroup(paths: string[]) {
    const groupAllSelected = paths.every((path) => selected.has(path));
    const next = new Set(selected);
    if (groupAllSelected) paths.forEach((path) => next.delete(path));
    else paths.forEach((path) => next.add(path));
    onChange(next);
  }

  function toggleOne(path: string) {
    const next = new Set(selected);
    if (next.has(path)) next.delete(path);
    else next.add(path);
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
              <FolderTree className="size-3.5 shrink-0 text-muted-foreground" />
              {label}
            </span>
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
          </button>
        }
      />
      <DropdownMenuContent
        align="start"
        className="w-80 min-w-0 overflow-y-auto"
      >
        <DropdownMenuCheckboxItem
          checked={allSelected}
          onCheckedChange={toggleAll}
        >
          Select All Categories
        </DropdownMenuCheckboxItem>

        {groups.map(([groupLabel, leaves]) => (
          <div key={groupLabel}>
            <DropdownMenuSeparator />
            {leaves.length > 1 ? (
              <>
                <DropdownMenuLabel>{groupLabel}</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={leaves.every((leaf) => selected.has(leaf.path))}
                  onCheckedChange={() => toggleGroup(leaves.map((l) => l.path))}
                  className="font-medium"
                >
                  All of {groupLabel}
                </DropdownMenuCheckboxItem>
                {leaves.map((leaf) => (
                  <DropdownMenuCheckboxItem
                    key={leaf.path}
                    checked={selected.has(leaf.path)}
                    onCheckedChange={() => toggleOne(leaf.path)}
                    className="pl-6"
                  >
                    {leaf.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </>
            ) : (
              <DropdownMenuCheckboxItem
                checked={selected.has(leaves[0].path)}
                onCheckedChange={() => toggleOne(leaves[0].path)}
              >
                {leaves[0].label}
              </DropdownMenuCheckboxItem>
            )}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
