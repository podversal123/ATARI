import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { MASTER_CREATE_REGISTRY } from "@/lib/masters-registry";

// Co-locate with the Neon database (ap-southeast-1 / Singapore) - without this Vercel runs functions in its default us-east region, adding a cross-Pacific round trip to every query.
export const preferredRegion = "sin1";

/** Generic create endpoint for All Masters leaves - Super Admin only, zone-scoped (masters have no KVK owner). */
export async function POST(request: Request) {
  const auth = await requireSession(["SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const path = typeof body?.path === "string" ? body.path : "";
  const values = body?.values && typeof body.values === "object" ? body.values : {};

  const create = MASTER_CREATE_REGISTRY[path];
  if (!create) {
    return NextResponse.json(
      { error: "This master is not yet connected to the database." },
      { status: 501 },
    );
  }

  try {
    await create(values, auth.session.zoneId);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save this record.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
