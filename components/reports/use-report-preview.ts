"use client";

import { useCallback, useState } from "react";
import { generateReportId } from "@/lib/reports";

export type PreviewPhase = "idle" | "generating" | "no-data" | "stale";

/**
 * Drives the Generate Preview / stale-filter state machine described in the
 * reports spec (dynamic states section). Phase 1 has no backend, so a
 * successful generate always resolves to "no-data" rather than fabricated
 * rows — this is also the spec's own documented empty state, not a
 * shortcut: "No data available for the selected filters and date range."
 */
export function useReportPreview() {
  const [phase, setPhase] = useState<PreviewPhase>("idle");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);

  const generate = useCallback((validate: () => string | null) => {
    const error = validate();
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    setPhase("generating");
    window.setTimeout(() => {
      setReportId(generateReportId());
      setGeneratedAt(new Date());
      setPhase("no-data");
    }, 500);
  }, []);

  /** Call from any filter's onChange once a preview has already been generated at least once. */
  const markStale = useCallback(() => {
    setPhase((prev) => (prev === "no-data" || prev === "stale" ? "stale" : prev));
    setValidationError(null);
  }, []);

  return { phase, validationError, reportId, generatedAt, generate, markStale };
}
