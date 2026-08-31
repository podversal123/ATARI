import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { ReactNode } from "react";
import type { MasterColumn } from "./navigation";

/**
 * Real PDF generated client-side from whatever rows are currently on
 * screen - no backend yet, so there is nothing to fetch a server-rendered
 * report from, but the "PDF" button itself should be a real, clickable
 * download rather than a decorative one (client request, 2026-08-24).
 *
 * Downloads directly via `doc.save(...)` with an explicit `${title}.pdf`
 * filename (changed 2026-08-31, real bug) - the earlier `window.open` +
 * blob-URL approach left the saved file's name up to the browser's own
 * guess (its PDF viewer's Download button doesn't reliably read the PDF's
 * /Title metadata for that), so the file the user actually got often
 * wasn't named after the table at all. `doc.save` is the same, already-
 * working pattern the Reports PDF and the Excel/Word exports below use.
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
  // Without this, Chrome's PDF viewer tab shows the blob's own random UUID
  // instead of a real name (real bug, 2026-08-31) - this is opened via a
  // blob URL (see doc.output("bloburl") below), not a real file download,
  // so there's no filename for the tab to fall back to; the PDF's own
  // /Title metadata is what the viewer actually reads.
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

  doc.save(`${title}.pdf`);
}
