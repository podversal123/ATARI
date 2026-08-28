import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { MASTER_LIST_REGISTRY } from "@/lib/masters-registry";

/**
 * Real saved rows of another All Masters leaf, for populating a
 * parent-picker <select> (e.g. Sub-category's "Category" field, sourced
 * from the real Category Master rows) instead of a free-text input a user
 * could mistype - MasterFormFields' `sourceMaster` fields call this, and
 * that component backs both All Masters (Super Admin only) AND Form
 * Management leaf forms (Training's Clientele, Extension's Nature of
 * Extension Activity, ...), which KVK Admin fills out day to day - real
 * bug found before it shipped (2026-08-28): Super-Admin-only here would
 * have silently broken those dropdowns for every KVK Admin. Zone-scoped
 * either way, so allowing KVK_ADMIN doesn't leak anything - master lists
 * are zone-wide reference data, not another KVK's private records.
 */
export async function GET(request: Request) {
  const auth = await requireSession(["SUPER_ADMIN", "KVK_ADMIN"]);
  if (!auth.ok) return auth.response;

  const slug = new URL(request.url).searchParams.get("slug") ?? "";
  const list = MASTER_LIST_REGISTRY[slug];
  if (!list) {
    return NextResponse.json({ error: "Unknown master." }, { status: 404 });
  }

  const rows = await list(auth.session.zoneId);
  return NextResponse.json({ rows });
}
