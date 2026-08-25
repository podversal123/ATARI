import type {
  Document as DocxDocument,
  Paragraph as DocxParagraph,
  Table as DocxTable,
} from "docx";
import type { ReportSection } from "./report-data";

export type ReportWordOptions = {
  title: string;
  zoneLabel: string;
  reportingYearLabel: string;
  kvkNames: string[];
  sections: ReportSection[];
};

const GREEN = "286C4A";

/**
 * Real downloadable Word export of the same report tree the PDF/Excel
 * exports use. Every section/subsection/table title is a real Word Heading
 * (1/2/3) - Word's own Navigation Pane lets the reader click any of them to
 * jump straight there with zero setup, and a native `TableOfContents` field
 * up front gives clickable hyperlinked entries too (Word populates it with
 * real page numbers automatically the first time the file is opened /
 * printed, or instantly on "Update Field" - standard native Word behavior,
 * not something a generated .docx can pre-render).
 */
export async function generateReportWord(opts: ReportWordOptions): Promise<Blob> {
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    TableOfContents,
    PageBreak,
    Table,
    TableRow,
    TableCell,
    WidthType,
    ShadingType,
  } = await import("docx");

  const children: (DocxParagraph | DocxTable)[] = [];

  children.push(
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: opts.zoneLabel, bold: true, size: 40, color: GREEN })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "INDIAN COUNCIL OF AGRICULTURAL RESEARCH", size: 18, color: "666666" })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: "Agricultural Technology Application", bold: true, size: 24 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text: "Research Institute (ATARI)", bold: true, size: 24 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: opts.title, bold: true, size: 48, color: GREEN })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: `Reporting Year: ${opts.reportingYearLabel}`, bold: true, size: 22 })] }),
    new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: `KVKS INCLUDED (${opts.kvkNames.length})`, bold: true })] }),
    new Paragraph({ spacing: { after: 400 }, children: [new TextRun({ text: opts.kvkNames.map((n, i) => `${i + 1}. ${n}`).join("   |   ") })] }),
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Table of Contents", bold: true, size: 32 })] }),
    new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }),
    new Paragraph({ children: [new PageBreak()] }),
  );

  for (const section of opts.sections) {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 150 }, children: [new TextRun({ text: `${section.num}. ${section.title}`, color: GREEN })] }));

    for (const sub of section.subsections) {
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 }, children: [new TextRun({ text: `${sub.num}  ${sub.title}` })] }));

      for (const table of sub.tables) {
        children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 100, after: 80 }, children: [new TextRun({ text: `${table.code}  ${table.title}` })] }));

        if (table.rows.length === 0) {
          children.push(new Paragraph({ spacing: { after: 150 }, children: [new TextRun({ text: "No data available in table", italics: true, color: "999999" })] }));
          continue;
        }

        const headers = ["S.No.", ...table.columns.map((c) => c.label)];
        const headerRow = new TableRow({
          tableHeader: true,
          children: headers.map(
            (label) =>
              new TableCell({
                shading: { type: ShadingType.SOLID, color: "F2F2F2", fill: "F2F2F2" },
                children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 16 })] })],
              }),
          ),
        });
        const dataRows = table.rows.map(
          (row, i) =>
            new TableRow({
              children: [String(i + 1), ...table.columns.map((c) => row[c.key] ?? "")].map(
                (v) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: v, size: 16 })] })] }),
              ),
            }),
        );

        children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...dataRows] }));
        children.push(new Paragraph({ spacing: { after: 150 }, text: "" }));
      }
    }
  }

  const doc: DocxDocument = new Document({
    sections: [{ properties: {}, children }],
    styles: { default: { document: { run: { size: 20 } } } },
  });

  return Packer.toBlob(doc);
}
