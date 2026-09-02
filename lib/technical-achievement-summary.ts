/**
 * Technical Achievement Summary - structure of the real report page.
 *
 * Transcribed directly from the reference app at
 * `/forms/achievements/technical-summary`. This screen is NOT a list table like the rest
 * of Form Management: it is a stack of matrix reports, each split into two
 * side-by-side sections, with up to six levels of grouped headers.
 *
 * The recurring shape in every section is a demographic breakdown -
 * General / OBC / SC / ST each split Male/Female, then a Total split
 * Male/Female/Total. That is `DEMOGRAPHIC_GROUPS` below, and it is why the
 * page is described here as data rather than hand-written markup: the same
 * eleven sub-columns repeat in eight different places.
 */

/** General/OBC/SC/ST are M+F; Total carries a third combined column. */
export const DEMOGRAPHIC_GROUPS = [
  { label: "General", splits: ["M", "F"] },
  { label: "OBC", splits: ["M", "F"] },
  { label: "SC", splits: ["M", "F"] },
  { label: "ST", splits: ["M", "F"] },
  { label: "Total", splits: ["M", "F", "T"] },
] as const;

/** Total leaf columns contributed by the demographic block (2+2+2+2+3). */
export const DEMOGRAPHIC_LEAF_COUNT = DEMOGRAPHIC_GROUPS.reduce(
  (sum, group) => sum + group.splits.length,
  0,
);

export type ParticipantGroup = {
  /** e.g. "No. of Farmers" / "Number of Participants" */
  heading: string;
  /**
   * The single plain column preceding the demographic matrix, e.g. "Farmer
   * Target". Empty where the section has none, in which case the group
   * heading sits directly above the caste columns.
   */
  leadColumn: string;
  /**
   * Extra header row above the demographic matrix, used only where a
   * leadColumn splits the group and the matrix therefore needs its own
   * label ("Achievement"). Sections without a leadColumn have no such row.
   */
  matrixHeading?: string;
};

export type SummarySection = {
  /** Top-level heading, e.g. "OFT". */
  heading: string;
  /** Second-level heading, e.g. "No. of Technologies Tested". Omitted where the real page has none. */
  subHeading?: string;
  /** The plain metric columns, e.g. "No. of OFTs" → Target / Achievement / No. of Location / No. of Trials. */
  metricGroup: { heading: string; columns: string[] };
  /** The demographic half. Omitted for sections that have none. */
  participantGroup?: ParticipantGroup;
};

/** One rendered card = two sections side by side, exactly as the real page lays them out. */
export type SummaryCard = {
  id: string;
  sections: [SummarySection, SummarySection];
};

const PARTICIPANTS = (heading: string, leadColumn: string): ParticipantGroup => ({
  heading,
  leadColumn,
  matrixHeading: leadColumn ? "Achievement" : undefined,
});

export const TECHNICAL_ACHIEVEMENT_CARDS: SummaryCard[] = [
  {
    id: "oft-fld",
    sections: [
      {
        heading: "OFT",
        subHeading: "No. of Technologies Tested",
        metricGroup: {
          heading: "No. of OFTs",
          columns: [
            "Target",
            "Achievement",
            "No. of Location",
            "No. of Trials",
          ],
        },
        participantGroup: PARTICIPANTS("No. of Farmers", "Farmer Target"),
      },
      {
        heading: "FLD",
        subHeading: "No. of Technologies Demonstrated",
        metricGroup: {
          heading: "Number of FLDs",
          columns: ["Target", "Achievement", "Area"],
        },
        participantGroup: PARTICIPANTS("Number of Farmers", "Farmer Target"),
      },
    ],
  },
  {
    id: "training-extension",
    sections: [
      {
        heading: "Training",
        metricGroup: {
          heading: "Number of Courses",
          columns: ["Target", "Achievement"],
        },
        participantGroup: PARTICIPANTS(
          "Number of Participants",
          "Farmer Target",
        ),
      },
      {
        heading: "Extension Activities",
        metricGroup: {
          heading: "Number of Activities",
          columns: ["Target", "Achievement"],
        },
        participantGroup: PARTICIPANTS(
          "Number of Participants",
          "Farmer Target",
        ),
      },
    ],
  },
  {
    id: "seed-planting",
    sections: [
      {
        heading: "Seed Production(q)*",
        metricGroup: { heading: "", columns: ["Target", "Quantity", "Value"] },
        participantGroup: PARTICIPANTS("Number of Participants", ""),
      },
      {
        heading: "Planting Material (in Lakh)*",
        metricGroup: { heading: "", columns: ["Target", "Quantity", "Value"] },
        participantGroup: PARTICIPANTS("Number of Participants", ""),
      },
    ],
  },
  {
    id: "livestock-soil",
    sections: [
      {
        heading: "Livestock Strains and Fish Fingerlings Produced (in Lakh)*",
        metricGroup: { heading: "", columns: ["Target", "Quantity", "Value"] },
        participantGroup: PARTICIPANTS("Number of Participants", ""),
      },
      {
        heading: "Soil, Water, Plants, Manures Samples Tested(in Lakh)",
        metricGroup: { heading: "", columns: ["Target", "Achievement"] },
        participantGroup: PARTICIPANTS("Number of Participants", ""),
      },
    ],
  },
];

/** The final block on the page - a plain two-column table, not a matrix. */
export const PUBLICATIONS_BLOCK = {
  heading: "4. Publications Details",
  columns: ["Publication", "No (Counts)"],
  emptyMessage: "No publication records in this period.",
} as const;

/** Width in leaf columns of one section. */
export function sectionWidth(section: SummarySection): number {
  const participantWidth = section.participantGroup
    ? (section.participantGroup.leadColumn ? 1 : 0) + DEMOGRAPHIC_LEAF_COUNT
    : 0;
  return section.metricGroup.columns.length + participantWidth;
}

export type SectionValues = { metrics: number[]; leadColumn: number; matrix: number[] };

/** Flattens one section's real values into the same leaf order sectionWidth() counts - metric columns, then the lead column (if any), then the demographic matrix (if any). Shared by the on-screen table and the PDF/Excel/Word exports so both read the same real numbers the same way. */
export function buildRowValues(section: SummarySection, values: SectionValues | undefined): number[] {
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

/** One flat, exportable column label per leaf value buildRowValues() produces, in the same order - "OFT: Target", "OFT: General M", etc. - since the PDF/Excel/Word exports render each card as a plain flat table rather than replicating the on-screen nested/merged header grid. */
export function sectionFlatColumns(section: SummarySection): string[] {
  const columns = section.metricGroup.columns.map((column) => `${section.heading}: ${column}`);
  if (section.participantGroup?.leadColumn) {
    columns.push(`${section.heading}: ${section.participantGroup.leadColumn}`);
  }
  if (section.participantGroup) {
    for (const group of DEMOGRAPHIC_GROUPS) {
      for (const split of group.splits) {
        columns.push(`${section.heading}: ${group.label} ${split}`);
      }
    }
  }
  return columns;
}
