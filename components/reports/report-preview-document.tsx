"use client";

import { Fragment, useState, type ReactNode } from "react";
import { ArrowUp, ChevronLeft, ChevronRight } from "lucide-react";
import {
  buildHeaderMatrix,
  isRedundantTableHeading,
  splitNoteLabel,
  type ReportBlock,
  type ReportColumn,
  type ReportGrid,
  type ReportSection,
  type ReportSubsection,
  type ReportTable,
} from "@/lib/report-types";

/**
 * On-screen render of the full report - the same section/subsection/table
 * tree the Download PDF/Excel/Word buttons emit (lib/report-pdf.ts), so the
 * preview reads identically to the downloaded file. Grouped headers, the
 * "1.1.A" intermediate heading, total rows, per-entity composite blocks and
 * numbered pair lists all mirror the PDF, and a clickable Table of Contents
 * mirrors the PDF's own clickable TOC so a reader can jump straight to one
 * section of a 90+ page report.
 */

/** Dots are legal in an id but awkward in CSS selectors - keep anchors selector-safe. */
const anchorId = (kind: "sec" | "sub" | "grp" | "tab", key: string) =>
  `report-${kind}-${key.replace(/\./g, "-")}`;

const TH_BASE =
  "border-b border-border px-2.5 py-1.5 font-semibold whitespace-nowrap text-foreground";
const TD_BASE = "border-b border-l border-border px-2.5 py-1.5 align-top text-foreground";

/** N-row grouped header for a grid, from the shared header matrix (super-v2-prod.pdf's pivots go up to ~6 levels). */
function GridHead({
  columns,
  serial,
  titleBands,
}: {
  columns: ReportColumn[];
  serial: boolean;
  titleBands?: string[];
}) {
  const matrix = buildHeaderMatrix(columns, serial ? "Sl. No." : undefined);
  const totalCols = (serial ? 1 : 0) + columns.length;
  return (
    <thead>
      {(titleBands ?? []).map((band, i) => (
        <tr key={`band-${i}`}>
          <th
            colSpan={totalCols}
            className={`${TH_BASE} border-l text-left ${i === 0 ? "bg-muted/60 font-bold" : "bg-muted/30 font-semibold"}`}
          >
            {band}
          </th>
        </tr>
      ))}
      {matrix.map((row, r) => (
        <tr key={r} className="bg-muted/60 text-left">
          {row.map((cell, c) => (
            <th
              key={c}
              className={`${TH_BASE} border-l ${cell.colSpan > 1 ? "text-center" : "align-bottom"}`}
              colSpan={cell.colSpan}
              rowSpan={cell.rowSpan}
            >
              {cell.text}
            </th>
          ))}
        </tr>
      ))}
    </thead>
  );
}

function Caption({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <p key={i} className="text-xs font-semibold text-foreground">
          {line}
        </p>
      ))}
    </>
  );
}

function Grid({ grid }: { grid: ReportGrid }) {
  const serial = !grid.noSerial;

  if (grid.rows.length === 0 && !grid.totalRow && !grid.keepEmpty) {
    return (
      <div className="space-y-1">
        {grid.caption && <Caption text={grid.caption} />}
        <p className="px-1 py-2 text-sm text-muted-foreground italic">
          No data available in table
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {grid.caption && <Caption text={grid.caption} />}
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full border-collapse text-sm">
          <GridHead columns={grid.columns} serial={serial} titleBands={grid.titleBands} />
          <tbody>
            {grid.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="odd:bg-background even:bg-muted/20">
                {serial && (
                  <td className="border-b border-border px-2.5 py-1.5 text-muted-foreground">
                    {rowIndex + 1}
                  </td>
                )}
                {grid.columns.map((col) => (
                  <td key={col.key} className={TD_BASE}>
                    {row[col.key] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
            {grid.totalRow && (
              <tr className="bg-muted/50 font-semibold">
                {serial && <td className="border-b border-border px-2.5 py-1.5" />}
                {grid.columns.map((col) => (
                  <td key={col.key} className={TD_BASE}>
                    {grid.totalRow![col.key] ?? ""}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PairList({
  pairs,
  caption,
  flow,
}: {
  pairs: { num?: string; label: string; value: string }[];
  caption?: string;
  flow?: boolean;
}) {
  if (flow) {
    return (
      <div className="space-y-1">
        {caption && <Caption text={caption} />}
        {pairs.map((pair, index) => (
          <p key={index} className="text-sm text-foreground">
            <span className="font-semibold italic">{pair.label}</span> {pair.value}
          </p>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-1">
      {caption && <p className="text-xs font-semibold text-foreground">{caption}</p>}
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {pairs.map((pair, index) => (
              <tr key={index} className="odd:bg-background even:bg-muted/20">
                <th
                  scope="row"
                  className="w-2/5 border-b border-border px-2.5 py-1.5 text-left align-top font-semibold text-foreground"
                >
                  {pair.num ? `${pair.num} ${pair.label}` : pair.label}
                </th>
                <td className={TD_BASE}>{pair.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CompositeBlock({ block }: { block: ReportBlock }) {
  if (block.align === "center" && block.parts.length === 0) {
    return (
      <p className="pt-2 text-center text-base font-bold text-foreground">
        {block.heading}
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {block.heading && (
        <p className="text-sm font-semibold text-foreground">{block.heading}</p>
      )}
      {block.notes && block.notes.length > 0 && (
        <ul className="space-y-0.5 text-xs text-muted-foreground">
          {block.notes.map((note, index) => {
            const { label, value } = splitNoteLabel(note);
            return (
              <li key={index}>
                <span className="font-semibold text-foreground">{label}</span>
                {value ? ` ${value}` : ""}
              </li>
            );
          })}
        </ul>
      )}
      {block.parts.map((part, index) => (
        <Fragment key={index}>
          {part.kind === "grid" ? (
            <Grid grid={part} />
          ) : (
            <PairList pairs={part.pairs} caption={part.caption} flow={part.flow} />
          )}
        </Fragment>
      ))}
    </div>
  );
}

function TableBody({ table }: { table: ReportTable }) {
  if (table.blocks) {
    return (
      <div className="space-y-4">
        {table.blocks.map((block, index) => (
          <CompositeBlock key={index} block={block} />
        ))}
      </div>
    );
  }
  if (table.pairs) return <PairList pairs={table.pairs} />;
  return <Grid grid={table} />;
}

function TocTableLines({ sub }: { sub: ReportSubsection }) {
  const seenGroups = new Set<string>();
  const entries: { key: string; anchor: string; text: string }[] = [];

  for (const table of sub.tables) {
    if (isRedundantTableHeading(sub, table)) continue;
    if (table.groupCode) {
      if (seenGroups.has(table.groupCode)) continue;
      seenGroups.add(table.groupCode);
      entries.push({
        key: `grp-${table.groupCode}`,
        anchor: `#${anchorId("grp", table.groupCode)}`,
        text: `${table.groupCode} ${table.groupTitle ?? ""}`,
      });
      continue;
    }
    entries.push({
      key: `tab-${table.code}`,
      anchor: `#${anchorId("tab", table.code)}`,
      text: `${table.code} ${table.title}`,
    });
  }

  return (
    <ul className="mt-1.5 space-y-1.5">
      {entries.map((entry) => (
        <li key={entry.key} className="border-l border-border/60 pl-4">
          <a
            href={entry.anchor}
            className="text-muted-foreground hover:text-foreground hover:underline"
          >
            {entry.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

function TableOfContents({ sections }: { sections: ReportSection[] }) {
  return (
    <nav
      aria-label="Report contents"
      className="rounded-md border border-border bg-muted/20 p-5 text-sm"
    >
      <p className="mb-3 text-base font-bold text-foreground">Table of Contents</p>
      <ul className="space-y-5">
        {sections.map((section) => (
          <li key={section.num}>
            <a
              href={`#${anchorId("sec", section.num)}`}
              className="block border-b border-primary/30 pb-1 font-semibold tracking-wide text-primary uppercase hover:underline"
            >
              {section.num}. {section.title}
            </a>
            <ul className="mt-2 space-y-3">
              {section.subsections.map((sub) => (
                <li key={sub.num}>
                  <a
                    href={`#${anchorId("sub", sub.num)}`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {sub.num} {sub.title}
                  </a>
                  <TocTableLines sub={sub} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function SubsectionTables({ sub }: { sub: ReportSubsection }) {
  return (
    <div className="space-y-3">
      <h4
        id={anchorId("sub", sub.num)}
        className="border-b border-border pb-1 text-sm font-semibold text-foreground"
      >
        {sub.num} {sub.title}
      </h4>

      {sub.tables.map((table, index) => {
        const showGroupHeading =
          !!table.groupCode && sub.tables[index - 1]?.groupCode !== table.groupCode;
        const showTableHeading = !isRedundantTableHeading(sub, table);

        return (
          <Fragment key={table.code}>
            {showGroupHeading && (
              <p
                id={anchorId("grp", table.groupCode!)}
                className="pt-1 text-sm font-semibold text-foreground"
              >
                {table.groupCode} {table.groupTitle}
              </p>
            )}
            <div id={anchorId("tab", table.code)} className="space-y-1.5">
              {showTableHeading && (
                <p className="text-sm font-medium text-foreground">
                  {table.code} {table.title}
                </p>
              )}
              <TableBody table={table} />
            </div>
          </Fragment>
        );
      })}

      {sub.images && sub.images.length > 0 && (
        <div className="space-y-2 border-t border-border pt-3">
          <p className="text-sm font-semibold text-foreground">
            Photographs
            <span className="ml-1 font-normal text-muted-foreground">({sub.images.length})</span>
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {sub.images.map((img, i) => (
              <figure
                key={i}
                className="overflow-hidden rounded-md border border-border bg-muted/20"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.caption}
                  className="max-h-72 w-full bg-background object-contain"
                />
                <figcaption className="space-y-0.5 border-t border-border px-3 py-2 text-xs">
                  <span className="block font-medium text-foreground">
                    {img.caption || "Untitled"}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    {[img.category, img.date].filter(Boolean).join(" · ")}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Trims the leading section number word so the nav pills stay short ("Achievements", not "2. ACHIEVEMENTS"). */
function shortSectionTitle(title: string) {
  return title.replace(/^[0-9.]+\s*/, "");
}

function NavPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * On-screen preview. Rather than one endless scroll of every section, the
 * reader moves through the report a section at a time (with an "All
 * sections" option), a sticky section switcher up top and Previous/Next
 * controls at the foot - the same tables/TOC as before, just paged so a
 * 100+ table report stays readable.
 */
export function ReportPreviewDocument({
  zoneLabel,
  kvkNames,
  sections,
}: {
  zoneLabel: string;
  kvkNames: string[];
  sections: ReportSection[];
}) {
  const [view, setView] = useState<string>(sections[0]?.num ?? "all");

  const goto = (next: string) => {
    setView(next);
    document.getElementById("report-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const shown = view === "all" ? sections : sections.filter((s) => s.num === view);
  const activeIndex = sections.findIndex((s) => s.num === view);
  const prev = activeIndex > 0 ? sections[activeIndex - 1] : null;
  const nextSection = activeIndex >= 0 && activeIndex < sections.length - 1 ? sections[activeIndex + 1] : null;

  return (
    <div
      id="report-top"
      className="overflow-hidden rounded-lg border border-border bg-card [&_[id^=report-]]:scroll-mt-20"
    >
      <header className="space-y-1 border-b border-border p-5 pb-4 text-center">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">
          {zoneLabel}
        </p>
        <h2 className="text-lg font-bold tracking-wide text-foreground">
          ATARI AMS REPORT
        </h2>
        <p className="text-xs text-muted-foreground">Reporting Year: All Data</p>
        <p className="text-xs text-muted-foreground">
          KVKs included ({kvkNames.length}): {kvkNames.join(", ")}
        </p>
      </header>

      <div className="sticky top-0 z-10 flex gap-1.5 overflow-x-auto border-b border-border bg-card/95 px-4 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <NavPill active={view === "all"} onClick={() => goto("all")}>
          All sections
        </NavPill>
        {sections.map((section) => (
          <NavPill key={section.num} active={view === section.num} onClick={() => goto(section.num)}>
            {section.num}. {shortSectionTitle(section.title)}
          </NavPill>
        ))}
      </div>

      <div className="mx-auto max-w-4xl space-y-8 p-5">
        {view === "all" && <TableOfContents sections={sections} />}

        {shown.map((section) => (
          <section key={section.num} className="space-y-5">
            <h3
              id={anchorId("sec", section.num)}
              className="border-b-2 border-primary/30 pb-1 text-center text-base font-bold tracking-wide text-primary uppercase"
            >
              {section.num}. {section.title}
            </h3>

            {view !== "all" && <TableOfContents sections={[section]} />}

            {section.subsections.map((sub) => (
              <div
                key={sub.num}
                className="rounded-lg border border-border bg-background p-4 shadow-sm"
              >
                <SubsectionTables sub={sub} />
              </div>
            ))}
          </section>
        ))}

        <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
          <div>
            {view !== "all" && prev && (
              <button
                type="button"
                onClick={() => goto(prev.num)}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <ChevronLeft className="size-3.5" />
                {prev.num}. {shortSectionTitle(prev.title)}
              </button>
            )}
          </div>
          <a
            href="#report-top"
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
          >
            <ArrowUp className="size-3.5" />
            Top
          </a>
          <div className="text-right">
            {view !== "all" && nextSection && (
              <button
                type="button"
                onClick={() => goto(nextSection.num)}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                {nextSection.num}. {shortSectionTitle(nextSection.title)}
                <ChevronRight className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
