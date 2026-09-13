import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { distinctReportingYears } from "@/lib/report-data";

/**
 * Real years for the Reports / Form Management "Reporting Year" checkbox
 * list - KVK Admin/User get their own KVK's years, Super Admin gets every
 * year present anywhere in the zone. Replaces the old hardcoded
 * REPORT_YEAR_LIST (current year back 5), which silently made any year
 * outside that fixed window impossible to select even though real data
 * existed for it.
 */
export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const isKvkScoped = auth.session.role !== "SUPER_ADMIN";
  const kvkId = isKvkScoped ? auth.session.kvkId ?? undefined : undefined;

  const years = await distinctReportingYears({ kvkId, zoneId: auth.session.zoneId });
  return NextResponse.json({ years });
}
