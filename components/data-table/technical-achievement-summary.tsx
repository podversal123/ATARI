"use client";

import { useEffect, useState } from "react";
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
import { KVKS } from "@/lib/rbac";
import { KvkCheckboxFilter } from "./kvk-checkbox-filter";

const HEAD_CELL =
  "border border-border bg-muted/60 px-3 py-2 text-center text-xs font-semibold text-foreground";
const BODY_CELL =
  "border border-border px-3 py-2 text-center text-sm text-muted-foreground";

/** Every header cell in a card's block carries that card's light accent tint (not just its very top heading row), so the whole header reads as one coloured zone instead of a single coloured strip sitting over an otherwise plain-grey header. */
function headCell(accentHead?: string) {
  return accentHead
    ? `border border-border ${accentHead} px-3 py-2 text-center text-xs font-semibold text-foreground`
    : HEAD_CELL;
}

/** One accent colour per card, so a user scanning the page can tell at a glance which technical achievement a table belongs to, per the client's request. */
const CARD_ACCENTS: Record<string, { bar: string; head: string }> = {
  "oft-fld": { bar: "bg-sky-500", head: "bg-sky-50" },
  "training-extension": { bar: "bg-emerald-500", head: "bg-emerald-50" },
  "seed-planting": { bar: "bg-violet-500", head: "bg-violet-50" },
  "livestock-soil": { bar: "bg-amber-500", head: "bg-amber-50" },
};

/** Same accent treatment as the 4 cards above, for the Publications block below them - it's a distinct achievement category too, per the client's "color-coded headings" request, so it shouldn't be the only plain-grey block on the page. */
const PUBLICATIONS_ACCENT = { bar: "bg-rose-500", head: "bg-rose-50" };

/** Leaf columns of one section, flattened in render order - used to lay out the value row. */
function leafCount(section: SummarySection): number {
  return sectionWidth(section);
}

type SectionValues = { metrics: number[]; leadColumn: number; matrix: number[] };

/** Flattens one section's real values into the same leaf order sectionWidth() counts - metric columns, then the lead column (if any), then the demographic matrix (if any). */
function buildRowValues(section: SummarySection, values: SectionValues | undefined): number[] {
  const metrics = values?.metrics ?? section.metricGroup.columns.map(() => 0);
  const row = [...metrics];
  if (section.participantGroup?.leadColumn) {
    row.push(values?.leadColumn ?? 0);
  }
  if (section.participantGroup) {
    row.push(...(values?.matrix ?? Array(DEMOGRAPHIC_LEAF_COUNT).fill(0)));
  }
  return row;
}

function SectionMetricHeads({
  section,
  accentHead,
}: {
  section: SummarySection;
  accentHead?: string;
}) {
  // Plain metric columns span whatever header rows still follow them: the caste
  // row and its M/F/T row always, plus the "Achievement" row where one exists.
  const rowSpan = section.participantGroup?.matrixHeading ? 3 : 2;
  const cell = headCell(accentHead);
  return (
    <>
      {section.metricGroup.columns.map((column) => (
        <th key={`${section.heading}-${column}`} rowSpan={rowSpan} className={cell}>
          {column}
        </th>
      ))}
      {section.participantGroup?.leadColumn && (
        <th rowSpan={rowSpan} className={cell}>
          {section.participantGroup.leadColumn}
        </th>
      )}
      {section.participantGroup?.matrixHeading ? (
        <th colSpan={DEMOGRAPHIC_LEAF_COUNT} className={cell}>
          {section.participantGroup.matrixHeading}
        </th>
      ) : (
        section.participantGroup && (
          <CasteHeads section={section} accentHead={accentHead} />
        )
      )}
    </>
  );
}

/** General / OBC / SC / ST / Total, each spanning its own M/F(/T) splits. */
function CasteHeads({
  section,
  accentHead,
}: {
  section: SummarySection;
  accentHead?: string;
}) {
  const cell = headCell(accentHead);
  return (
    <>
      {DEMOGRAPHIC_GROUPS.map((group) => (
        <th
          key={`${section.heading}-${group.label}`}
          colSpan={group.splits.length}
          className={cell}
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
function SummaryCardTable({
  card,
  sectionValues,
}: {
  card: SummaryCard;
  sectionValues?: Record<string, SectionValues>;
}) {
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
  const accent = CARD_ACCENTS[card.id];

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full border-collapse">
        <thead>
          {/*
            The accent bar lives as its own header row (spanning every real
            column) rather than a sibling <div> outside the table - a plain
            div only ever gets the *container's visible* width, so once the
            table grows wider than that (this report scrolls horizontally),
            the bar stopped short of the table's actual right edge and
            scrolling revealed uncoloured table underneath it. A <th> row
            can't fall short like that; it's laid out by the same table
            width as everything else.
          */}
          {accent && (
            <tr>
              <th
                colSpan={totalLeaves}
                className={`h-1.5 border border-border p-0 ${accent.bar}`}
              />
            </tr>
          )}
          <tr>
            {card.sections.map((section) => (
              <th
                key={section.heading}
                colSpan={sectionWidth(section)}
                className={headCell(accent?.head)}
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
                  className={headCell(accent?.head)}
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
                  accentHead={accent?.head}
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
              <SectionMetricHeads
                key={`${section.heading}-metrics`}
                section={section}
                accentHead={accent?.head}
              />
            ))}
          </tr>

          {hasMatrixRow && (
            <tr>
              {card.sections.map((section) =>
                section.participantGroup ? (
                  <CasteHeads
                    key={`${section.heading}-caste`}
                    section={section}
                    accentHead={accent?.head}
                  />
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
                        className={headCell(accent?.head)}
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
 Real counts where the column maps unambiguously to an operational
 table (OFT/FLD/Training/Extension Activity counts, trial/area
 totals). "Target" and the caste/gender demographic breakdown have no
 real data source anywhere in this schema, so those cells stay 0
 rather than fabricated - same honest-empty-state principle as
 before, just no longer blanket-applied to cells that do have real
 data.
 */}
          <tr>
            {[
              ...buildRowValues(left, sectionValues?.[`${card.id}-0`]),
              ...buildRowValues(right, sectionValues?.[`${card.id}-1`]),
            ].map((value, index) => (
              <td key={index} className={BODY_CELL}>
                {value}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function SectionGroupHeads({
  section,
  accentHead,
}: {
  section: SummarySection;
  accentHead?: string;
}) {
  const participantWidth = section.participantGroup
    ? (section.participantGroup.leadColumn ? 1 : 0) + DEMOGRAPHIC_LEAF_COUNT
    : 0;
  const cell = headCell(accentHead);
  return (
    <>
      <th colSpan={section.metricGroup.columns.length} className={cell}>
        {section.metricGroup.heading}
      </th>
      {section.participantGroup && (
        <th colSpan={participantWidth} className={cell}>
          {section.participantGroup.heading}
        </th>
      )}
    </>
  );
}

type TechnicalAchievementSummaryProps = {
  /** Shown under the year picker for a KVK Admin, whose figures cover only their own KVK. */
  scopeNote?: string;
  /** A Super Admin can scope the report to one KVK; a KVK Admin's own figures are already scoped, so they never get this picker. */
  showKvkFilter?: boolean;
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
  showKvkFilter,
}: TechnicalAchievementSummaryProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, index) =>
    String(currentYear - index),
  );
  /** Defaults to the current year (client pointer: "display the current year's data first by default"), matching OFT/FLD's own Reporting Year filter - was defaulting to blank/"Select year" before. */
  const [reportingYear, setReportingYear] = useState(String(currentYear));
  /** Empty array = "All KVKs" (client request, 2026-08-25: checkboxes + a real "Select All" instead of the old single-choice dropdown). */
  const [kvkFilter, setKvkFilter] = useState<string[]>([]);
  const [appliedYear, setAppliedYear] = useState(reportingYear);
  const [appliedKvk, setAppliedKvk] = useState(kvkFilter);
  const [sectionValues, setSectionValues] = useState<Record<string, SectionValues>>();

  useEffect(() => {
    const params = new URLSearchParams({ year: appliedYear });
    for (const name of appliedKvk) params.append("kvk", name);
    fetch(`/api/technical-achievement-summary?${params}`)
      .then((res) => res.json())
      .then((data) => setSectionValues(data.sections))
      .catch(() => setSectionValues(undefined));
  }, [appliedYear, appliedKvk]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="text-sm font-medium text-foreground">
            Reporting Year
          </label>
          <div className="mt-1">
            <select
              value={reportingYear}
              onChange={(event) => setReportingYear(event.target.value)}
              className="h-9 w-64 rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {showKvkFilter && (
          <KvkCheckboxFilter
            kvkNames={KVKS.map((kvk) => kvk.name)}
            selected={kvkFilter}
            onApply={setKvkFilter}
          />
        )}

        <Button
          size="sm"
          onClick={() => {
            setAppliedYear(reportingYear);
            setAppliedKvk(kvkFilter);
          }}
        >
          Filter
        </Button>
      </div>
      {scopeNote && (
        <p className="-mt-2 mb-4 text-xs text-muted-foreground">{scopeNote}</p>
      )}

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
          <SummaryCardTable key={card.id} card={card} sectionValues={sectionValues} />
        ))}

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th
                  colSpan={PUBLICATIONS_BLOCK.columns.length}
                  className={`h-1.5 border border-border p-0 ${PUBLICATIONS_ACCENT.bar}`}
                />
              </tr>
              <tr>
                <th
                  colSpan={PUBLICATIONS_BLOCK.columns.length}
                  className={headCell(PUBLICATIONS_ACCENT.head)}
                >
                  {PUBLICATIONS_BLOCK.heading}
                </th>
              </tr>
              <tr>
                {PUBLICATIONS_BLOCK.columns.map((column) => (
                  <th key={column} className={headCell(PUBLICATIONS_ACCENT.head)}>
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
