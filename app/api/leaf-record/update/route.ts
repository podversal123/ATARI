import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { LEAF_UPDATE_REGISTRY } from "@/lib/leaf-record-registry";

export async function POST(request: Request) {
  const auth = await requireSession(["KVK_ADMIN"]);
  if (!auth.ok) return auth.response;
  if (!auth.session.kvkId) {
    return NextResponse.json({ error: "No KVK on this account." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const path = typeof body?.path === "string" ? body.path : "";
  const id = typeof body?.id === "string" ? body.id : "";
  const values = body?.values && typeof body.values === "object" ? body.values : {};

  const update = LEAF_UPDATE_REGISTRY[path];
  if (!update) {
    return NextResponse.json(
      { error: "This form is not yet connected to the database." },
      { status: 501 },
    );
  }
  if (!id) {
    return NextResponse.json({ error: "Missing record id." }, { status: 400 });
  }

  try {
    const result = await update(id, values, { kvkId: auth.session.kvkId, zoneId: auth.session.zoneId });
    if (result.count === 0) {
      return NextResponse.json(
        { error: "Record not found, or it doesn't belong to your KVK." },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update this record.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
