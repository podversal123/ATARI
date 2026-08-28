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

function Tooltip({ children, content }: { children: ReactNode; content: ReactNode }) {
  return (
    <div className="group/tip relative flex h-full flex-1 items-end justify-center">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 w-max max-w-48 -translate-x-1/2 rounded-md bg-foreground px-2 py-1.5 text-[11px] text-background opacity-0 shadow-md transition-opacity group-hover/tip:opacity-100">
        {content}
      </div>
    </div>
  );
}

/**
 * Real reference tooltip (atari-client.vercel.app/dashboard) always lists
 * all 4 lines - Not started, Completed, Ongoing, Total - in that order, not
 * just a standalone "Not started" message when a KVK has zero entries.
 * Each line now carries the same colored dot as the legend above the chart
 * (Ongoing/Completed/Not started use the exact same ONGOING_COLOR/
 * COMPLETED_COLOR/muted tokens already established there) - the tooltip
 * was plain text with no color coding at all before, out of step with
 * every other status indicator in this component.
 */
function TooltipContent({ row, mode }: { row: ProgressChartRow; mode: "split" | "total" }) {
  const total = row.ongoing + row.completed;
  const notStarted = total === 0 ? 1 : 0;
  const line = (color: string | null, label: string, value: number) => (
    <div key={label} className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5">
        <span
          className={cn("size-1.5 rounded-full", !color && "bg-background/40")}
          style={color ? { backgroundColor: color } : undefined}
        />
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  );
  return (
    <div className="space-y-0.5">
      <p className="mb-1 border-b border-background/20 pb-1 text-center font-semibold">{row.label}</p>
      {line(null, "Not started", notStarted)}
      {mode === "total" ? (
        line(COMPLETED_COLOR, "Entries", row.completed)
      ) : (
        <>
          {line(COMPLETED_COLOR, "Completed", row.completed)}
          {line(ONGOING_COLOR, "Ongoing", row.ongoing)}
          <div className="mt-1 flex items-center justify-between gap-3 border-t border-background/20 pt-1">
            <span>Total</span>
            <span className="font-semibold">{total}</span>
          </div>
        </>
      )}
    </div>
  );
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
  /** "Show all (N)" was a disabled, decorative button - real now: shows every row unpaginated (same as how Area view already behaves), toggled back off by switching view/page. */
  const [showAll, setShowAll] = useState(false);
  const allShown = view === "area" || showAll;

  const maxTotal = useMemo(
    () => Math.max(1, ...rows.map((r) => r.ongoing + r.completed)),
    [rows],
  );
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageRows =
    allShown ? rows : rows.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);
  /** Only "Show all" on a wide KVK list needs the horizontal-scroll treatment below - the ordinary paginated/short case renders exactly as before, so its bar-hover tooltip isn't affected by the scroll wrapper's clipping. */
  const needsScroll =
    (view === "bar" && pageRows.length > 12) || (view === "area" && rows.length > 12);
  /** List "Show all" on a long KVK list was squeezing every row into the same fixed h-56 box via `justify-between` with no scroll - rows shrank and overlapped instead of scrolling. Only kicks in once there's actually more than a screenful of rows. */
  const needsListScroll = view === "list" && pageRows.length > 8;

  function changePage(delta: number) {
    setPage((p) => Math.min(pageCount - 1, Math.max(0, p + delta)));
  }

  const areaPath = useMemo(() => {
    if (view !== "area" || rows.length === 0) return null;
    const w = 100;
    const h = 100;
    const step = rows.length > 1 ? w / (rows.length - 1) : 0;
    const scale = (v: number) => h - (v / maxTotal) * h;
    /**
     * Real reference (atari-client.vercel.app/dashboard, Area tab): two
     * independent smoothed curves both starting at 0, not a stacked band -
     * an inner "Ongoing" curve (orange, 0..ongoing) painted on top of an
     * outer "Total" curve (green/gray, 0..ongoing+completed) painted first,
     * so the region between the two curves reads as "Completed" without a
     * third path. Confirmed against a real frame - orange peaks/dips there
     * track each KVK's real `ongoing` value exactly, not `completed`.
     */
    const points = rows.map((r, i) => ({
      x: rows.length > 1 ? i * step : w / 2,
      ongoingY: scale(r.ongoing),
      totalY: scale(r.ongoing + r.completed),
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
      total: smoothPath(
        points.map((p) => ({ x: p.x, y: p.totalY })),
        h,
      ),
      ongoing:
        mode === "split"
          ? smoothPath(
              points.map((p) => ({ x: p.x, y: p.ongoingY })),
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
              onClick={() => setShowAll((v) => !v)}
              className={cn(
                "rounded-md border px-2.5 py-1 font-medium transition-colors",
                showAll
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-primary hover:bg-accent",
              )}
            >
              {showAll ? "Show less" : showAllLabel}
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

      {/*
        Real reference (screenshot comparison, 2026-08-27): "Show all" on a
        66-KVK zone crammed every bar+label into the card's fixed width,
        producing an illegible overlapping mess - each column shrank to
        ~10px, nowhere near enough room for a rotated full KVK name. Past
        ~12 columns this now scrolls horizontally instead, with a real
        minimum width per column, so "Show all" stays legible instead of
        just cramming everything in. Paginated views (<=10 rows) render
        exactly as before, no scrollbar, no risk to the tooltip below.
        `overflow-x-auto` clips vertical overflow too (setting overflow-x
        alone forces the browser to treat overflow-y as auto per the CSS
        spec) - that clipped the bar-hover tooltip, which pops up above the
        chart via `bottom-full`. pt-20/-mt-20 gives it that room back inside
        the scroll box without visually shifting the chart down.
      */}
      <div className={needsScroll ? "overflow-x-auto pt-20 -mt-20" : undefined}>
      <div
        className={cn(
          "relative mt-4 pr-16 pl-6",
          needsListScroll ? "max-h-72 overflow-y-auto" : "h-56",
        )}
        style={
          view === "bar" && pageRows.length > 12
            ? { minWidth: `${pageRows.length * 42 + 24}px` }
            : view === "area" && rows.length > 12
              ? { minWidth: `${rows.length * 42 + 24}px` }
              : undefined
        }
      >
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
                <Tooltip key={row.id} content={<TooltipContent row={row} mode={mode} />}>
                  {/* Real reference (atari-client.vercel.app/dashboard, FLD Progress bar chart): each bar is a slim column with visible gaps on both sides, not edge-to-edge with its neighbors - w-full here was filling the whole column, making every bar look far thicker than the reference. */}
                  <div
                    className="flex w-3/5 flex-col justify-end overflow-hidden rounded-t-sm"
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
          <div
            className={cn(
              "flex flex-col gap-1.5",
              needsListScroll ? "justify-start" : "h-full justify-between overflow-hidden",
            )}
          >
            {/*
              Real reference: each row's track is always full width - the
              orange/green split is the ongoing:completed ratio within that
              row, not the row's magnitude relative to the busiest row (that
              magnitude comparison is what the Bar/Area views are for). Name
              + status badges share one line, the track sits on its own line
              below - confirmed against a real frame, not the previous
              width-by-total-value bar this replaced.
            */}
            {pageRows.map((row) => {
              const total = row.ongoing + row.completed;
              const notStarted = total === 0 ? 1 : 0;
              return (
                <div key={row.id} className="flex flex-col gap-1 py-0.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium text-foreground" title={row.label}>
                      {row.label}
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium">
                      {mode === "split" && (
                        <>
                          <span
                            className="rounded-full px-1.5 py-0.5"
                            style={{ backgroundColor: `${ONGOING_COLOR}22`, color: ONGOING_COLOR }}
                          >
                            ● {row.ongoing}
                          </span>
                          <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-primary">
                            ● {row.completed}
                          </span>
                          <span className="rounded-full bg-muted-foreground/15 px-1.5 py-0.5 text-muted-foreground">
                            ● {notStarted}
                          </span>
                        </>
                      )}
                      <span className="rounded-md border border-border px-1.5 py-0.5 text-muted-foreground">
                        Σ {total}
                      </span>
                    </span>
                  </div>
                  <div className="group/tip relative h-1.5 w-full overflow-hidden rounded-full bg-muted-foreground/15">
                    <div className="flex h-full w-full">
                      {mode === "split" ? (
                        <>
                          {row.ongoing > 0 && (
                            <div
                              className="h-full"
                              style={{
                                backgroundColor: ONGOING_COLOR,
                                width: `${total === 0 ? 0 : (row.ongoing / total) * 100}%`,
                              }}
                            />
                          )}
                          {row.completed > 0 && (
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${total === 0 ? 0 : (row.completed / total) * 100}%` }}
                            />
                          )}
                        </>
                      ) : (
                        total > 0 && <div className="h-full w-full bg-primary" />
                      )}
                    </div>
                    <div className="pointer-events-none absolute top-full left-0 z-10 mt-1 w-max max-w-48 rounded-md bg-foreground px-2 py-1.5 text-[11px] text-background opacity-0 shadow-md transition-opacity group-hover/tip:opacity-100">
                      <TooltipContent row={row} mode={mode} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : rows.length === 1 ? (
          /* Real reference (atari-client.vercel.app/dashboard/analytics/fld, Area tab, a Group By: Zone scope with exactly one zone): a single row can't plot a trend line, so it shows this fallback card instead of a degenerate one-point path. */
          <div className="flex h-full items-center justify-center">
            <div className="w-full max-w-md rounded-lg border border-border bg-card p-4">
              <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Single Data Point</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{rows[0].label}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {mode === "split" ? (
                  <>
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                      <span className="size-1.5 rounded-full" style={{ backgroundColor: ONGOING_COLOR }} />
                      Ongoing {rows[0].ongoing}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                      <span className="size-1.5 rounded-full" style={{ backgroundColor: COMPLETED_COLOR }} />
                      Completed {rows[0].completed}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                      <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                      Not started {rows[0].ongoing + rows[0].completed === 0 ? 1 : 0}
                    </span>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: COMPLETED_COLOR }} />
                    Entries {rows[0].completed}
                  </span>
                )}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Area chart needs at least 2 entries - switch to Bar or List for single rows.
              </p>
            </div>
          </div>
        ) : (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
            {/* Total (green/gray) painted first so it shows through above the Ongoing curve; Ongoing (orange) painted on top covers the 0..ongoing band. */}
            {areaPath?.total && (
              <path
                d={areaPath.total}
                fill={COMPLETED_COLOR}
                fillOpacity={0.35}
                stroke={COMPLETED_COLOR}
                strokeWidth={0.5}
                vectorEffect="non-scaling-stroke"
              />
            )}
            {areaPath?.ongoing && (
              <path
                d={areaPath.ongoing}
                fill={ONGOING_COLOR}
                fillOpacity={0.5}
                stroke={ONGOING_COLOR}
                strokeWidth={0.5}
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>
        )}
      </div>

      {/* Real reference (atari-client.vercel.app/dashboard, Bar/Area tabs): a tilted KVK-name label under every bar/point - was missing entirely, the chart area had no space reserved for it. Rendered height/rotation confirmed with a real Playwright screenshot this time (not guessed), List view already shows the name inline per row, so it's excluded here. Gap here must match the bars' gap-2 above (this row was gap-1 before) - otherwise each label drifts further out from under its own bar the further right you go. */}
      {(view === "bar" || (view === "area" && rows.length > 1)) && (
        <div
          className="relative mt-2 flex h-20 gap-2 pr-16 pl-6"
          style={
            view === "bar" && pageRows.length > 12
              ? { minWidth: `${pageRows.length * 42 + 24}px` }
              : view === "area" && rows.length > 12
                ? { minWidth: `${rows.length * 42 + 24}px` }
                : undefined
          }
        >
          {(() => {
            const labelRows = view === "bar" ? pageRows : rows;
            return labelRows.map((row) => (
              <div key={row.id} className="relative w-full overflow-visible">
                <span
                  className="absolute top-3 left-1/2 origin-top-left rotate-45 whitespace-nowrap text-[8px] text-muted-foreground"
                  title={row.label}
                >
                  {row.label}
                </span>
              </div>
            ));
          })()}
        </div>
      )}
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {footer ??
            (allShown
              ? `Showing all ${rows.length}`
              : `Showing ${pageRows.length === 0 ? 0 : currentPage * PAGE_SIZE + 1}-${currentPage * PAGE_SIZE + pageRows.length} of ${rows.length || totalCount}`)}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={allShown || currentPage === 0}
            onClick={() => changePage(-1)}
          >
            Prev
          </Button>
          {!allShown && (
            <span className="text-xs">
              {currentPage + 1}/{pageCount}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={allShown || currentPage >= pageCount - 1}
            onClick={() => changePage(1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
