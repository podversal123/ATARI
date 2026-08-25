import { FileDown, FileSpreadsheet, FileType, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * All three formats are real - PDF (lib/report-pdf.ts), Excel
 * (lib/report-excel.ts, exceljs), Word (lib/report-word.ts, docx) - each
 * generating the same live section tree from lib/report-data.ts, not a
 * placeholder.
 */
export function DownloadReportButtons({
  onDownloadPdf,
  onDownloadExcel,
  onDownloadWord,
  pdfLoading,
  excelLoading,
  wordLoading,
}: {
  onDownloadPdf?: () => void;
  onDownloadExcel?: () => void;
  onDownloadWord?: () => void;
  pdfLoading?: boolean;
  excelLoading?: boolean;
  wordLoading?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={onDownloadPdf} disabled={!onDownloadPdf || pdfLoading}>
        {pdfLoading ? <Loader2 className="size-3.5 animate-spin" /> : <FileDown className="size-3.5" />}
        {pdfLoading ? "Generating…" : "PDF"}
      </Button>
      <Button variant="outline" size="sm" onClick={onDownloadExcel} disabled={!onDownloadExcel || excelLoading}>
        {excelLoading ? <Loader2 className="size-3.5 animate-spin" /> : <FileSpreadsheet className="size-3.5" />}
        {excelLoading ? "Generating…" : "Excel"}
      </Button>
      <Button variant="outline" size="sm" onClick={onDownloadWord} disabled={!onDownloadWord || wordLoading}>
        {wordLoading ? <Loader2 className="size-3.5 animate-spin" /> : <FileType className="size-3.5" />}
        {wordLoading ? "Generating…" : "Word"}
      </Button>
    </div>
  );
}
