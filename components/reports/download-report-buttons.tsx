import { FileDown, FileSpreadsheet, FileType, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * PDF is real (generates and downloads the actual multi-section report from
 * live data - see lib/report-data.ts + lib/report-pdf.ts). Excel/Word have
 * no generator built yet, so they stay honestly disabled rather than faking
 * a second export format.
 */
export function DownloadReportButtons({
  onDownloadPdf,
  pdfLoading,
}: {
  onDownloadPdf?: () => void;
  pdfLoading?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={onDownloadPdf} disabled={!onDownloadPdf || pdfLoading}>
        {pdfLoading ? <Loader2 className="size-3.5 animate-spin" /> : <FileDown className="size-3.5" />}
        {pdfLoading ? "Generating…" : "PDF"}
      </Button>
      <Button variant="outline" size="sm" disabled>
        <FileSpreadsheet className="size-3.5" />
        Excel
      </Button>
      <Button variant="outline" size="sm" disabled>
        <FileType className="size-3.5" />
        Word
      </Button>
    </div>
  );
}
