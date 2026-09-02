import type ExcelJS from "exceljs";
import {
  PUBLICATIONS_BLOCK,
  TECHNICAL_ACHIEVEMENT_CARDS,
  buildRowValues,
  sectionFlatColumns,
  type SectionValues,
} from "./technical-achievement-summary";

const TITLE = "Technical Achievement Summary";
const GREEN: [number, number, number] = [40, 108, 74];
const BORDER_GRAY: [number, number, number] = [190, 190, 190];

/** Field:Value pairs per printed row - the real report only ever has one data row per card (an aggregate total), so a wide 20-40 column single-row table wraps every long header into an unreadable letter-by-letter staircase. Laying it out as Field/Value pairs instead reads cleanly in all three formats; 2 pairs per row keeps it compact without cramming. */
const PAIRS_PER_ROW = 2;

export type TechnicalAchievementExportMeta = {
  reportingYear: string;
  /** KVK Admin's own scope note ("Figures for KVK X"), or the Super Admin's KVK filter summary - printed under the title so a downloaded file still shows what it was scoped to. */
  scopeNote?: string;
};

type ExportTable = { title: string; columns: string[]; values: (string | number)[] };

/** One table per card (both its side-by-side sections concatenated, column labels prefixed by section heading), plus a note-only Publications block - same real numbers as the on-screen report. */
function buildExportTables(sectionValues: Record<string, SectionValues> | undefined): ExportTable[] {
  return TECHNICAL_ACHIEVEMENT_CARDS.map((card) => {
    const [left, right] = card.sections;
    return {
      title: `${left.heading} / ${right.heading}`,
      columns: [...sectionFlatColumns(left), ...sectionFlatColumns(right)],
      values: [
        ...buildRowValues(left, sectionValues?.[`${card.id}-0`]),
        ...buildRowValues(right, sectionValues?.[`${card.id}-1`]),
      ],
    };
  });
}

/** Reflows one table's flat (columns, values) into fixed-width rows of `[field, value, field, value, ...]`, padding the last row with blanks if the count is odd. */
function pairedRows(table: ExportTable): string[][] {
  const rows: string[][] = [];
  for (let i = 0; i < table.columns.length; i += PAIRS_PER_ROW) {
    const row: string[] = [];
    for (let p = 0; p < PAIRS_PER_ROW; p++) {
      const idx = i + p;
      row.push(idx < table.columns.length ? table.columns[idx] : "");
      row.push(idx < table.columns.length ? String(table.values[idx]) : "");
    }
    rows.push(row);
  }
  return rows;
}

function pairedHeader(): string[] {
  const header: string[] = [];
  for (let p = 0; p < PAIRS_PER_ROW; p++) header.push("Field", "Value");
  return header;
}

function metaLines(meta: TechnicalAchievementExportMeta): string[] {
  const lines = [`Reporting Year: ${meta.reportingYear}`];
  if (meta.scopeNote) lines.push(meta.scopeNote);
  return lines;
}

function fileBaseName(meta: TechnicalAchievementExportMeta): string {
  return `${TITLE} - ${meta.reportingYear}`;
}

export async function downloadTechnicalAchievementPdf(
  meta: TechnicalAchievementExportMeta,
  sectionValues: Record<string, SectionValues> | undefined,
) {
  const { jsPDF } = await import("jspdf");
  const autoTableModule = await import("jspdf-autotable");
  const autoTable = autoTableModule.default;

  const doc = new jsPDF({ orientation: "landscape" });
  doc.setProperties({ title: TITLE });

  function drawPageBorder() {
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    doc.setDrawColor(...BORDER_GRAY);
    doc.setLineWidth(0.4);
    doc.rect(6, 6, pageW - 12, pageH - 12);
  }

  drawPageBorder();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...GREEN);
  doc.text(TITLE, 14, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(metaLines(meta).join("   |   "), 14, 20);

  const pageH = doc.internal.pageSize.getHeight();
  let cursorY = 26;
  const tables = buildExportTables(sectionValues);

  for (const table of tables) {
    if (cursorY > pageH - 30) {
      doc.addPage();
      drawPageBorder();
      cursorY = 16;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(table.title, 14, cursorY);
    cursorY += 4;

    autoTable(doc, {
      startY: cursorY,
      margin: { left: 10, right: 10 },
      head: [pairedHeader()],
      body: pairedRows(table),
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 1.5, lineColor: BORDER_GRAY, lineWidth: 0.15, textColor: [0, 0, 0] },
      headStyles: { fillColor: GREEN, textColor: [255, 255, 255], fontStyle: "bold", lineColor: BORDER_GRAY, lineWidth: 0.15, fontSize: 8 },
      columnStyles: { 0: { fontStyle: "bold" }, 2: { fontStyle: "bold" } },
      didDrawPage: () => drawPageBorder(),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cursorY = (doc as any).lastAutoTable.finalY + 10;
  }

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(140, 140, 140);
  if (cursorY > pageH - 20) {
    doc.addPage();
    drawPageBorder();
    cursorY = 16;
  }
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(PUBLICATIONS_BLOCK.heading, 14, cursorY);
  cursorY += 5;
  doc.setFont("helvetica", "italic");
  doc.setTextColor(140, 140, 140);
  doc.setFontSize(9);
  doc.text(PUBLICATIONS_BLOCK.emptyMessage, 14, cursorY);

  doc.save(`${fileBaseName(meta)}.pdf`);
}

export async function generateTechnicalAchievementExcel(
  meta: TechnicalAchievementExportMeta,
  sectionValues: Record<string, SectionValues> | undefined,
) {
  const ExcelJSModule = (await import("exceljs")).default;
  const wb = new ExcelJSModule.Workbook();
  wb.creator = "ATARI AMS";
  wb.created = new Date();
  wb.title = TITLE;

  const sheet = wb.addWorksheet("Technical Achievement");
  sheet.getCell("A1").value = TITLE;
  sheet.getCell("A1").font = { bold: true, size: 14, color: { argb: "FF286C4A" } };
  metaLines(meta).forEach((line, i) => {
    sheet.getCell(`A${2 + i}`).value = line;
    sheet.getCell(`A${2 + i}`).font = { italic: true, color: { argb: "FF555555" } };
  });

  let row = 2 + metaLines(meta).length + 1;
  const border: Partial<ExcelJS.Border> = { style: "thin", color: { argb: "FF888888" } };
  const cellBorder: Partial<ExcelJS.Borders> = { top: border, left: border, bottom: border, right: border };
  const header = pairedHeader();

  for (const table of buildExportTables(sectionValues)) {
    sheet.getCell(`A${row}`).value = table.title;
    sheet.getCell(`A${row}`).font = { bold: true };
    row += 1;

    const headerRow = sheet.getRow(row);
    header.forEach((label, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = label;
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF286C4A" } };
      cell.border = cellBorder;
    });
    row += 1;

    for (const dataRowValues of pairedRows(table)) {
      const dataRow = sheet.getRow(row);
      dataRowValues.forEach((value, i) => {
        const cell = dataRow.getCell(i + 1);
        cell.value = value;
        cell.border = cellBorder;
        if (i % 2 === 0) cell.font = { bold: true };
      });
      row += 1;
    }
    row += 1;
  }

  sheet.getCell(`A${row}`).value = PUBLICATIONS_BLOCK.heading;
  sheet.getCell(`A${row}`).font = { bold: true };
  row += 1;
  sheet.getCell(`A${row}`).value = PUBLICATIONS_BLOCK.emptyMessage;
  sheet.getCell(`A${row}`).font = { italic: true, color: { argb: "FF999999" } };

  sheet.columns.forEach((col, i) => {
    col.width = i % 2 === 0 ? 34 : 12;
  });

  return wb;
}

export async function generateTechnicalAchievementWord(
  meta: TechnicalAchievementExportMeta,
  sectionValues: Record<string, SectionValues> | undefined,
) {
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle } =
    await import("docx");

  const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: "888888" };
  const tableBorders = {
    top: cellBorder,
    bottom: cellBorder,
    left: cellBorder,
    right: cellBorder,
    insideHorizontal: cellBorder,
    insideVertical: cellBorder,
  };

  const children: (InstanceType<typeof Paragraph> | InstanceType<typeof Table>)[] = [
    new Paragraph({
      spacing: { after: 100 },
      children: [new TextRun({ text: TITLE, bold: true, size: 32, color: "286C4A" })],
    }),
    ...metaLines(meta).map(
      (line) =>
        new Paragraph({
          spacing: { after: 100 },
          children: [new TextRun({ text: line, italics: true, size: 18, color: "555555" })],
        }),
    ),
  ];

  const header = pairedHeader();

  for (const table of buildExportTables(sectionValues)) {
    children.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [new TextRun({ text: table.title, bold: true, size: 22 })],
      }),
    );
    const headerRow = new TableRow({
      tableHeader: true,
      children: header.map(
        (label) =>
          new TableCell({
            shading: { type: ShadingType.SOLID, color: "286C4A", fill: "286C4A" },
            children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 16, color: "FFFFFF" })] })],
          }),
      ),
    });
    const dataRows = pairedRows(table).map(
      (rowValues) =>
        new TableRow({
          children: rowValues.map(
            (value, i) =>
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: value, bold: i % 2 === 0, size: 16 })] })],
              }),
          ),
        }),
    );
    children.push(
      new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: tableBorders, rows: [headerRow, ...dataRows] }),
    );
  }

  children.push(
    new Paragraph({
      spacing: { before: 200, after: 100 },
      children: [new TextRun({ text: PUBLICATIONS_BLOCK.heading, bold: true, size: 22 })],
    }),
    new Paragraph({
      children: [new TextRun({ text: PUBLICATIONS_BLOCK.emptyMessage, italics: true, size: 18, color: "999999" })],
    }),
  );

  const doc = new Document({
    title: TITLE,
    creator: "ATARI AMS",
    sections: [{ properties: {}, children }],
    styles: { default: { document: { run: { size: 20 } } } },
  });

  return Packer.toBlob(doc);
}
