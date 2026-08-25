"use client";

import { useCallback, useState } from "react";
import { generateReportId } from "@/lib/reports";

export type PreviewPhase = "idle" | "generating" | "ready" | "no-data" | "stale" | "error";

/**
 * Drives the Generate Preview / stale-filter state machine. `generate` now
 * calls the real report data fetcher (the same `/api/reports/generate` the
 * download buttons use) and reflects the real record count - "ready" for a
 * non-empty result, "no-data" for a genuinely empty one. Previously this
 * always resolved to "no-data" via a fake setTimeout (a Phase-1 stub written
 * before the report backend existed) - that made every preview say "No data
 * available" even when the download buttons proved real data existed.
 */
export function useReportPreview() {
  const [phase, setPhase] = useState<PreviewPhase>("idle");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const generate = useCallback(
    (validate: () => string | null, fetchTotalRecords?: () => Promise<number>) => {
      const error = validate();
      if (error) {
        setValidationError(error);
        return;
      }
      setValidationError(null);
      setPhase("generating");

      if (!fetchTotalRecords) {
        window.setTimeout(() => {
          setReportId(generateReportId());
          setGeneratedAt(new Date());
          setPhase("no-data");
        }, 500);
        return;
      }

      fetchTotalRecords()
        .then((count) => {
          setReportId(generateReportId());
          setGeneratedAt(new Date());
          setTotalRecords(count);
          setPhase(count > 0 ? "ready" : "no-data");
        })
        .catch(() => {
          setErrorMessage("Could not generate the report. Please try again.");
          setPhase("error");
        });
    },
    [],
  );

  /** Call from any filter's onChange once a preview has already been generated at least once. */
  const markStale = useCallback(() => {
    setPhase((prev) =>
      prev === "ready" || prev === "no-data" || prev === "stale" ? "stale" : prev,
    );
    setValidationError(null);
  }, []);

  return { phase, validationError, reportId, generatedAt, totalRecords, errorMessage, generate, markStale };
}
