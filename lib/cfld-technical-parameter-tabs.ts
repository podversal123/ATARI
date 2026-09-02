export const CFLD_TABS = [
  "Technical Parameter",
  "Economic Parameters",
  "Socio Economic Parameters",
  "Farmers Perception",
] as const;
export type CfldTabName = (typeof CFLD_TABS)[number];

/** Maps the Action dropdown's own tab query values (see empty-data-table.tsx's "Economic Parameters"/"Update Socio Economic Parameters"/"Farmers Perception Parameters" items) to CfldTechnicalParameterPage's tab names - a plain function in its own non-"use client" module so the server component (forms/[...slug]/page.tsx) can call it directly instead of only rendering it as a component. */
export function cfldTabFromQuery(tab: string | undefined): CfldTabName | undefined {
  switch (tab) {
    case "economic":
      return "Economic Parameters";
    case "socio-economic":
      return "Socio Economic Parameters";
    case "perception":
      return "Farmers Perception";
    default:
      return undefined;
  }
}

/** Exact tab pill text confirmed against the real reference (atari-client.vercel.app, 2026-09-01) - kept separate from the internal `CfldTabName` values above since the first tab's own label changes between Add and Edit while the internal name doesn't. */
export function cfldTabDisplayLabel(tab: CfldTabName, isEdit: boolean): string {
  switch (tab) {
    case "Technical Parameter":
      return isEdit ? "Edit Technical Parameter" : "Add Technical Parameter";
    case "Economic Parameters":
      return "Economic Parameters of CFLD";
    case "Socio Economic Parameters":
      return "Update Socio Economic Parameters of CFLD";
    case "Farmers Perception":
      return "Farmers Perception parameters of CFLD";
  }
}
