/**
 * Shared, dependency-free report shapes and helpers. Kept separate from
 * lib/report-data.ts (which is `server-only` and pulls in Prisma) so the
 * client report preview and the PDF/Excel/Word renderers - all of which run
 * in the browser bundle - can import the types and pure helpers without
 * dragging the server data layer along.
 */

export type ReportScope = { kvkId?: string; zoneId: string };

export type ReportCell = Record<string, string>;

/**
 * `groups` are the column's ancestor header cells, outermost first; its own
 * `label` is the bottom (leaf) header row. Consecutive columns that share a
 * `groups` prefix merge into one spanning cell at each level, and a column
 * with fewer `groups` than the deepest gets its leaf cell row-spanned down.
 * This is what super-v2-prod.pdf's pivots need - e.g. a farmer-count column
 * carries `groups: ["No. of Farmers", "Achievement", "General"]` with
 * `label: "M"` for a 4-row header, while "Telephone" over "Office"/"FAX" is
 * just `groups: ["Telephone"]`.
 */
export type ReportColumn = { key: string; label: string; groups?: string[] };

export type HeaderCell = { text: string; colSpan: number; rowSpan: number };

/**
 * Builds the N-row header matrix for a column list (shared by every
 * renderer). `serialLabel`, when given, prepends an S.No.-style column that
 * spans all header rows.
 */
export function buildHeaderMatrix(columns: ReportColumn[], serialLabel?: string): HeaderCell[][] {
  const paths = columns.map((c) => [...(c.groups ?? []), c.label]);
  const depth = Math.max(1, ...paths.map((p) => p.length));
  const rows: HeaderCell[][] = Array.from({ length: depth }, () => []);
  if (serialLabel !== undefined) rows[0].push({ text: serialLabel, colSpan: 1, rowSpan: depth });

  const samePrefix = (a: string[], b: string[], upto: number) => {
    for (let k = 0; k <= upto; k++) if (a[k] !== b[k]) return false;
    return true;
  };

  for (let r = 0; r < depth; r++) {
    let i = 0;
    while (i < columns.length) {
      const path = paths[i];
      if (r >= path.length) {
        i += 1;
        continue;
      }
      if (r === path.length - 1) {
        rows[r].push({ text: path[r], colSpan: 1, rowSpan: depth - r });
        i += 1;
      } else {
        let j = i + 1;
        while (j < columns.length && r < paths[j].length && samePrefix(paths[j], path, r)) j += 1;
        rows[r].push({ text: path[r], colSpan: j - i, rowSpan: 1 });
        i = j;
      }
    }
  }
  return rows;
}

/** A plain grid - the default table body, and the shape of each part inside a composite block. */
export type ReportGrid = {
  /** Optional small heading above just this grid (e.g. "Table 1" inside a KVK-wise OFT block). */
  caption?: string;
  columns: ReportColumn[];
  rows: ReportCell[];
  /** A bold trailing row (e.g. Land Details' "Total", OFT Summary's "Grand Total") - keyed like a data row, rendered without an S.No. */
  totalRow?: ReportCell;
  /** Suppress the auto "S.No." lead column (a few reference tables carry their own serial or none). */
  noSerial?: boolean;
  /** Render the header even with no rows, and skip the "No data available" note - super-v2-prod.pdf's empty "Table 2" result grids print as a bare header. */
  keepEmpty?: boolean;
};

export type ReportPairList = {
  caption?: string;
  /** An ordered label/value list, `num` optionally prefixing the label ("1.", "2." ...) - the 18-point OFT detail layout. */
  pairs: { num?: string; label: string; value: string }[];
  /** Render each pair as a flowing "label value" line (bold label) rather than a two-column table - super-v2-prod.pdf's 2.2.C "Result:" / "Remark:" lines. */
  flow?: boolean;
};

export type ReportBlockPart =
  | ({ kind: "grid" } & ReportGrid)
  | ({ kind: "pairs" } & ReportPairList);

/** One repeated per-entity block (e.g. "KVK Bokaro", or a single OFT) inside a composite table. */
export type ReportBlock = {
  heading: string;
  /** Centre the heading, no body - super-v2-prod.pdf prints the KVK name this way once above a run of that KVK's OFT blocks in 2.2.C. */
  align?: "center";
  /** Free-form lines under the heading (e.g. "• Thematic area: Horticulture"). */
  notes?: string[];
  parts: ReportBlockPart[];
};

/**
 * One entry in the report tree. A table is normally a grid (`columns` +
 * `rows`); when `blocks` or `pairs` is set instead, those drive the render
 * and `columns`/`rows` are ignored. `groupCode`/`groupTitle`, when present,
 * add the intermediate heading super-v2-prod.pdf prints once above a run of
 * sibling sub-tables (e.g. "1.1.A KVKs Details" above "1.1.A.1 ..." /
 * "1.1.A.2 ..."), and the Table of Contents links to that instead of each
 * sub-table.
 */
export type ReportTable = {
  code: string;
  title: string;
  groupCode?: string;
  groupTitle?: string;
  columns: ReportColumn[];
  rows: ReportCell[];
  totalRow?: ReportCell;
  noSerial?: boolean;
  blocks?: ReportBlock[];
  pairs?: ReportPairList["pairs"];
};

/**
 * A Module Image attached to a report subsection. Images are collected from
 * every Form Management leaf whose `categoryPath` maps into this subsection
 * (see lib/report-section-map.ts) - the client's real "Module Images" flow -
 * even though super-v2-prod.pdf's own text export does not embed them.
 * `url` is the file-proxy path; renderers that must embed bytes (PDF / Word /
 * Excel) fetch it, the HTML preview uses it as an <img src> directly.
 */
export type ReportImage = { url: string; caption: string; category: string; year?: number; date?: string };

export type ReportSubsection = { num: string; title: string; tables: ReportTable[]; images?: ReportImage[] };
export type ReportSection = { num: string; title: string; subsections: ReportSubsection[] };

/**
 * A subsection with exactly one table whose code/title exactly repeat the
 * subsection's own (e.g. "6.1 SAC Meetings" holding one table also called
 * "SAC Meetings") gets a single heading line, not two - super-v2-prod.pdf's
 * own TOC and body print one line for these. Shared by every renderer.
 */
export function isRedundantTableHeading(
  sub: { num: string; title: string },
  table: { code: string; title: string },
) {
  return table.code === sub.num && table.title === sub.title;
}

/**
 * The fixed "Without NF practice / With NF practice" comparison rows the real
 * report prints for every farmer in "3.5.C Demonstration Information" and
 * "3.5.D Farmers Practicing" (super-v2-prod.pdf p.66-74) - transcribed from
 * the reference, in its order. Stored per record as a JSON object keyed by
 * `key` (`{ [key]: { without, with } }`) on NfDemonstrationInfo.parameters /
 * NfAlreadyPracticing.parameters. Shared by the form field, the report
 * builders and the Edit round-trip so they can never drift.
 */
export const NF_COMPARISON_PARAMETERS: { key: string; label: string }[] = [
  { key: "plantHeight", label: "Plant height (cm)" },
  { key: "otherParameter", label: "Other relevant parameter" },
  { key: "yield", label: "Yield (q/ha)" },
  { key: "costOfCultivation", label: "Cost of cultivation (Rs/ha)" },
  { key: "grossReturn", label: "Gross Return (Rs/ha)" },
  { key: "netReturn", label: "Net Return (Rs/ha)" },
  { key: "bcRatio", label: "B:C Ratio" },
  { key: "soilPh", label: "Soil PH" },
  { key: "soilOc", label: "Soil OC (%)" },
  { key: "soilEc", label: "Soil EC (dS/m)" },
  { key: "availableN", label: "Available N (Kg/ha)" },
  { key: "availableP", label: "Available P (Kg/ha)" },
  { key: "availableK", label: "Available K (Kg/ha)" },
  { key: "soilMicrobes", label: "Soil Microbes (cfu)" },
  { key: "anyOther", label: "Any other, specify" },
];

/** Rows a table contributes to the preview's "Total Records" count - grid rows plus every grid part inside its blocks. */
export function reportTableRowCount(table: ReportTable): number {
  if (table.blocks) {
    return table.blocks.reduce(
      (sum, block) =>
        sum +
        block.parts.reduce((s, part) => s + (part.kind === "grid" ? part.rows.length : 0), 0),
      0,
    );
  }
  if (table.pairs) return table.pairs.length > 0 ? 1 : 0;
  return table.rows.length;
}
