import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

/**
 * Super Admin's Edit/Delete on the Notifications page's Sent/Received
 * tables (client request, 2026-08-31) - oversight authority, same shape as
 * Module Images' publish/delete split: a Super Admin can manage any
 * notification in their zone (their own sends or a KVK Admin's), a KVK
 * Admin gets no Action column here at all (out of scope for this request).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSession(["SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!title || !message) {
    return NextResponse.json({ error: "Title and message are required." }, { status: 400 });
  }

  const result = await prisma.notification.updateMany({
    where: { id, zoneId: auth.session.zoneId },
    data: { title, message },
  });
  if (result.count === 0) {
    return NextResponse.json({ error: "Notification not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSession(["SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const result = await prisma.notification.deleteMany({
    where: { id, zoneId: auth.session.zoneId },
  });
  if (result.count === 0) {
    return NextResponse.json({ error: "Notification not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
