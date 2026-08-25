import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { ReportSection } from "./report-data";

export type ReportPdfOptions = {
  title: string; // "ATARI AMS REPORT"
  zoneLabel: string; // "ATARI ZONE-4"
  reportingYearLabel: string; // "All Data" or a specific year
  kvkNames: string[];
  sections: ReportSection[];
};

const GREEN: [number, number, number] = [40, 108, 74];
const MARGIN = 12;

/**
 * Real multi-section PDF matching the client's own "ATARI AMS REPORT" export
 * (super-v2-prod.pdf / kvk-report...pdf) - cover page with the KVKS INCLUDED
 * list, a Table of Contents mirroring the exact section/subsection/table
 * numbering, then one autotable per confirmed sub-subsection. Tables with no
 * rows print "No data available in table" (real, honest empty state - the
 * client's own reference report shows the same thing for unfilled sections)
 * rather than being skipped or faked.
 */
export function generateReportPdf(opts: ReportPdfOptions) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // --- Cover page ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...GREEN);
  doc.text(opts.zoneLabel, pageW / 2, 20, { align: "center" });
  doc.setFontSize(12);
  doc.text("INDIAN COUNCIL OF AGRICULTURAL RESEARCH", pageW / 2, 30, { align: "center" });
  doc.text("Agricultural Technology Application Research Institute (ATARI)", pageW / 2, 37, { align: "center" });
  doc.setFontSize(20);
  doc.text(opts.title, pageW / 2, 52, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text(`Reporting Year: ${opts.reportingYearLabel}`, pageW / 2, 60, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(`KVKS INCLUDED (${opts.kvkNames.length})`, MARGIN, 74);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const perCol = Math.ceil(opts.kvkNames.length / 3);
  const colW = (pageW - MARGIN * 2) / 3;
  opts.kvkNames.forEach((name, i) => {
    const col = Math.floor(i / perCol);
    const row = i % perCol;
    doc.text(`${i + 1}. ${name}`, MARGIN + col * colW, 82 + row * 5);
  });

  // --- Table of Contents ---
  doc.addPage();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...GREEN);
  doc.text("Table of Contents", MARGIN, 18);
  let y = 28;
  doc.setFontSize(10);
  for (const section of opts.sections) {
    if (y > pageH - 15) {
      doc.addPage();
      y = 18;
    }
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`${section.num}. ${section.title}`, MARGIN, y);
    y += 6;
    for (const sub of section.subsections) {
      if (y > pageH - 15) {
        doc.addPage();
        y = 18;
      }
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      doc.text(`${sub.num}   ${sub.title}`, MARGIN + 6, y);
      y += 5;
      for (const table of sub.tables) {
        if (y > pageH - 15) {
          doc.addPage();
          y = 18;
        }
        doc.setFontSize(9);
        doc.setTextColor(90, 90, 90);
        doc.text(`${table.code}   ${table.title}`, MARGIN + 12, y);
        doc.setFontSize(10);
        y += 4.5;
      }
    }
    y += 2;
  }

  // --- Section pages ---
  for (const section of opts.sections) {
    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...GREEN);
    doc.text(`${section.num}. ${section.title}`, MARGIN, 16);
    let cursorY = 24;

    for (const sub of section.subsections) {
      if (cursorY > pageH - 25) {
        doc.addPage();
        cursorY = 16;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.text(`${sub.num}  ${sub.title}`, MARGIN, cursorY);
      cursorY += 6;

      for (const table of sub.tables) {
        if (cursorY > pageH - 20) {
          doc.addPage();
          cursorY = 16;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text(`${table.code}  ${table.title}`, MARGIN, cursorY);
        cursorY += 5;

        if (table.rows.length === 0) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(9);
          doc.setTextColor(140, 140, 140);
          doc.text("No data available in table", MARGIN + 2, cursorY);
          cursorY += 8;
          continue;
        }

        autoTable(doc, {
          startY: cursorY,
          margin: { left: MARGIN, right: MARGIN },
          head: [table.columns.map((c) => c.label)],
          body: table.rows.map((row) => table.columns.map((c) => row[c.key] ?? "")),
          styles: { fontSize: 7, cellPadding: 1.2 },
          headStyles: { fillColor: GREEN, textColor: 255 },
          theme: "grid",
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cursorY = (doc as any).lastAutoTable.finalY + 8;
      }
    }
  }

  // --- Page footer on every page except the cover ---
  const pageCount = doc.getNumberOfPages();
  for (let p = 2; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Page ${p - 1} of ${pageCount - 1}`, pageW - MARGIN, pageH - 6, { align: "right" });
  }

  return doc;
}
