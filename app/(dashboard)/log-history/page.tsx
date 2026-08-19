"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { KVKS } from "@/lib/rbac";
import { useSession } from "@/lib/session";

const COLUMNS = [
  { key: "sNo", label: "S.No." },
  { key: "kvkName", label: "KVK Name" },
  { key: "nameOfUser", label: "Name Of User" },
  { key: "activity", label: "Activity" },
  { key: "ipAddress", label: "IP Address" },
  { key: "loginTime", label: "Login Time" },
] as const;

/** A KVK Admin's own log view drops the KVK Name column — every row is already their own KVK. */
const KVK_COLUMNS = COLUMNS.filter((column) => column.key !== "kvkName");

type SortState = { key: string; direction: "asc" | "desc" } | null;

/**
 * Real columns and filter row confirmed from a client reference screenshot
 * ("View Users Log Activity": KVK dropdown + Filter button, Search box, then
 * S.No/KVK Name/Name of User/Activity/IP Address/Login Time with per-column
 * sort arrows) — that screenshot's own chrome (sidebar/header/table style)
 * is from a different, older reference build than the rest of this app, so
 * only the content/columns/filters are matched here; visual styling stays
 * consistent with the rest of this app's design system.
 */
export default function LogHistoryPage() {
  const session = useSession();
  const isKvk = session.role !== "super-admin";
  const columns = isKvk ? KVK_COLUMNS : COLUMNS;

  const [kvkFilter, setKvkFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortState>(null);

  function toggleSort(key: string) {
    setSort((prev) => {
      if (prev?.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return null;
    });
  }

  return (
    <div>
      <PageHeader
        trail={[{ label: "Log History" }]}
        title="View Users Log Activity"
        description={isKvk ? `Activity log for ${session.kvkName ?? "your KVK"}` : undefined}
      />

      {/* A KVK Admin never gets a cross-KVK picker — data isolation: KVK A must never read KVK B's activity. */}
      {!isKvk && (
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">KVKs</label>
            <select
              value={kvkFilter}
              onChange={(e) => setKvkFilter(e.target.value)}
              className="mt-1 h-9 w-56 rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring"
            >
              <option value="all">All</option>
              {KVKS.map((kvk) => (
                <option key={kvk.name} value={kvk.name}>
                  {kvk.name}
                </option>
              ))}
            </select>
          </div>
          <Button size="sm">Filter</Button>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="relative w-64">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-8"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {columns.map((column) => {
                  const active = sort?.key === column.key;
                  return (
                    <th key={column.key} className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className={cn(
                          "inline-flex items-center gap-1 transition-colors",
                          active ? "text-primary" : "hover:text-foreground"
                        )}
                      >
                        {column.label}
                        {active ? (
                          sort?.direction === "asc" ? (
                            <ArrowUp className="size-3" />
                          ) : (
                            <ArrowDown className="size-3" />
                          )
                        ) : (
                          <ArrowUpDown className="size-3 text-muted-foreground/50" />
                        )}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-muted-foreground">
                  No records found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
          <span>Showing 0-0 of 0</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Prev
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
