"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { BarChart3, List, AreaChart, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type ChartView = "bar" | "list" | "area";

const VIEW_OPTIONS: {
  value: ChartView;
  label: string;
  icon: typeof BarChart3;
}[] = [
  { value: "bar", label: "Bar", icon: BarChart3 },
  { value: "list", label: "List", icon: List },
  { value: "area", label: "Area", icon: AreaChart },
];

const PAGE_SIZE = 10;
const ONGOING_COLOR = "#eaa624";
const COMPLETED_COLOR = "var(--color-primary)";

export type ProgressChartRow = {
  id: string;
  label: string;
  ongoing: number;
  completed: number;
};

type ProgressChartCardProps = {
  title: string;
  description: string;
  defaultView?: ChartView;
  totalCount: number;
  rows?: ProgressChartRow[];
  /** "total": no real Ongoing/Completed split exists (Training/Extension) - `completed` is used as the single "Entries" value and the status legend is hidden. */
  mode?: "split" | "total";
  /** "64 of 65 KVKs with entries · 1 not started" - omitted when there's nothing to summarize yet. */
  summary?: ReactNode;
  /** "Show all (65)" - rendered next to the summary line. */
  showAllLabel?: string;
  /** When set, "Detailed" navigates to the full analytics page instead of toggling a view. */
  detailedHref?: string;
  footer?: ReactNode;
};

function Tooltip({ children, content }: { children: ReactNode; content: string }) {
  return (
    <div className="group/tip relative flex h-full flex-1 items-end justify-center">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 w-max max-w-48 -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-center text-[11px] whitespace-pre-line text-background opacity-0 shadow-md transition-opacity group-hover/tip:opacity-100">
        {content}
      </div>
    </div>
  );
}

function tooltipText(row: ProgressChartRow, mode: "split" | "total") {
  const total = row.ongoing + row.completed;
  if (total === 0) return `${row.label}\nNot started`;
  if (mode === "total") return `${row.label}\nEntries: ${row.completed}`;
  return `${row.label}\nOngoing: ${row.ongoing}\nCompleted: ${row.completed}\nTotal: ${total}`;
}

/**
 * Real per-KVK progress chart: title, view-toggle (Bar/List/Area, plus an
 * optional "Detailed" link out to the full analytics page), the
 * ongoing/completed/not-started legend, and a pagination footer. Bar/List
 * paginate PAGE_SIZE rows at a time; Area always plots every row (a trend
 * across all KVKs reads better unpaginated) so its Prev/Next are disabled.
 */
export function ProgressChartCard({
  title,
  description,
  defaultView = "bar",
  totalCount,
  rows = [],
  mode = "split",
  summary,
  showAllLabel,
  detailedHref,
  footer,
}: ProgressChartCardProps) {
  const [view, setView] = useState<ChartView>(defaultView);
  const [page, setPage] = useState(0);

  const maxTotal = useMemo(
    () => Math.max(1, ...rows.map((r) => r.ongoing + r.completed)),
    [rows],
  );
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageRows =
    view === "area" ? rows : rows.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  function changePage(delta: number) {
    setPage((p) => Math.min(pageCount - 1, Math.max(0, p + delta)));
  }

  const areaPath = useMemo(() => {
    if (view !== "area" || rows.length === 0) return null;
    const w = 100;
    const h = 100;
    const step = rows.length > 1 ? w / (rows.length - 1) : 0;
    const scale = (v: number) => h - (v / maxTotal) * h;
    const points = rows.map((r, i) => ({
      x: rows.length > 1 ? i * step : w / 2,
      completedY: scale(r.completed),
      totalY: scale(r.completed + r.ongoing),
    }));

    function smoothPath(ys: { x: number; y: number }[], baseline: number) {
      if (ys.length === 1) {
        return `M0,${baseline} L${ys[0].x},${ys[0].y} L${w},${baseline} Z`;
      }
      let d = `M${ys[0].x},${baseline} L${ys[0].x},${ys[0].y}`;
      for (let i = 0; i < ys.length - 1; i++) {
        const mid = { x: (ys[i].x + ys[i + 1].x) / 2, y: (ys[i].y + ys[i + 1].y) / 2 };
        d += ` Q${ys[i].x},${ys[i].y} ${mid.x},${mid.y}`;
      }
      const last = ys[ys.length - 1];
      d += ` L${last.x},${last.y} L${last.x},${baseline} Z`;
      return d;
    }

    return {
      completed: smoothPath(
        points.map((p) => ({ x: p.x, y: p.completedY })),
        h,
      ),
      total:
        mode === "split"
          ? smoothPath(
              points.map((p) => ({ x: p.x, y: p.totalY })),
              h,
            )
          : null,
    };
  }, [view, rows, maxTotal, mode]);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold tracking-wide text-primary uppercase">
          {title}
        </p>
        <div className="flex shrink-0 items-center gap-0.5 rounded-md border border-border bg-muted/50 p-0.5">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setView(option.value);
                setPage(0);
              }}
              className={cn(
                "flex items-center gap-1 rounded-[calc(var(--radius-md)-2px)] px-1.5 py-1 text-[11px] font-medium tracking-wide uppercase transition-colors",
                view === option.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <option.icon className="size-3" />
              {option.label}
            </button>
          ))}
          {detailedHref && (
            <Link
              href={detailedHref}
              className="flex items-center gap-1 rounded-[calc(var(--radius-md)-2px)] px-1.5 py-1 text-[11px] font-medium tracking-wide text-primary uppercase transition-colors hover:text-primary/80"
            >
              <ArrowUpRight className="size-3" />
              Detailed
            </Link>
          )}
        </div>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>

      {(summary || showAllLabel) && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
          {summary && <span>{summary}</span>}
          {showAllLabel && (
            <button
              type="button"
              disabled
              className="rounded-md border border-border px-2.5 py-1 font-medium text-primary disabled:cursor-default disabled:opacity-70"
            >
              {showAllLabel}
            </button>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-end gap-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {mode === "split" ? (
          <>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ backgroundColor: ONGOING_COLOR }} /> Ongoing
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-primary" /> Completed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-muted-foreground/40" /> Not started
            </span>
          </>
        ) : (
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary" /> Entries
          </span>
        )}
      </div>

      <div className="relative mt-4 h-56 pl-6">
        <div className="absolute inset-y-0 right-0 left-6 flex flex-col justify-between">
          {[0, 1, 2, 3].map((line) => (
            <div key={line} className="w-full border-t border-dashed border-border" />
          ))}
        </div>
        <span className="absolute bottom-0 left-0 text-[10px] text-muted-foreground/70">0</span>
        <span className="absolute top-0 left-0 text-[10px] text-muted-foreground/70">{maxTotal}</span>

        {rows.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            No data yet
          </div>
        ) : view === "bar" ? (
          <div className="flex h-full items-end gap-2">
            {pageRows.map((row) => {
              const total = row.ongoing + row.completed;
              return (
                <Tooltip key={row.id} content={tooltipText(row, mode)}>
                  <div
                    className="flex w-full flex-col justify-end overflow-hidden rounded-t-sm"
                    style={{ height: `${total === 0 ? 2 : (total / maxTotal) * 100}%` }}
                  >
                    {total === 0 ? (
                      <div className="h-full w-full rounded-t-sm bg-muted-foreground/30" />
                    ) : (
                      <>
                        {/* Real reference (client's own atari-client.vercel.app/dashboard): Completed (green) stacks on top, Ongoing (orange) sits at the base against the axis - not the reverse. */}
                        {row.completed > 0 && (
                          <div
                            className="w-full rounded-t-sm bg-primary"
                            style={{ height: `${(row.completed / total) * 100}%` }}
                          />
                        )}
                        {mode === "split" && row.ongoing > 0 && (
                          <div
                            className="w-full"
                            style={{
                              backgroundColor: ONGOING_COLOR,
                              height: `${(row.ongoing / total) * 100}%`,
                            }}
                          />
                        )}
                      </>
                    )}
                  </div>
                </Tooltip>
              );
            })}
          </div>
        ) : view === "list" ? (
          <div className="flex h-full flex-col justify-between overflow-hidden">
            {pageRows.map((row) => {
              const total = row.ongoing + row.completed;
              return (
                <div key={row.id} className="flex items-center gap-2 text-xs">
                  <span className="w-24 shrink-0 truncate text-muted-foreground" title={row.label}>
                    {row.label}
                  </span>
                  <div className="group/tip relative h-2.5 flex-1 overflow-hidden rounded-full bg-muted-foreground/15">
                    <div
                      className="flex h-full"
                      style={{ width: `${total === 0 ? 0 : (total / maxTotal) * 100}%` }}
                    >
                      {mode === "split" && row.ongoing > 0 && (
                        <div
                          className="h-full"
                          style={{
                            backgroundColor: ONGOING_COLOR,
                            width: `${(row.ongoing / total) * 100}%`,
                          }}
                        />
                      )}
                      {row.completed > 0 && (
                        <div className="h-full bg-primary" style={{ width: `${(row.completed / total) * 100}%` }} />
                      )}
                    </div>
                    <div
                      className="pointer-events-none absolute top-full left-0 z-10 mt-1 w-max max-w-48 rounded-md bg-foreground px-2 py-1 text-[11px] whitespace-pre-line text-background opacity-0 shadow-md transition-opacity group-hover/tip:opacity-100"
                    >
                      {tooltipText(row, mode)}
                    </div>
                  </div>
                  <span className="w-8 shrink-0 text-right text-muted-foreground">{total}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
            {areaPath?.total && <path d={areaPath.total} fill={ONGOING_COLOR} fillOpacity={0.35} stroke={ONGOING_COLOR} strokeWidth={0.5} vectorEffect="non-scaling-stroke" />}
            {areaPath?.completed && (
              <path
                d={areaPath.completed}
                fill={COMPLETED_COLOR}
                fillOpacity={0.5}
                stroke={COMPLETED_COLOR}
                strokeWidth={0.5}
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {footer ??
            (view === "area"
              ? `Showing all ${rows.length}`
              : `Showing ${pageRows.length === 0 ? 0 : currentPage * PAGE_SIZE + 1}-${currentPage * PAGE_SIZE + pageRows.length} of ${rows.length || totalCount}`)}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={view === "area" || currentPage === 0}
            onClick={() => changePage(-1)}
          >
            Prev
          </Button>
          {view !== "area" && (
            <span className="text-xs">
              {currentPage + 1}/{pageCount}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={view === "area" || currentPage >= pageCount - 1}
            onClick={() => changePage(1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
