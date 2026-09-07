import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { ReactNode } from "react";
import type { MasterColumn } from "./navigation";

/**
 * Real PDF generated client-side from whatever rows are currently on
 * screen. The "PDF" button opens the generated document in a new browser
 * tab for preview, and the user downloads from the PDF viewer there
 * (client request, 2026-09-04 - it used to `doc.save()` straight to a
 * file with no preview step). `doc.setProperties({ title })` below is what
 * names both the preview tab and the viewer's Download button, since a
 * blob URL carries no filename of its own. If the browser blocks the
 * popup, fall back to a direct save so the button is never a dead end.
 */
const BORDER_GRAY: [number, number, number] = [190, 190, 190];

/** Thin page-edge frame around every page, same border color/weight as the multi-section report PDF (lib/report-pdf.ts) - this export had none before, leaving the title/table floating on bare white. */
function drawPageBorder(doc: jsPDF) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  doc.setDrawColor(...BORDER_GRAY);
  doc.setLineWidth(0.4);
  doc.rect(6, 6, pageW - 12, pageH - 12);
}

export function downloadTablePdf(
  title: string,
  columns: MasterColumn[],
  rows: Record<string, ReactNode>[] | undefined,
) {
  const doc = new jsPDF({ orientation: "landscape" });
  // Without this, the PDF viewer tab shows the blob's own random UUID
  // instead of a real name - the blob URL opened below carries no
  // filename, so the PDF's own /Title metadata is what the viewer reads
  // for both the tab label and its Download button.
  doc.setProperties({ title });
  drawPageBorder(doc);
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
    theme: "grid",
    styles: { fontSize: 8, lineColor: BORDER_GRAY, lineWidth: 0.15 },
    headStyles: { fillColor: [40, 108, 74], lineColor: BORDER_GRAY, lineWidth: 0.15 },
    margin: { left: 10, right: 10 },
    didDrawPage: () => drawPageBorder(doc),
  });

  // Preview in a new tab; the viewer there has its own Download control.
  const previewTab = window.open(doc.output("bloburl"), "_blank");
  if (!previewTab) doc.save(`${title}.pdf`); // popup blocked - don't leave the button dead
}
