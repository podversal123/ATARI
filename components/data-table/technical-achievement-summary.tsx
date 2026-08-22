"use client";

import { useState } from "react";
import { FileDown, FileSpreadsheet, FileType } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DEMOGRAPHIC_GROUPS,
  DEMOGRAPHIC_LEAF_COUNT,
  PUBLICATIONS_BLOCK,
  TECHNICAL_ACHIEVEMENT_CARDS,
  sectionWidth,
  type SummaryCard,
  type SummarySection,
} from "@/lib/technical-achievement-summary";

const HEAD_CELL =
  "border border-border bg-muted/60 px-3 py-2 text-center text-xs font-semibold text-foreground";
const BODY_CELL =
  "border border-border px-3 py-2 text-center text-sm text-muted-foreground";

/** Leaf columns of one section, flattened in render order - used to lay out the value row. */
function leafCount(section: SummarySection): number {
  return sectionWidth(section);
}

function SectionMetricHeads({ section }: { section: SummarySection }) {
  // Plain metric columns span whatever header rows still follow them: the caste
  // row and its M/F/T row always, plus the "Achievement" row where one exists.
  const rowSpan = section.participantGroup?.matrixHeading ? 3 : 2;
  return (
    <>
      {section.metricGroup.columns.map((column) => (
        <th key={`${section.heading}-${column}`} rowSpan={rowSpan} className={HEAD_CELL}>
          {column}
        </th>
      ))}
      {section.participantGroup?.leadColumn && (
        <th rowSpan={rowSpan} className={HEAD_CELL}>
          {section.participantGroup.leadColumn}
        </th>
      )}
      {section.participantGroup?.matrixHeading ? (
        <th colSpan={DEMOGRAPHIC_LEAF_COUNT} className={HEAD_CELL}>
          {section.participantGroup.matrixHeading}
        </th>
      ) : (
        section.participantGroup && <CasteHeads section={section} />
      )}
    </>
  );
}

/** General / OBC / SC / ST / Total, each spanning its own M/F(/T) splits. */
function CasteHeads({ section }: { section: SummarySection }) {
  return (
    <>
      {DEMOGRAPHIC_GROUPS.map((group) => (
        <th
          key={`${section.heading}-${group.label}`}
          colSpan={group.splits.length}
          className={HEAD_CELL}
        >
          {group.label}
        </th>
      ))}
    </>
  );
}

/**
 * One report card: two sections rendered side by side inside a single table,
 * matching the real page. The header is up to six
 * rows deep - section heading, sub-heading, metric/participant group headings,
 * then the demographic caste rows and their M/F/T splits.
 */
function SummaryCardTable({ card }: { card: SummaryCard }) {
  const [left, right] = card.sections;
  const hasSubHeading = card.sections.some((section) => section.subHeading);
  // The group row carries the metric-group name and/or the participant-group
  // name, so it is needed as soon as either side has one to show.
  const hasGroupRow = card.sections.some(
    (section) => section.metricGroup.heading || section.participantGroup,
  );
  /** True when the card's sections split the demographic block behind an "Achievement" row. */
  const hasMatrixRow = card.sections.some((section) => section.participantGroup?.matrixHeading);
  const totalLeaves = leafCount(left) + leafCount(right);

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {card.sections.map((section) => (
              <th
                key={section.heading}
                colSpan={sectionWidth(section)}
                className={HEAD_CELL}
              >
                {section.heading}
              </th>
            ))}
          </tr>

          {hasSubHeading && (
            <tr>
              {card.sections.map((section) => (
                <th
                  key={`${section.heading}-sub`}
                  colSpan={sectionWidth(section)}
                  className={HEAD_CELL}
                >
                  {section.subHeading ?? ""}
                </th>
              ))}
            </tr>
          )}

          {hasGroupRow && (
            <tr>
              {card.sections.map((section) => (
                <SectionGroupHeads
                  key={`${section.heading}-groups`}
                  section={section}
                />
              ))}
            </tr>
          )}

          {/*
            Where a section carries an "Achievement" row, its caste headers sit
            on their own row beneath it. Where it does not, they must stay on
            the metric row and immediately after that section's own columns,
            or the rowspan'd metric cells push them out of alignment.
          */}
          <tr>
            {card.sections.map((section) => (
              <SectionMetricHeads key={`${section.heading}-metrics`} section={section} />
            ))}
          </tr>

          {hasMatrixRow && (
            <tr>
              {card.sections.map((section) =>
                section.participantGroup ? (
                  <CasteHeads key={`${section.heading}-caste`} section={section} />
                ) : null,
              )}
            </tr>
          )}

          <tr>
            {card.sections.map((section) =>
              section.participantGroup
                ? DEMOGRAPHIC_GROUPS.flatMap((group) =>
                    group.splits.map((split) => (
                      <th
                        key={`${section.heading}-${group.label}-${split}`}
                        className={HEAD_CELL}
                      >
                        {split}
                      </th>
                    )),
                  )
                : null,
            )}
          </tr>
        </thead>

        <tbody>
          {/*
 No submission data exists yet (no backend), so every cell reads 0 -
 the same honest empty state the real page itself shows before any
 KVK has reported, rather than fabricated achievement figures.
 */}
          <tr>
            {Array.from({ length: totalLeaves }, (_, index) => (
              <td key={index} className={BODY_CELL}>
                0
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function SectionGroupHeads({ section }: { section: SummarySection }) {
  const participantWidth = section.participantGroup
    ? (section.participantGroup.leadColumn ? 1 : 0) + DEMOGRAPHIC_LEAF_COUNT
    : 0;
  return (
    <>
      <th colSpan={section.metricGroup.columns.length} className={HEAD_CELL}>
        {section.metricGroup.heading}
      </th>
      {section.participantGroup && (
        <th colSpan={participantWidth} className={HEAD_CELL}>
          {section.participantGroup.heading}
        </th>
      )}
    </>
  );
}

type TechnicalAchievementSummaryProps = {
  /** Shown under the year picker for a KVK Admin, whose figures cover only their own KVK. */
  scopeNote?: string;
};

/**
 * Technical Achievement Summary. Unlike every other Form Management screen
 * this is a report, not a list - hence its own component rather than
 * `EmptyDataTable`. Same page for both roles: a Super Admin sees the figures
 * aggregated across all KVKs, a KVK Admin sees their own, which is a data
 * scope difference rather than a layout one (`scopeNote` just labels it).
 */
export function TechnicalAchievementSummary({
  scopeNote,
}: TechnicalAchievementSummaryProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, index) =>
    String(currentYear - index),
  );
  const [reportingYear, setReportingYear] = useState("");

  return (
    <div>
      <div className="mb-4">
        <label className="text-sm font-medium text-foreground">
          Reporting Year
        </label>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <select
            value={reportingYear}
            onChange={(event) => setReportingYear(event.target.value)}
            className="h-9 w-64 rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring"
          >
            <option value="">Select year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <Button size="sm">Filter</Button>
        </div>
        {scopeNote && (
          <p className="mt-2 text-xs text-muted-foreground">{scopeNote}</p>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm">
          <FileDown className="size-3.5" />
          PDF
        </Button>
        <Button variant="outline" size="sm">
          <FileSpreadsheet className="size-3.5" />
          Excel
        </Button>
        <Button variant="outline" size="sm">
          <FileType className="size-3.5" />
          Word
        </Button>
      </div>

      <div className="space-y-4">
        {TECHNICAL_ACHIEVEMENT_CARDS.map((card) => (
          <SummaryCardTable key={card.id} card={card} />
        ))}

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th
                  colSpan={PUBLICATIONS_BLOCK.columns.length}
                  className={HEAD_CELL}
                >
                  {PUBLICATIONS_BLOCK.heading}
                </th>
              </tr>
              <tr>
                {PUBLICATIONS_BLOCK.columns.map((column) => (
                  <th key={column} className={HEAD_CELL}>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={PUBLICATIONS_BLOCK.columns.length}
                  className="border border-border px-3 py-3 text-sm text-muted-foreground"
                >
                  {PUBLICATIONS_BLOCK.emptyMessage}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
