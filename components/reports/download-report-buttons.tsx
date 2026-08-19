import { FileDown, FileSpreadsheet, FileType } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Downloads must reflect exactly the currently-previewed filter set, so they
 * stay disabled unless the preview is showing real, current data — which
 * never happens yet in Phase 1 (no backend has generated a report), so this
 * is always disabled today and becomes live once Phase 2/3 wires real data.
 */
export function DownloadReportButtons({ enabled }: { enabled: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" disabled={!enabled}>
        <FileDown className="size-3.5" />
        PDF
      </Button>
      <Button variant="outline" size="sm" disabled={!enabled}>
        <FileSpreadsheet className="size-3.5" />
        Excel
      </Button>
      <Button variant="outline" size="sm" disabled={!enabled}>
        <FileType className="size-3.5" />
        Word
      </Button>
    </div>
  );
}
