import type {
  Document as DocxDocument,
  Paragraph as DocxParagraph,
  Table as DocxTable,
} from "docx";
import {
  isRedundantTableHeading,
  type ReportGrid,
  type ReportSection,
  type ReportTable,
} from "./report-types";

export type ReportWordOptions = {
  title: string;
  zoneLabel: string;
  reportingYearLabel: string;
  kvkNames: string[];
  sections: ReportSection[];
  /** Module-Image url -> data-URL, pre-fetched by the caller. */
  images?: Map<string, string>;
};

/** Strips a data-URL prefix to the raw base64 payload docx's ImageRun wants. */
function dataUrlToBytes(dataUrl: string): Uint8Array {
  const b64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const GREEN = "286C4A";

/**
 * Real downloadable Word export of the same report tree the PDF/Excel
 * exports use. Every section/subsection/table title is a real Word Heading
 * (1/2/3) so Word's Navigation Pane and the native `TableOfContents` field
 * both jump straight there. Grids render as Word tables (grouped columns
 * flatten to "Group - Label"); composite blocks and pair lists render as
 * their own heading + inner tables.
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
    ImageRun,
  } = await import("docx");

  const children: (DocxParagraph | DocxTable)[] = [];

  function gridChildren(grid: ReportGrid): (DocxParagraph | DocxTable)[] {
    const out: (DocxParagraph | DocxTable)[] = [];
    const serial = !grid.noSerial;

    for (const line of grid.caption ? grid.caption.split("\n") : []) {
      out.push(new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: line, bold: true, size: 18 })] }));
    }

    if (grid.rows.length === 0 && !grid.totalRow && !grid.keepEmpty) {
      out.push(new Paragraph({ spacing: { after: 150 }, children: [new TextRun({ text: "No data available in table", italics: true, color: "999999" })] }));
      return out;
    }

    const headers = [
      ...(serial ? ["S.No."] : []),
      ...grid.columns.map((c) => [...(c.groups ?? []), c.label].join(" - ")),
    ];
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
    const dataRows = grid.rows.map(
      (row, i) =>
        new TableRow({
          children: [...(serial ? [String(i + 1)] : []), ...grid.columns.map((c) => row[c.key] ?? "")].map(
            (v) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: v, size: 16 })] })] }),
          ),
        }),
    );
    const rows = [headerRow, ...dataRows];
    if (grid.totalRow) {
      rows.push(
        new TableRow({
          children: [...(serial ? [""] : []), ...grid.columns.map((c) => grid.totalRow![c.key] ?? "")].map(
            (v) =>
              new TableCell({
                shading: { type: ShadingType.SOLID, color: "EBEBEB", fill: "EBEBEB" },
                children: [new Paragraph({ children: [new TextRun({ text: v, bold: true, size: 16 })] })],
              }),
          ),
        }),
      );
    }

    out.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
    out.push(new Paragraph({ spacing: { after: 150 }, text: "" }));
    return out;
  }

  function pairChildren(
    pairs: { num?: string; label: string; value: string }[],
    caption?: string,
    flow?: boolean,
  ): (DocxParagraph | DocxTable)[] {
    const out: (DocxParagraph | DocxTable)[] = [];
    for (const line of caption ? caption.split("\n") : []) {
      out.push(new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: line, bold: true, size: 18 })] }));
    }
    if (flow) {
      for (const pair of pairs) {
        out.push(new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: `${pair.label} `, bold: true, italics: true, size: 16 }),
            new TextRun({ text: pair.value, size: 16 }),
          ],
        }));
      }
      return out;
    }
    const rows = pairs.map(
      (pair) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.SOLID, color: "F7F7F7", fill: "F7F7F7" },
              children: [new Paragraph({ children: [new TextRun({ text: pair.num ? `${pair.num} ${pair.label}` : pair.label, bold: true, size: 16 })] })],
            }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: pair.value, size: 16 })] })] }),
          ],
        }),
    );
    out.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
    out.push(new Paragraph({ spacing: { after: 150 }, text: "" }));
    return out;
  }

  function tableBodyChildren(table: ReportTable): (DocxParagraph | DocxTable)[] {
    if (table.blocks) {
      const out: (DocxParagraph | DocxTable)[] = [];
      for (const block of table.blocks) {
        const centered = block.align === "center" && block.parts.length === 0;
        out.push(new Paragraph({
          alignment: centered ? AlignmentType.CENTER : undefined,
          spacing: { before: centered ? 200 : 120, after: centered ? 120 : 80 },
          children: [new TextRun({ text: block.heading, bold: true, size: centered ? 26 : 22 })],
        }));
        for (const note of block.notes ?? []) {
          out.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: note, size: 16, color: "555555" })] }));
        }
        for (const part of block.parts) {
          out.push(...(part.kind === "grid" ? gridChildren(part) : pairChildren(part.pairs, part.caption, part.flow)));
        }
      }
      return out;
    }
    if (table.pairs) return pairChildren(table.pairs);
    return gridChildren(table);
  }

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

      let lastGroupCode: string | null = null;
      for (const table of sub.tables) {
        if (table.groupCode && table.groupCode !== lastGroupCode) {
          children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 100, after: 60 }, children: [new TextRun({ text: `${table.groupCode}  ${table.groupTitle ?? ""}` })] }));
          lastGroupCode = table.groupCode;
        }
        if (!table.groupCode) lastGroupCode = null;

        if (!isRedundantTableHeading(sub, table)) {
          children.push(
            new Paragraph({
              heading: table.groupCode ? HeadingLevel.HEADING_4 : HeadingLevel.HEADING_3,
              spacing: { before: 100, after: 80 },
              children: [new TextRun({ text: `${table.code}  ${table.title}` })],
            }),
          );
        }

        children.push(...tableBodyChildren(table));
      }

      const imgs = (sub.images ?? []).filter((im) => opts.images?.has(im.url));
      if (imgs.length > 0) {
        children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 120, after: 60 }, children: [new TextRun({ text: "Module Images" })] }));
        for (const im of imgs) {
          try {
            const data = opts.images!.get(im.url)!;
            const type = /^data:image\/(png|jpe?g|gif|bmp)/i.exec(data)?.[1]?.toLowerCase().replace("jpeg", "jpg") ?? "jpg";
            children.push(
              new Paragraph({
                spacing: { after: 20 },
                children: [new ImageRun({ data: dataUrlToBytes(data), type: type as "png" | "jpg" | "gif" | "bmp", transformation: { width: 340, height: 210 } })],
              }),
            );
          } catch {
            // Skip an image that fails to decode rather than aborting the whole doc.
          }
          children.push(new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: im.caption + (im.date ? ` (${im.date})` : ""), size: 16, color: "555555" })] }));
        }
      }
    }
  }

  const doc: DocxDocument = new Document({
    sections: [{ properties: {}, children }],
    styles: { default: { document: { run: { size: 20 } } } },
  });

  return Packer.toBlob(doc);
}
