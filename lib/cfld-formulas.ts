/**
 * Yield-gap formulas from the client's own "CFLD formula.docx" - applied to
 * the CFLD Technical Parameter fields that were already part of the schema
 * and the report's own field list (report-data.ts) but were never actually
 * computed (percentIncrease/yieldGapMinimizedPercent* sat permanently null).
 * Returns undefined wherever a required input is missing or would divide by
 * zero, rather than guessing a 0.
 */
export function percentIncreaseInYield(demoYieldAvg?: number, farmerYield?: number): number | undefined {
  if (demoYieldAvg === undefined || !farmerYield) return undefined;
  return ((demoYieldAvg - farmerYield) / farmerYield) * 100;
}

export function yieldGapMinimizedPercent(referenceYield?: number, demoYieldAvg?: number): number | undefined {
  if (demoYieldAvg === undefined || !referenceYield) return undefined;
  return ((referenceYield - demoYieldAvg) / referenceYield) * 100;
}
