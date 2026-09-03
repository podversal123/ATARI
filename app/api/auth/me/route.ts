import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

/** DB Role enum -> the client session's role string (same mapping the login route uses). */
function toClientRole(role: string) {
  if (role === "SUPER_ADMIN") return "super-admin";
  if (role === "KVK_ADMIN") return "kvk-admin";
  return "kvk-user";
}

/**
 * The signed-in identity, read from the verified (httpOnly) session cookie -
 * the real source of truth. The client keeps a per-tab sessionStorage copy
 * for instant role-dependent chrome, but that copy is missing in a brand-new
 * tab and can go stale; SessionGate calls this on mount to (re)sync it, so a
 * KVK Admin never briefly renders as Super Admin (the sessionStorage default).
 */
export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const kvk = auth.session.kvkId
    ? await prisma.kvk.findUnique({ where: { id: auth.session.kvkId }, select: { name: true } })
    : null;

  return NextResponse.json({
    role: toClientRole(auth.session.role),
    kvkName: kvk?.name ?? undefined,
  });
}
