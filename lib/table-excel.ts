import type ExcelJS from "exceljs";
import type { ReactNode } from "react";
import type { MasterColumn } from "./navigation";

const GREEN = "FF286C4A";
const LIGHT_GRAY = "FFF2F2F2";
const BORDER: Partial<ExcelJS.Border> = { style: "thin", color: { argb: "FF888888" } };
const CELL_BORDER: Partial<ExcelJS.Borders> = { top: BORDER, left: BORDER, bottom: BORDER, right: BORDER };

/** Real downloadable Excel export of a Masters/Form Management list table - same styling convention as the multi-section report export (lib/report-excel.ts), for a single flat table instead of a whole report tree. */
export async function generateTableExcel(
  title: string,
  columns: MasterColumn[],
  rows: Record<string, ReactNode>[] | undefined,
): Promise<ExcelJS.Workbook> {
  const ExcelJSModule = (await import("exceljs")).default;
  const wb = new ExcelJSModule.Workbook();
  wb.creator = "ATARI AMS";
  wb.created = new Date();

  const sheet = wb.addWorksheet(title.replace(/[:\\/?*[\]]/g, "-").slice(0, 31) || "Sheet1");
  sheet.getCell("A1").value = title;
  sheet.getCell("A1").font = { bold: true, size: 14, color: { argb: GREEN } };

  const headers = ["S.No", ...columns.map((c) => c.label)];
  const headerRow = sheet.getRow(3);
  headers.forEach((label, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = label;
    cell.font = { bold: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT_GRAY } };
    cell.border = CELL_BORDER;
  });

  (rows ?? []).forEach((row, i) => {
    const dataRow = sheet.getRow(4 + i);
    const values = [
      String(i + 1),
      ...columns.map((c) => {
        const value = row[c.key];
        return typeof value === "string" || typeof value === "number" ? value : "";
      }),
    ];
    values.forEach((v, ci) => {
      const cell = dataRow.getCell(ci + 1);
      cell.value = v;
      cell.border = CELL_BORDER;
    });
  });

  headers.forEach((label, i) => {
    const col = sheet.getColumn(i + 1);
    col.width = Math.max(label.length + 2, 12);
  });

  return wb;
}
