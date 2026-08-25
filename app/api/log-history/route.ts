import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

/**
 * Real login activity for the "View Users Log Activity" page and the
 * Dashboard's Recent Log History card. KVK Admin/User always get their own
 * KVK's rows only - the `kvk` filter only applies for Super Admin, who can
 * additionally narrow to "super-admin" (their own zone-level logins, which
 * have no kvkId) or a specific KVK name.
 */
export async function GET(request: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 500) : 100;
  const kvkFilter = searchParams.get("kvk");

  const isKvkScoped = auth.session.role !== "SUPER_ADMIN";
  const where = isKvkScoped
    ? { kvkId: auth.session.kvkId ?? undefined }
    : await (async () => {
        if (!kvkFilter || kvkFilter === "all") return { zoneId: auth.session.zoneId };
        if (kvkFilter === "super-admin") return { zoneId: auth.session.zoneId, kvkId: null };
        const kvk = await prisma.kvk.findFirst({
          where: { zoneId: auth.session.zoneId, name: kvkFilter },
          select: { id: true },
        });
        return { zoneId: auth.session.zoneId, kvkId: kvk?.id ?? "__no_match__" };
      })();

  const rows = await prisma.loginActivity.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      kvkName: true,
      username: true,
      activity: true,
      ipAddress: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    rows: rows.map((row) => ({
      id: row.id,
      kvkName: row.kvkName ?? "Super Admin",
      nameOfUser: row.username,
      activity: row.activity,
      ipAddress: row.ipAddress ?? "-",
      loginTime: row.createdAt.toISOString(),
    })),
  });
}
