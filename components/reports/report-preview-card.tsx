import { AlertCircle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import type { PreviewPhase } from "./use-report-preview";

type MetaField = { label: string; value: string };

type ReportPreviewCardProps = {
  heading: string;
  reportId: string | null;
  phase: PreviewPhase;
  totalRecords?: number;
  errorMessage?: string | null;
  /** One array per meta column (2 columns on the KVK screen, 3 on the Super Admin screen). */
  metaColumns: MetaField[][];
};

/**
 * Preview shell reused by both report screens. Per the spec's dynamic-states
 * section, a stale filter change must hide the previous preview rather than
 * keep showing it as current, and a no-data result renders the documented
 * message instead of an empty table.
 */
export function ReportPreviewCard({
  heading,
  reportId,
  phase,
  totalRecords = 0,
  errorMessage,
  metaColumns,
}: ReportPreviewCardProps) {
  const showMeta = phase === "generating" || phase === "ready" || phase === "no-data";

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-center text-sm font-semibold tracking-wide text-foreground">{heading}</h3>
      {reportId && showMeta && (
        <p className="mt-1 text-center text-xs text-muted-foreground">Report ID: {reportId}</p>
      )}

      {showMeta && (
        <div
          className="mt-4 grid gap-x-6 gap-y-1"
          style={{ gridTemplateColumns: `repeat(${metaColumns.length}, minmax(0, 1fr))` }}
        >
          {metaColumns.map((column, index) => (
            <dl key={index} className="space-y-1 text-sm">
              {column.map((field) => (
                <div key={field.label} className="flex items-baseline justify-between gap-2">
                  <dt className="text-muted-foreground">{field.label}</dt>
                  <dd className="font-medium text-foreground">{field.value}</dd>
                </div>
              ))}
            </dl>
          ))}
        </div>
      )}

      {(phase === "ready" || phase === "no-data") && (
        <p className="mt-3 text-sm font-semibold text-foreground">Total Records : {totalRecords}</p>
      )}

      <div className="mt-4 rounded-md border border-dashed border-border">
        {phase === "idle" && (
          <div className="flex flex-col items-center justify-center gap-1 px-4 py-10 text-center">
            <p className="text-sm font-medium text-foreground">No report generated.</p>
            <p className="text-xs text-muted-foreground">
              Please select filters and click Generate Preview.
            </p>
          </div>
        )}
        {phase === "generating" && (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
            <Loader2 className="size-5 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">Generating report…</p>
            <p className="text-xs text-muted-foreground">Please wait.</p>
          </div>
        )}
        {phase === "ready" && (
          <div className="flex flex-col items-center justify-center gap-1 px-4 py-10 text-center">
            <CheckCircle2 className="size-5 text-primary" />
            <p className="text-sm font-medium text-foreground">Report generated successfully.</p>
            <p className="text-xs text-muted-foreground">
              Use the Download Report buttons below to get the PDF, Excel, or Word file.
            </p>
          </div>
        )}
        {phase === "no-data" && (
          <div className="flex flex-col items-center justify-center gap-1 px-4 py-10 text-center">
            <AlertCircle className="size-5 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              No data available for the selected filters and date range.
            </p>
          </div>
        )}
        {phase === "stale" && (
          <div className="flex flex-col items-center justify-center gap-1 px-4 py-10 text-center">
            <p className="text-sm font-medium text-foreground">Filters changed.</p>
            <p className="text-xs text-muted-foreground">
              Please click &quot;Generate Preview&quot; to update the report.
            </p>
          </div>
        )}
        {phase === "error" && (
          <div className="flex flex-col items-center justify-center gap-1 px-4 py-10 text-center">
            <XCircle className="size-5 text-destructive" />
            <p className="text-sm font-medium text-foreground">{errorMessage ?? "Could not generate the report."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
