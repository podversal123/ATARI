import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { ReactNode } from "react";
import type { MasterColumn } from "./navigation";

/**
 * Real PDF generated client-side from whatever rows are currently on
 * screen - no backend yet, so there is nothing to fetch a server-rendered
 * report from, but the "PDF" button itself should be a real, clickable
 * download rather than a decorative one (client request, 2026-08-24).
 * Opens in a new tab so it behaves like clicking any other PDF link.
 */
export function downloadTablePdf(
  title: string,
  columns: MasterColumn[],
  rows: Record<string, ReactNode>[] | undefined,
) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text(title, 14, 14);

  const body = (rows ?? []).map((row, index) => [
    String(index + 1),
    ...columns.map((column) => {
      const value = row[column.key];
      return typeof value === "string" || typeof value === "number"
        ? String(value)
        : "";
    }),
  ]);

  autoTable(doc, {
    startY: 20,
    head: [["S.No", ...columns.map((column) => column.label)]],
    body,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [40, 108, 74] },
  });

  const blobUrl = doc.output("bloburl");
  window.open(blobUrl, "_blank");
}
