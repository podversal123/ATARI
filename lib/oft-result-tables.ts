/**
 * "Dynamic Result Tables" on the real Edit OFT Result page
 * (atari-client.vercel.app, confirmed 2026-09-02) - a user-defined set of
 * tables, each with its own column names and rows, both freely
 * addable/removable ("Add Table"/"Add Column"/"Add Row"). Stored as one
 * JSON string on Oft.resultTablesJson rather than a fixed relational shape,
 * since the columns themselves aren't fixed.
 */
export type OftResultTable = {
  name: string;
  columns: string[];
  rows: string[][];
};

export const DEFAULT_RESULT_COLUMNS = ["Technology options with detailed treatment", "Proposed", "Actual"];

/** First table pre-seeded from the OFT's own Technology Options (Farmer Practice, TO1, ...) so the two sections stay in sync on first open - confirmed against the real reference showing exactly these labels already filled into column 1. */
export function defaultResultTables(technologyOptionLabels: string[]): OftResultTable[] {
  const labels = technologyOptionLabels.length > 0 ? technologyOptionLabels : ["Farmer Practice"];
  return [
    {
      name: "Table 1",
      columns: [...DEFAULT_RESULT_COLUMNS],
      rows: labels.map((label) => [label, ...Array(DEFAULT_RESULT_COLUMNS.length - 1).fill("")]),
    },
  ];
}

export function parseResultTables(raw: string | null | undefined, technologyOptionLabels: string[]): OftResultTable[] {
  if (!raw) return defaultResultTables(technologyOptionLabels);
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultResultTables(technologyOptionLabels);
    return parsed.filter(
      (t): t is OftResultTable =>
        typeof t?.name === "string" && Array.isArray(t?.columns) && Array.isArray(t?.rows),
    );
  } catch {
    return defaultResultTables(technologyOptionLabels);
  }
}
