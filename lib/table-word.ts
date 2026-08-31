import type { ReactNode } from "react";
import type { MasterColumn } from "./navigation";

const GREEN = "286C4A";

/** Real downloadable Word export of a Masters/Form Management list table - same styling convention as the multi-section report export (lib/report-word.ts), for a single flat table instead of a whole report tree. */
export async function generateTableWord(
  title: string,
  columns: MasterColumn[],
  rows: Record<string, ReactNode>[] | undefined,
): Promise<Blob> {
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle } =
    await import("docx");

  const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: "888888" };
  const tableBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder, insideHorizontal: cellBorder, insideVertical: cellBorder };

  const headers = ["S.No", ...columns.map((c) => c.label)];
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(
      (label) =>
        new TableCell({
          shading: { type: ShadingType.SOLID, color: "F2F2F2", fill: "F2F2F2" },
          children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 18 })] })],
        }),
    ),
  });
  const dataRows = (rows ?? []).map(
    (row, i) =>
      new TableRow({
        children: [
          String(i + 1),
          ...columns.map((c) => {
            const value = row[c.key];
            return typeof value === "string" || typeof value === "number" ? String(value) : "";
          }),
        ].map((v) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: v, size: 18 })] })] })),
      }),
  );

  const doc = new Document({
    title,
    creator: "ATARI AMS",
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: title, bold: true, size: 32, color: GREEN })] }),
          (rows ?? []).length === 0
            ? new Paragraph({ children: [new TextRun({ text: "No data available in table", italics: true, color: "999999" })] })
            : new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: tableBorders, rows: [headerRow, ...dataRows] }),
        ],
      },
    ],
    styles: { default: { document: { run: { size: 20 } } } },
  });

  return Packer.toBlob(doc);
}
