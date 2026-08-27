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
const BORDER_GRAY: [number, number, number] = [190, 190, 190];
const LINE_GRAY: [number, number, number] = [170, 170, 170];
const MARGIN = 12;
const TOC_START_Y = 28;
const TOC_CONT_Y = 18;
const SECTION_ROW_H = 6;
const SUB_ROW_H = 5;
const TABLE_ROW_H = 4.5;
const SECTION_GAP = 2;

/** Inserts a thin space between characters, matching the reference PDF's tracked-caps headings ("A T A R I   Z O N E - 4"). */
function spaced(text: string) {
  return text.split("").join(" ");
}

/**
 * A subsection with exactly one table whose code/title exactly repeat the
 * subsection's own (e.g. "6.1 SAC Meetings" containing a single table also
 * titled "SAC Meetings") shouldn't get a second heading line - the real
 * reference's own TOC and body only print one line for these, not two.
 */
function isRedundantTableHeading(sub: { num: string; title: string }, table: { code: string; title: string }) {
  return table.code === sub.num && table.title === sub.title;
}

function docId() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `ATARI-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

type TocLine = {
  pageIndex: number; // 0-based, relative to the first TOC page
  y: number;
  level: "section" | "subsection" | "table";
  text: string;
  x: number;
  rowHeight: number;
  targetKey: string;
};

/**
 * Walks the same section/subsection/table tree the content pages render, in
 * the same order, purely to compute (a) how many TOC pages are needed and
 * (b) each line's exact page/x/y - all before any content page exists. This
 * lets the real render pass below pre-reserve the right number of blank TOC
 * pages, render content after them, and then go back and draw the TOC with
 * real internal `doc.link()` navigation to the page each entry landed on -
 * the "clickable TOC" the client's own report PDF has (confirmed via the
 * real super-v2-prod.pdf's own link annotations, page 2).
 */
function layoutToc(sections: ReportSection[], pageH: number): { pageCount: number; lines: TocLine[] } {
  const lines: TocLine[] = [];
  let pageIndex = 0;
  let y = TOC_START_Y;

  function breakIfNeeded() {
    if (y > pageH - 15) {
      pageIndex += 1;
      y = TOC_CONT_Y;
    }
  }

  for (const section of sections) {
    breakIfNeeded();
    lines.push({ pageIndex, y, level: "section", text: `${section.num}. ${section.title}`, x: MARGIN, rowHeight: SECTION_ROW_H, targetKey: `sec-${section.num}` });
    y += SECTION_ROW_H;

    for (const sub of section.subsections) {
      breakIfNeeded();
      lines.push({ pageIndex, y, level: "subsection", text: `${sub.num}   ${sub.title}`, x: MARGIN + 6, rowHeight: SUB_ROW_H, targetKey: `sub-${sub.num}` });
      y += SUB_ROW_H;

      for (const table of sub.tables) {
        if (isRedundantTableHeading(sub, table)) continue;
        breakIfNeeded();
        lines.push({ pageIndex, y, level: "table", text: `${table.code}   ${table.title}`, x: MARGIN + 12, rowHeight: TABLE_ROW_H, targetKey: `tab-${table.code}` });
        y += TABLE_ROW_H;
      }
    }
    y += SECTION_GAP;
  }

  return { pageCount: pageIndex + 1, lines };
}

/**
 * Real multi-section PDF matching the client's own "ATARI AMS REPORT" export
 * (super-v2-prod.pdf / kvk-report...pdf) - cover page with the KVKS INCLUDED
 * list, a Table of Contents whose every row is a real clickable internal
 * link jumping to that section/subsection/table's actual page (matches the
 * reference PDF's own link annotations exactly, not decoration), then one
 * autotable per confirmed sub-subsection with an S.No. lead column like the
 * reference. Tables with no rows print "No data available in table" (the
 * client's own reference report shows the same thing for unfilled sections).
 */
export function generateReportPdf(opts: ReportPdfOptions) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const contentW = pageW - MARGIN * 2;

  // --- Cover page ---
  doc.setDrawColor(...BORDER_GRAY);
  doc.setLineWidth(0.4);
  doc.rect(6, 6, pageW - 12, pageH - 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.text(docId(), pageW - MARGIN, 14, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...GREEN);
  doc.text(spaced(opts.zoneLabel), pageW / 2, 24, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(spaced("INDIAN COUNCIL OF AGRICULTURAL RESEARCH"), pageW / 2, 32, { align: "center" });
  doc.setDrawColor(...BORDER_GRAY);
  doc.setLineWidth(0.2);
  doc.line(pageW * 0.25, 37, pageW * 0.75, 37);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  doc.text("Agricultural Technology Application", pageW / 2, 45, { align: "center" });
  doc.text("Research Institute (ATARI)", pageW / 2, 52, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...GREEN);
  doc.text(opts.title, pageW / 2, 68, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text(`Reporting Year: ${opts.reportingYearLabel}`, pageW / 2, 76, { align: "center" });

  const boxTop = 86;
  const boxBottom = pageH - 16;
  doc.setDrawColor(...BORDER_GRAY);
  doc.setLineWidth(0.25);
  doc.rect(MARGIN, boxTop, contentW, boxBottom - boxTop);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`KVKS INCLUDED (${opts.kvkNames.length})`, MARGIN + 4, boxTop + 8);
  doc.line(MARGIN + 4, boxTop + 11, pageW - MARGIN - 4, boxTop + 11);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const cols = 4;
  const perCol = Math.ceil(opts.kvkNames.length / cols);
  const colW = (contentW - 8) / cols;
  opts.kvkNames.forEach((name, i) => {
    const col = Math.floor(i / perCol);
    const row = i % perCol;
    doc.text(`${i + 1}. ${name}`, MARGIN + 4 + col * colW, boxTop + 18 + row * 5.2);
  });

  // --- Reserve blank TOC pages, sized exactly by a dry-run layout pass ---
  const toc = layoutToc(opts.sections, pageH);
  for (let i = 0; i < toc.pageCount; i++) doc.addPage();

  // --- Section/subsection/table content pages - recording each entry's real page number for the TOC links ---
  const targetPageByKey: Record<string, number> = {};

  for (const section of opts.sections) {
    doc.addPage();
    targetPageByKey[`sec-${section.num}`] = doc.getNumberOfPages();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...GREEN);
    doc.text(section.title, pageW / 2, 16, { align: "center" });
    let cursorY = 26;

    for (const sub of section.subsections) {
      if (cursorY > pageH - 25) {
        doc.addPage();
        cursorY = 16;
      }
      targetPageByKey[`sub-${sub.num}`] = doc.getNumberOfPages();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);
      doc.text(`${sub.num}  ${sub.title}`, MARGIN, cursorY);
      doc.setDrawColor(...LINE_GRAY);
      doc.setLineWidth(0.2);
      doc.line(MARGIN, cursorY + 1.5, pageW - MARGIN, cursorY + 1.5);
      cursorY += 8;

      for (const table of sub.tables) {
        if (cursorY > pageH - 20) {
          doc.addPage();
          cursorY = 16;
        }
        targetPageByKey[`tab-${table.code}`] = doc.getNumberOfPages();
        if (!isRedundantTableHeading(sub, table)) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.text(`${table.code}  ${table.title}`, MARGIN, cursorY);
          cursorY += 5;
        }

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
          head: [["S.No.", ...table.columns.map((c) => c.label)]],
          body: table.rows.map((row, i) => [String(i + 1), ...table.columns.map((c) => row[c.key] ?? "")]),
          styles: { fontSize: 7, cellPadding: 1.2, lineColor: [140, 140, 140], lineWidth: 0.1, textColor: [0, 0, 0] },
          headStyles: { fillColor: [242, 242, 242], textColor: [0, 0, 0], fontStyle: "bold", lineColor: [120, 120, 120], lineWidth: 0.1 },
          theme: "grid",
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cursorY = (doc as any).lastAutoTable.finalY + 8;
      }
    }
  }

  // --- Draw the TOC pages for real, now that every target page number is known ---
  for (let i = 0; i < toc.pageCount; i++) {
    doc.setPage(2 + i);
    if (i === 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("Table of Contents", MARGIN, 18);
    }
    for (const line of toc.lines) {
      if (line.pageIndex !== i) continue;
      if (line.level === "section") {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...GREEN);
      } else if (line.level === "subsection") {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(20, 20, 20);
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
      }
      doc.text(line.text, line.x, line.y);
      doc.setDrawColor(...LINE_GRAY);
      doc.setLineWidth(0.15);
      doc.line(MARGIN, line.y + 1.5, pageW - MARGIN, line.y + 1.5);

      const targetPage = targetPageByKey[line.targetKey];
      if (targetPage) {
        doc.link(MARGIN, line.y - line.rowHeight + 2, contentW, line.rowHeight, { pageNumber: targetPage });
      }
    }
  }

  // --- Footer on every page, including the cover, matching the reference's "PageXofY" format ---
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Page${p}of${pageCount}`, pageW - MARGIN, pageH - 6, { align: "right" });
  }

  return doc;
}
