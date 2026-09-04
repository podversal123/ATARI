"use client";

import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
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
/** Bar view's own chart box height (`h-56` below) - the real, fixed pixel value a "safe headroom" calculation needs to be measured against. */
const CHART_BOX_HEIGHT_PX = 224;
/** TooltipContent's own tallest real shape (mode="split": KVK name + Not started + Completed + Ongoing + Total, each row ~24px, plus the card's p-3 padding and header border) - measured from its actual rendered markup, not guessed. */
const TOOLTIP_SAFE_HEIGHT_PX = 150;
/** The `mb-1.5` gap between a bar's top and its tooltip (see the `bottom: calc(...)` usage below) - must be included in the safe-height budget too, or a bar sitting exactly at the boundary would still overshoot the chart box's top edge by this much. */
const TOOLTIP_GAP_PX = 6;
/** Above this bar-height percentage, a `bottom`-anchored tooltip (plus its gap) would push part of itself above the chart box's own top edge - see the usage below for the `top-0` fallback that guarantees it can't. */
const SAFE_MAX_BAR_PERCENT_FOR_BOTTOM_ANCHOR =
  ((CHART_BOX_HEIGHT_PX - TOOLTIP_SAFE_HEIGHT_PX - TOOLTIP_GAP_PX) / CHART_BOX_HEIGHT_PX) * 100;

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
  /** Real per-card filter dropdowns (client request, 2026-08-30: Training Progress's Clientele/Venue, Extension Activities Progress's Nature of Extension Activity) - rendered as their own row right under the description, above the summary/"Show all" row. Omitted for cards with no card-specific filter. */
  filters?: ReactNode;
  /**
   * A string that changes whenever the *caller's* filters change (Year/KVK
   * on the Dashboard, the analytics filter bar on a detail page). Pagination
   * and "Show all" reset when it changes, so switching a filter never leaves
   * the user stranded on a page that's now all zero-value rows. A poll
   * refresh keeps the same value, so it doesn't reset anything.
   */
  resetKey?: string;
};

/**
 * Positions the floating tooltip card relative to whatever `positionClass`
 * says - the caller is responsible for making its own wrapper the
 * positioned ancestor (`relative`) so `absolute` here resolves against
 * *that specific element's own box*, not some larger shared container. Real
 * bug fix (client report, 2026-08-30): the bar-chart tooltip used to be
 * anchored to the full-height column every bar sits in, so it always popped
 * up at the very top of the chart regardless of how tall or short that
 * bar's own fill actually was - it must track each bar's own height
 * instead.
 */
function TooltipPopup({
  content,
  positionClass,
  style,
}: {
  content: ReactNode;
  positionClass: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={style}
      className={cn(
        "pointer-events-none absolute z-10 w-max max-w-48 rounded-lg border border-border bg-card p-3 text-xs text-foreground shadow-lg",
        positionClass,
      )}
    >
      {content}
    </div>
  );
}

/**
 * Real reference tooltip (atari-client.vercel.app/dashboard) - a white card
 * (not the dark/black box this used to be), listing all 4 lines - Not
 * started, Completed, Ongoing, Total - in that order, not just a standalone
 * "Not started" message when a KVK has zero entries. Each line carries the
 * same colored dot as the legend above the chart (Ongoing/Completed/Not
 * started use the exact same ONGOING_COLOR/COMPLETED_COLOR/muted tokens
 * already established there).
 */
function TooltipContent({ row, mode }: { row: ProgressChartRow; mode: "split" | "total" }) {
  const total = row.ongoing + row.completed;
  const notStarted = total === 0 ? 1 : 0;
  const line = (color: string | null, label: string, value: number) => (
    <div key={label} className="flex items-center justify-between gap-4 py-0.5">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <span
          className={cn("size-2 rounded-full", !color && "bg-muted-foreground/40")}
          style={color ? { backgroundColor: color } : undefined}
        />
        {label}
      </span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
  return (
    <div>
      <p className="mb-1.5 pb-1.5 border-b border-border text-sm font-semibold text-foreground">{row.label}</p>
      {line(null, "Not started", notStarted)}
      {mode === "total" ? (
        line(COMPLETED_COLOR, "Entries", row.completed)
      ) : (
        <>
          {line(COMPLETED_COLOR, "Completed", row.completed)}
          {line(ONGOING_COLOR, "Ongoing", row.ongoing)}
          <div className="mt-1 flex items-center justify-between gap-4 border-t border-border pt-1.5">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold text-foreground">{total}</span>
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
  filters,
  resetKey,
}: ProgressChartCardProps) {
  const [view, setView] = useState<ChartView>(defaultView);
  const [page, setPage] = useState(0);
  /**
   * The tooltip used to be permanently mounted for every row (shown/hidden
   * purely via CSS `opacity` on `:hover`) - real bug (client report,
   * 2026-08-30): even at `opacity-0`, an `absolute`-positioned element still
   * counts toward its scrollable ancestor's own content height. In List
   * view's "Show all" (`max-h-[32rem] overflow-y-auto`), every row's own
   * always-present, always-invisible tooltip (rendered below the row via
   * `top-full`, ~130-150px tall) inflated that scroll area well past where
   * the visible rows actually ended, leaving a large empty gap before the
   * footer. Mounting the tooltip only for the row actually being hovered
   * (tracked here) means an unhovered row contributes nothing to layout at
   * all, not just something invisible - the same fix applies to Bar view's
   * tooltip for the same underlying reason, even though that one wasn't
   * reported broken (its column doesn't scroll vertically, so it read fine
   * despite the same layout cost being paid).
   */
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  /** "Show all (N)" was a disabled, decorative button - real now: shows every row unpaginated (same as how Area view already behaves), toggled back off by switching view/page. */
  const [showAll, setShowAll] = useState(false);
  /**
   * "Show less" shrinks a tall "show all" list back down without the page's
   * own scroll position adjusting - if the user had scrolled down (to see
   * rows near the bottom) or right (the horizontal-scroll chart wrapper
   * below, `needsScroll`), collapsing back to the short paginated view
   * leaves the card's toggle button sitting outside the now-much-shorter
   * page, and the chart wrapper's own leftover horizontal scroll position
   * (no longer reachable once `overflow-x-auto` is removed) can leave the
   * chart itself rendering mid-scroll on the next "Show all". Real bug fix
   * (client report, 2026-08-29): reset the chart wrapper's own scroll
   * before the card scrolls itself back into view.
   */
  const cardRef = useRef<HTMLDivElement>(null);
  const chartScrollRef = useRef<HTMLDivElement>(null);

  /**
   * Reset pagination / "Show all" whenever the row set changes (the KVK ids,
   * not the array reference - so the ~20s poll refresh doesn't yank a
   * browsing user back to page 0) OR the caller's own filters change
   * (`resetKey` - covers a Year filter that keeps all 66 KVKs but re-sorts
   * them, so page 3 would otherwise become all zero-value rows and every bar
   * "disappears"). Real bug: apply Year 2026, page to 3, switch Year to All -
   * bars vanished because `page` stayed at 3 on a now-different sort.
   */
  const rowsKey = useMemo(() => rows.map((r) => r.id).join("|"), [rows]);
  const pageResetKey = `${rowsKey}#${resetKey ?? ""}`;
  const [prevPageResetKey, setPrevPageResetKey] = useState(pageResetKey);
  if (pageResetKey !== prevPageResetKey) {
    setPrevPageResetKey(pageResetKey);
    setPage(0);
    setShowAll(false);
  }

  /**
   * Axis ceiling gets real headroom above the tallest bar's own value
   * (standard chart-domain padding, same idea every charting library
   * defaults to) rather than exactly equalling it. Without this, a single
   * KVK selection - or any filter that narrows down to one dominant row -
   * always renders at exactly 100% height, since a lone value is trivially
   * its own max; the bar looked oversized/maxed-out against the box edge no
   * matter how small the real number was (client report 2026-08-30).
   */
  const maxTotal = useMemo(() => {
    const rawMax = Math.max(1, ...rows.map((r) => r.ongoing + r.completed));
    return Math.max(rawMax + 1, Math.ceil(rawMax * 1.2));
  }, [rows]);
  /**
   * Bar / List pages walk only the KVKs that actually have entries. In a zone
   * where most KVKs haven't started, the old behaviour paginated through page
   * after page of nothing-but-zero-stub bars - which read as "the bars
   * disappeared" (client report). "Show all" and the Area view still plot
   * every KVK (the "N not started" count already lives in the summary line).
   * Falls back to all rows if none have entries, so the chart never goes
   * completely blank.
   */
  const activeRows = useMemo(() => rows.filter((r) => r.ongoing + r.completed > 0), [rows]);
  const baseRows = showAll || view === "area" || activeRows.length === 0 ? rows : activeRows;
  const pageCount = Math.max(1, Math.ceil(baseRows.length / PAGE_SIZE));
  /** A single page (e.g. one KVK selected) has nothing left for "Show all"/Prev/Next to do - same page 1 either way - so it's treated as always-shown, same as Area, instead of showing pagination controls with nothing to paginate (client report 2026-08-30). */
  const allShown = view === "area" || showAll || pageCount <= 1;
  const currentPage = Math.min(page, pageCount - 1);
  const pageRows = allShown
    ? baseRows
    : baseRows.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);
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
    <div ref={cardRef} className="rounded-lg border border-border bg-card p-5">
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

      {filters && <div className="mt-3 flex flex-wrap items-center gap-3">{filters}</div>}

      {(summary || showAllLabel) && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
          {summary && <span>{summary}</span>}
          {/*
            Area always plots every row already (`allShown = view === "area"
            || showAll`) - the toggle button did nothing there (real bug,
            client report 2026-08-30), so it's hidden entirely for this view
            rather than sitting there clickable with no effect. Same
            reasoning extends to a single-KVK (or any <= PAGE_SIZE) result:
            with only one page of rows to begin with, "Show all" has nothing
            further to reveal either (client report 2026-08-30, seen on a
            single-KVK dashboard filter).
          */}
          {showAllLabel && view !== "area" && rows.length > PAGE_SIZE && (
            <button
              type="button"
              onClick={() => {
                setShowAll((v) => {
                  const next = !v;
                  if (!next) {
                    // Collapsing back down - reset any leftover horizontal scroll on the chart itself, then bring the whole card back into view in case the page had scrolled to see rows further down the "show all" list.
                    if (chartScrollRef.current) chartScrollRef.current.scrollLeft = 0;
                    requestAnimationFrame(() => cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
                  }
                  return next;
                });
              }}
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
        exactly as before, no scrollbar.

        No pt-20/-mt-20 trick here anymore - that existed only because the
        old tooltip escaped above this box (`bottom-full` against the
        full-height column) and needed reserved room inside the scroll box
        so `overflow-x-auto` (which forces `overflow-y: auto` too, per the
        CSS spec, whenever only overflow-x is set) wouldn't clip it. The
        current tooltip (see the bar-view JSX below) is guaranteed to stay
        inside its own column's bounds - `top-0` for tall bars, height-
        tracking within the column for short ones - so nothing here ever
        needs to escape vertically any more. Real bug fix (client report,
        2026-08-30): keeping the now-pointless pt-20/-mt-20 around left
        `overflow-y: auto` engaged for no reason, and it was intermittently
        showing a real (if empty) vertical scrollbar next to the chart.
      */}
      <div ref={chartScrollRef} className={needsScroll ? "overflow-x-auto" : undefined}>
      <div
        className={cn(
          "relative mt-4",
          view === "list" ? "px-5" : "pr-16 pl-6",
          needsListScroll ? "max-h-[32rem] overflow-y-auto" : "h-56",
        )}
        style={
          view === "bar" && pageRows.length > 12
            ? { minWidth: `${pageRows.length * 42 + 24}px` }
            : view === "area" && rows.length > 12
              ? { minWidth: `${rows.length * 42 + 24}px` }
              : undefined
        }
      >
        {/* The dashed gridlines and the 0/max value scale only mean anything against Bar/Area's own height-mapped bars - List has no such axis, so both were stray, unlabeled decoration bleeding into it before (real bug, client report 2026-08-30). */}
        {view !== "list" && (
          <>
            <div className="absolute inset-y-0 right-0 left-6 flex flex-col justify-between">
              {[0, 1, 2, 3].map((line) => (
                <div key={line} className="w-full border-t border-dashed border-border" />
              ))}
            </div>
            <span className="absolute bottom-0 left-0 text-[10px] text-muted-foreground/70">0</span>
            <span className="absolute top-0 left-0 text-[10px] text-muted-foreground/70">{maxTotal}</span>
          </>
        )}

        {rows.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            No data yet
          </div>
        ) : view === "bar" ? (
          <div className="flex h-full items-end gap-2">
            {pageRows.map((row, index) => {
              const total = row.ongoing + row.completed;
              const barHeightPercent = total === 0 ? 2 : (total / maxTotal) * 100;
              /**
               * Real bug (client screenshot, 2026-08-30): centering the
               * tooltip under every column (`left-1/2 -translate-x-1/2`)
               * pushed it half off the chart's own left edge for the very
               * first bar (a 192px-wide tooltip centered under a ~42px-wide
               * "Show all" column extends ~75px past that column's left
               * edge, far more than the chart's own 24px of left padding) -
               * "KVK Bhagalpur" rendered as "VK Bhagalpur" with its first
               * letter cut off. The first/last column now anchor the
               * tooltip to their own left/right edge instead of centering
               * it, so it only ever extends toward the middle of the chart
               * (where there's real room), never past either edge.
               */
              const horizontalAnchorClass =
                index === 0
                  ? "left-0"
                  : index === pageRows.length - 1
                    ? "right-0"
                    : "left-1/2 -translate-x-1/2";
              /**
               * The chart box has very little real headroom above it (just
               * the legend row - the description/title sit right above
               * that, in normal document flow, which reserves nothing for
               * an absolutely-positioned tooltip escaping upward). A bar
               * anywhere near 100% height left its tooltip floating up past
               * the chart entirely into the title/description text (real
               * bug, client report 2026-08-30 - the new taller white-card
               * tooltip made this far more visible than the old compact
               * dark box did, but the underlying gap was already there).
               *
               * Not a heuristic cap - a hard guarantee: `top-0` positions
               * the tooltip's own top edge exactly at the chart box's own
               * top edge, which CSS cannot place any higher regardless of
               * the tooltip's actual rendered height (unlike a `bottom`
               * percentage, which keeps pushing the tooltip further up as
               * its content grows taller). The switch point is a real
               * measurement, not a guess: CHART_BOX_HEIGHT_PX matches this
               * view's own `h-56` (14rem), and TOOLTIP_SAFE_HEIGHT_PX is
               * this card's own TooltipContent measured in its tallest real
               * shape (mode="split": name + 4 rows + padding, about 145px) -
               * below that bar height, tracking the bar exactly (the
               * original ask) still fits with room to spare; at or above
               * it, `bottom` would push part of the tooltip above the box,
               * so it pins to the box's own top instead.
               */
              const usesTopAnchor = barHeightPercent > SAFE_MAX_BAR_PERCENT_FOR_BOTTOM_ANCHOR;
              return (
                <div
                  key={row.id}
                  className="relative flex h-full flex-1 items-end justify-center"
                  onMouseEnter={() => setHoveredRowId(row.id)}
                  onMouseLeave={() => setHoveredRowId((id) => (id === row.id ? null : id))}
                >
                  {/*
                    `relative` stays on this full-width column (not the
                    narrow bar inside it) so `horizontalAnchorClass` above
                    has the full column to work with - anchoring it to the
                    much narrower bar (w-1/3 max-w-16) instead let the tooltip's fixed
                    max-w-48 overflow past the chart card's own edges near
                    either end of a wide "Show all" row, which triggered a
                    real horizontal scrollbar even though nothing was
                    actually meant to scroll there (client report,
                    2026-08-30). Vertical position still tracks each bar's
                    own height individually via the inline `bottom` percentage
                    below, rather than `bottom-full` (which would anchor to
                    this full-height column and put every tooltip at the same
                    height regardless of its own bar's size - the original
                    bug this was built to fix).

                    Bar width is `w-1/3` of its own column (not the chart),
                    and each column is an equal 1/N share of the whole chart
                    width - fine with a full page of KVKs, but with only one
                    or two columns (a single-KVK filter, or a KVK with no
                    other entries to page alongside) that 1/3 share is a
                    third of the *entire* chart, ballooning into a huge block.
                    `max-w-16` caps the bar at the same comfortable width
                    regardless of how many columns are showing, so a single
                    bar looks the same size as one bar among many (client
                    report, 2026-08-31).
                  */}
                  <div
                    className="flex w-1/3 max-w-16 flex-col justify-end overflow-hidden rounded-t-sm"
                    style={{ height: `${barHeightPercent}%` }}
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
                  {hoveredRowId === row.id && (
                    <TooltipPopup
                      content={<TooltipContent row={row} mode={mode} />}
                      positionClass={cn(horizontalAnchorClass, usesTopAnchor && "top-0")}
                      style={usesTopAnchor ? undefined : { bottom: `calc(${barHeightPercent}% + 0.375rem)` }}
                    />
                  )}
                </div>
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
                  {/* No hover tooltip here (client direction, 2026-08-30) - every number it would show (Ongoing/Completed/Not started/Total) is already visible inline in the row above, so it was pure redundant duplication, not real information. */}
                  <div className="h-1.5 w-full">
                    <div className="h-full w-full overflow-hidden rounded-full bg-muted-foreground/15">
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
                  className="absolute top-3 left-1/2 origin-top-left rotate-45 whitespace-nowrap text-[10px] text-muted-foreground"
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
              ? `Showing all ${baseRows.length || totalCount}`
              : `Showing ${pageRows.length === 0 ? 0 : currentPage * PAGE_SIZE + 1}-${currentPage * PAGE_SIZE + pageRows.length} of ${baseRows.length}`)}
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
