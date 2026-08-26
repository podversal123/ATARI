import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { MASTER_LIST_REGISTRY } from "@/lib/masters-registry";

/**
 * Real saved rows of another All Masters leaf, for populating a
 * parent-picker <select> (e.g. Sub-category's "Category" field, sourced
 * from the real Category Master rows) instead of a free-text input a user
 * could mistype - MasterFormFields' `sourceMaster` fields call this.
 * Super Admin only, zone-scoped, same as every other All Masters read.
 */
export async function GET(request: Request) {
  const auth = await requireSession(["SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;

  const slug = new URL(request.url).searchParams.get("slug") ?? "";
  const list = MASTER_LIST_REGISTRY[slug];
  if (!list) {
    return NextResponse.json({ error: "Unknown master." }, { status: 404 });
  }

  const rows = await list(auth.session.zoneId);
  return NextResponse.json({ rows });
}
