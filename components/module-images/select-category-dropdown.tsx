"use client";

import { useMemo } from "react";
import { ChevronDown, FolderTree } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MODULE_IMAGE_CATEGORIES } from "@/lib/module-images";

export const ALL_CATEGORIES = "all";

type SelectCategoryDropdownProps = {
  value: string;
  onChange: (path: string) => void;
};

/**
 * "Category / Form" filter — per the spec this must never carry a
 * hard-coded category list, so the options are every leaf across Form
 * Management (`MODULE_IMAGE_CATEGORIES`, grouped by its top-level category)
 * rather than a fixed OFT/FLD/Training list re-typed here. Adding a new
 * leaf to Form Management makes it show up here automatically.
 */
export function SelectCategoryDropdown({ value, onChange }: SelectCategoryDropdownProps) {
  const groups = useMemo(() => {
    const byGroup = new Map<string, typeof MODULE_IMAGE_CATEGORIES>();
    for (const leaf of MODULE_IMAGE_CATEGORIES) {
      const list = byGroup.get(leaf.groupLabel) ?? [];
      list.push(leaf);
      byGroup.set(leaf.groupLabel, list);
    }
    return Array.from(byGroup.entries());
  }, []);

  const label =
    value === ALL_CATEGORIES
      ? "All Categories"
      : (MODULE_IMAGE_CATEGORIES.find((c) => c.path === value)?.label ?? "All Categories");

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
      <DropdownMenuContent align="start" className="w-72 min-w-0 overflow-y-auto">
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as string)}>
          <DropdownMenuRadioItem value={ALL_CATEGORIES}>All Categories</DropdownMenuRadioItem>
          {groups.map(([groupLabel, leaves]) => (
            <div key={groupLabel}>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>{groupLabel}</DropdownMenuLabel>
              {leaves.map((leaf) => (
                <DropdownMenuRadioItem key={leaf.path} value={leaf.path} className="pl-6">
                  {leaf.label}
                </DropdownMenuRadioItem>
              ))}
            </div>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
