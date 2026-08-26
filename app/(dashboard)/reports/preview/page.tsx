"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { ReportHeaderBar } from "@/components/reports/report-header-bar";
import { ReportPreviewCard } from "@/components/reports/report-preview-card";
import { DownloadReportButtons } from "@/components/reports/download-report-buttons";
import { useReportPreview } from "@/components/reports/use-report-preview";
import { formatDisplayDate } from "@/lib/reports";
import { downloadBlob } from "@/lib/utils";
import type { ReportSection } from "@/lib/report-data";

/**
 * Generate Preview navigates here instead of updating the filter page
 * in-place - a real page/URL for the report, not just inline state, per
 * explicit direction. Reads the filters the previous screen already
 * validated (passed as query params) purely for display; it doesn't
 * re-validate or refetch anything itself.
 */
export default function ReportPreviewPage() {
  return (
    <Suspense fallback={null}>
      <ReportPreviewContent />
    </Suspense>
  );
}

function ReportPreviewContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { phase, reportId, totalRecords, errorMessage, generate } = useReportPreview();

  const type = params.get("type") === "kvk" ? "kvk" : "admin";
  const backHref = "/reports";
  const [pdfLoading, setPdfLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);
  const [wordLoading, setWordLoading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function fetchReportData() {
    const kvkFilter = params.get("kvk");
    const query = kvkFilter ? `?kvk=${encodeURIComponent(kvkFilter)}` : "";
    const response = await fetch(`/api/reports/generate${query}`);
    const data: { zoneLabel: string; kvkNames: string[]; sections: ReportSection[] } | { error: string } =
      await response.json();
    if (!response.ok || "error" in data) {
      throw new Error("error" in data ? data.error : "Could not generate the report.");
    }
    return data;
  }

  function countRecords(sections: ReportSection[]) {
    return sections
      .flatMap((s) => s.subsections)
      .flatMap((sub) => sub.tables)
      .reduce((sum, table) => sum + table.rows.length, 0);
  }

  useEffect(() => {
    generate(
      () => null,
      async () => countRecords((await fetchReportData()).sections),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDownloadPdf() {
    setDownloadError(null);
    setPdfLoading(true);
    try {
      const data = await fetchReportData();
      const { generateReportPdf } = await import("@/lib/report-pdf");
      const doc = generateReportPdf({
        title: "ATARI AMS REPORT",
        zoneLabel: data.zoneLabel,
        reportingYearLabel: "All Data",
        kvkNames: data.kvkNames,
        sections: data.sections,
      });
      doc.save(`ATARI-AMS-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : "Could not reach the server. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleDownloadExcel() {
    setDownloadError(null);
    setExcelLoading(true);
    try {
      const data = await fetchReportData();
      const { generateReportExcel } = await import("@/lib/report-excel");
      const wb = await generateReportExcel({
        title: "ATARI AMS REPORT",
        zoneLabel: data.zoneLabel,
        reportingYearLabel: "All Data",
        kvkNames: data.kvkNames,
        sections: data.sections,
      });
      const buffer = await wb.xlsx.writeBuffer();
      downloadBlob(
        new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
        `ATARI-AMS-Report-${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : "Could not reach the server. Please try again.");
    } finally {
      setExcelLoading(false);
    }
  }

  async function handleDownloadWord() {
    setDownloadError(null);
    setWordLoading(true);
    try {
      const data = await fetchReportData();
      const { generateReportWord } = await import("@/lib/report-word");
      const blob = await generateReportWord({
        title: "ATARI AMS REPORT",
        zoneLabel: data.zoneLabel,
        reportingYearLabel: "All Data",
        kvkNames: data.kvkNames,
        sections: data.sections,
      });
      downloadBlob(blob, `ATARI-AMS-Report-${new Date().toISOString().slice(0, 10)}.docx`);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : "Could not reach the server. Please try again.");
    } finally {
      setWordLoading(false);
    }
  }

  const metaColumns =
    type === "kvk"
      ? [
          [
            { label: "KVK Name", value: params.get("kvk") ?? "" },
            { label: "Form", value: params.get("form") ?? "All Forms" },
          ],
          [
            {
              label: "From Date",
              value: formatDisplayDate(params.get("from") ?? ""),
            },
            {
              label: "To Date",
              value: formatDisplayDate(params.get("to") ?? ""),
            },
          ],
        ]
      : [
          [
            { label: "Zone", value: params.get("zone") ?? "" },
            { label: "State", value: params.get("state") ?? "" },
            { label: "Host Organisation", value: params.get("hostOrg") ?? "" },
            { label: "District", value: params.get("district") ?? "" },
          ],
          [
            { label: "KVK", value: params.get("kvk") ?? "" },
            { label: "Form", value: params.get("form") ?? "All Forms" },
          ],
          [
            {
              label: "From Date",
              value: formatDisplayDate(params.get("from") ?? ""),
            },
            {
              label: "To Date",
              value: formatDisplayDate(params.get("to") ?? ""),
            },
            { label: "Generated By", value: "Super Admin" },
          ],
        ];

  return (
    <div className="space-y-4">
      <PageHeader
        trail={[
          { label: "Reports", href: "/reports" },
          { label: "Report Preview" },
        ]}
      />

      <ReportHeaderBar
        title={
          type === "kvk" ? "KVK REPORT PREVIEW" : "SUPER ADMIN REPORT PREVIEW"
        }
      />

      <Button variant="outline" size="sm" onClick={() => router.push(backHref)}>
        <ChevronLeft className="size-3.5" />
        Back to Filters
      </Button>

      <div>
        <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
          <Eye className="size-3.5" />
          Report Preview
        </div>
        <ReportPreviewCard
          heading={type === "kvk" ? "KVK REPORT PREVIEW" : "REPORT SUMMARY"}
          reportId={reportId}
          phase={phase}
          totalRecords={totalRecords}
          errorMessage={errorMessage}
          metaColumns={metaColumns}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Download Report
          </p>
          <DownloadReportButtons
            onDownloadPdf={handleDownloadPdf}
            onDownloadExcel={handleDownloadExcel}
            onDownloadWord={handleDownloadWord}
            pdfLoading={pdfLoading}
            excelLoading={excelLoading}
            wordLoading={wordLoading}
          />
          {downloadError && (
            <p role="alert" className="mt-2 text-sm font-medium text-destructive">
              {downloadError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
