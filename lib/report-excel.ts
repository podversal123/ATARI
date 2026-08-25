import type ExcelJS from "exceljs";
import type { ReportSection } from "./report-data";

export type ReportExcelOptions = {
  title: string;
  zoneLabel: string;
  reportingYearLabel: string;
  kvkNames: string[];
  sections: ReportSection[];
};

const GREEN = "FF286C4A";
const LIGHT_GRAY = "FFF2F2F2";
const BORDER: Partial<ExcelJS.Border> = { style: "thin", color: { argb: "FF888888" } };
const CELL_BORDER: Partial<ExcelJS.Borders> = { top: BORDER, left: BORDER, bottom: BORDER, right: BORDER };

/** Excel sheet names can't exceed 31 chars or contain : \ / ? * [ ] */
function sheetName(raw: string) {
  return raw.replace(/[:\\/?*[\]]/g, "-").slice(0, 31);
}

/**
 * Real downloadable Excel export of the same report tree the PDF/Word
 * exports use - one worksheet per top-level section (mirrors the PDF's
 * one-page-per-section chapters), a "Contents" sheet with real internal
 * hyperlinks jumping to each section's sheet, and a "Back to Contents" link
 * at the top of every section sheet - Excel's own native equivalent of the
 * PDF's clickable Table of Contents.
 */
export async function generateReportExcel(opts: ReportExcelOptions): Promise<ExcelJS.Workbook> {
  const ExcelJSModule = (await import("exceljs")).default;
  const wb = new ExcelJSModule.Workbook();
  wb.creator = "ATARI AMS";
  wb.created = new Date();

  const contents = wb.addWorksheet("Contents");
  contents.columns = [{ width: 6 }, { width: 60 }];
  contents.mergeCells("A1:B1");
  contents.getCell("A1").value = opts.zoneLabel;
  contents.getCell("A1").font = { bold: true, size: 16, color: { argb: GREEN } };
  contents.mergeCells("A2:B2");
  contents.getCell("A2").value = opts.title;
  contents.getCell("A2").font = { bold: true, size: 13 };
  contents.mergeCells("A3:B3");
  contents.getCell("A3").value = `Reporting Year: ${opts.reportingYearLabel}`;
  contents.getCell("A3").font = { italic: true, size: 10, color: { argb: "FF555555" } };
  contents.mergeCells("A4:B4");
  contents.getCell("A4").value = `KVKs Included (${opts.kvkNames.length}): ${opts.kvkNames.join(", ")}`;
  contents.getCell("A4").alignment = { wrapText: true };
  contents.getRow(4).height = 45;

  let contentsRow = 6;
  contents.getCell(`A${contentsRow}`).value = "Table of Contents";
  contents.getCell(`A${contentsRow}`).font = { bold: true, size: 12 };
  contentsRow += 1;

  const usedSheetNames = new Set<string>(["Contents"]);

  for (const section of opts.sections) {
    let name = sheetName(`${section.num} ${section.title}`);
    let suffix = 2;
    while (usedSheetNames.has(name)) {
      name = sheetName(`${section.num} ${section.title}`).slice(0, 28) + "-" + suffix;
      suffix += 1;
    }
    usedSheetNames.add(name);

    contents.getCell(`A${contentsRow}`).value = section.num;
    contents.getCell(`B${contentsRow}`).value = { text: section.title, hyperlink: `#'${name}'!A1` };
    contents.getCell(`B${contentsRow}`).font = { color: { argb: "FF1155CC" }, underline: true, bold: true };
    contentsRow += 1;
    for (const sub of section.subsections) {
      contents.getCell(`B${contentsRow}`).value = { text: `  ${sub.num}  ${sub.title}`, hyperlink: `#'${name}'!A1` };
      contents.getCell(`B${contentsRow}`).font = { color: { argb: "FF1155CC" }, underline: true };
      contentsRow += 1;
    }

    const sheet = wb.addWorksheet(name);
    sheet.getCell("A1").value = { text: "← Back to Contents", hyperlink: "#'Contents'!A1" };
    sheet.getCell("A1").font = { color: { argb: "FF1155CC" }, underline: true, italic: true, size: 9 };

    sheet.getCell("A3").value = `${section.num}. ${section.title}`;
    sheet.getCell("A3").font = { bold: true, size: 14, color: { argb: GREEN } };
    let r = 5;

    for (const sub of section.subsections) {
      sheet.getCell(`A${r}`).value = `${sub.num}  ${sub.title}`;
      sheet.getCell(`A${r}`).font = { bold: true, size: 12 };
      r += 2;

      for (const table of sub.tables) {
        sheet.getCell(`A${r}`).value = `${table.code}  ${table.title}`;
        sheet.getCell(`A${r}`).font = { bold: true, size: 10, color: { argb: "FF333333" } };
        r += 1;

        if (table.rows.length === 0) {
          sheet.getCell(`A${r}`).value = "No data available in table";
          sheet.getCell(`A${r}`).font = { italic: true, size: 9, color: { argb: "FF999999" } };
          r += 2;
          continue;
        }

        const headerRow = sheet.getRow(r);
        const headers = ["S.No.", ...table.columns.map((c) => c.label)];
        headers.forEach((label, i) => {
          const cell = headerRow.getCell(i + 1);
          cell.value = label;
          cell.font = { bold: true };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT_GRAY } };
          cell.border = CELL_BORDER;
        });
        r += 1;

        table.rows.forEach((row, i) => {
          const dataRow = sheet.getRow(r);
          const values = [String(i + 1), ...table.columns.map((c) => row[c.key] ?? "")];
          values.forEach((v, ci) => {
            const cell = dataRow.getCell(ci + 1);
            cell.value = v;
            cell.border = CELL_BORDER;
          });
          r += 1;
        });
        r += 1;

        headers.forEach((label, i) => {
          const col = sheet.getColumn(i + 1);
          const maxLen = Math.max(label.length, ...table.rows.map((row) => String(i === 0 ? "" : row[table.columns[i - 1]?.key ?? ""] ?? "").length));
          col.width = Math.max(col.width ?? 10, Math.min(maxLen + 2, 45));
        });
      }
    }
  }

  return wb;
}
