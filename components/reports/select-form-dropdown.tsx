"use client";

import { useMemo } from "react";
import { ChevronDown, FileCheck2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ALL_FORM_PATHS, REPORT_FORM_LEAVES } from "@/lib/reports";

type SelectFormDropdownProps = {
  /** Set of selected leaf paths (e.g. "about-kvk/employee/employee-details"). */
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
};

/**
 * The spec's "Select Form" filter is a dropdown containing a checklist —
 * "Select All Forms (checklist box)" per section 4 — and a report needs to
 * scope down to one particular sub-form (e.g. just "Employee Details"
 * inside About KVK), not only a whole top-level category. So this renders
 * every leaf across Form Management, grouped under its top-level category,
 * each independently checkable, plus a group-level "select all in this
 * category" row and a top "Select All Forms" row.
 */
export function SelectFormDropdown({ selected, onChange }: SelectFormDropdownProps) {
  const groups = useMemo(() => {
    const byGroup = new Map<string, typeof REPORT_FORM_LEAVES>();
    for (const leaf of REPORT_FORM_LEAVES) {
      const list = byGroup.get(leaf.groupLabel) ?? [];
      list.push(leaf);
      byGroup.set(leaf.groupLabel, list);
    }
    return Array.from(byGroup.entries());
  }, []);

  const allSelected = selected.size === ALL_FORM_PATHS.size;
  const noneSelected = selected.size === 0;

  const label = allSelected
    ? "All Forms"
    : noneSelected
      ? "No Forms Selected"
      : selected.size === 1
        ? (REPORT_FORM_LEAVES.find((f) => selected.has(f.path))?.label ?? "1 Form Selected")
        : `${selected.size} Forms Selected`;

  function toggleAll() {
    onChange(allSelected ? new Set() : new Set(ALL_FORM_PATHS));
  }

  function toggleGroup(paths: string[]) {
    const groupAllSelected = paths.every((path) => selected.has(path));
    const next = new Set(selected);
    if (groupAllSelected) {
      paths.forEach((path) => next.delete(path));
    } else {
      paths.forEach((path) => next.add(path));
    }
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
            className="mt-1 flex h-9 w-full items-center justify-between rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring"
          >
            <span className="flex items-center gap-1.5 truncate">
              <FileCheck2 className="size-3.5 shrink-0 text-muted-foreground" />
              {label}
            </span>
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
          </button>
        }
      />
      <DropdownMenuContent align="start" className="max-h-96 w-80 min-w-0 overflow-y-auto">
        <DropdownMenuCheckboxItem checked={allSelected} onCheckedChange={toggleAll}>
          Select All Forms
        </DropdownMenuCheckboxItem>

        {groups.map(([groupLabel, leaves]) => (
          <div key={groupLabel}>
            <DropdownMenuSeparator />
            {leaves.length > 1 ? (
              <>
                <p className="px-1.5 pt-1 text-[11px] font-medium text-muted-foreground">{groupLabel}</p>
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
