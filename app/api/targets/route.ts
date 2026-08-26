import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

const CATEGORIES = ["OFT", "FLD", "Training", "Extension Activity"] as const;
type Category = (typeof CATEGORIES)[number];

/** Real submitted count for one KVK+year+category - the live "Achieved" figure, never a second manually-entered number. */
async function achievedCount(kvkId: string, reportingYear: number, category: Category) {
  switch (category) {
    case "OFT":
      return prisma.oft.count({ where: { kvkId, reportingYear } });
    case "FLD":
      return prisma.fld.count({ where: { kvkId, reportingYear } });
    case "Training":
      return prisma.training.count({ where: { kvkId, reportingYear } });
    case "Extension Activity": {
      const [a, b] = await Promise.all([
        prisma.extensionActivity.count({ where: { kvkId, reportingYear } }),
        prisma.otherExtensionActivity.count({ where: { kvkId, reportingYear } }),
      ]);
      return a + b;
    }
  }
}

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const kvkId = auth.session.role === "KVK_ADMIN" ? auth.session.kvkId ?? undefined : undefined;
  const targets = await prisma.target.findMany({
    where: kvkId ? { kvkId } : { zoneId: auth.session.zoneId },
    include: { kvk: { select: { name: true } } },
    orderBy: [{ reportingYear: "desc" }, { kvk: { name: "asc" } }],
  });

  const rows = await Promise.all(
    targets.map(async (t) => {
      const achieved = await achievedCount(t.kvkId, t.reportingYear, t.category as Category);
      const progress = t.targetValue > 0 ? Math.round((achieved / t.targetValue) * 100) : 0;
      return {
        id: t.id,
        reportingYear: String(t.reportingYear),
        kvk: t.kvk.name,
        category: t.category,
        target: String(t.targetValue),
        achieved: String(achieved),
        progress: `${progress}%`,
        status: achieved >= t.targetValue ? "Achieved" : "In Progress",
      };
    }),
  );

  return NextResponse.json({ rows });
}

export async function POST(request: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const reportingYear = Number(body?.reportingYear);
  const category = typeof body?.category === "string" ? body.category : "";
  const targetValue = Number(body?.targetValue);
  const kvkName = typeof body?.kvkName === "string" ? body.kvkName : "";

  if (!reportingYear || !CATEGORIES.includes(category as Category) || !targetValue || targetValue <= 0) {
    return NextResponse.json({ error: "Reporting year, category and a positive target value are required." }, { status: 400 });
  }

  // KVK Admin/User can only ever set their own KVK's target; Super Admin must name one.
  let kvkId = auth.session.kvkId;
  if (auth.session.role === "SUPER_ADMIN") {
    if (!kvkName) return NextResponse.json({ error: "KVK is required." }, { status: 400 });
    const kvk = await prisma.kvk.findFirst({ where: { zoneId: auth.session.zoneId, name: kvkName } });
    if (!kvk) return NextResponse.json({ error: `Unknown KVK: ${kvkName}` }, { status: 400 });
    kvkId = kvk.id;
  }
  if (!kvkId) {
    return NextResponse.json({ error: "No KVK to assign this target to." }, { status: 400 });
  }
  if (!auth.session.roleId) {
    return NextResponse.json({ error: "Your account has no assigned role." }, { status: 403 });
  }

  const target = await prisma.target.upsert({
    where: { kvkId_reportingYear_category: { kvkId, reportingYear, category } },
    create: { kvkId, zoneId: auth.session.zoneId, reportingYear, category, targetValue, roleId: auth.session.roleId },
    update: { targetValue, roleId: auth.session.roleId },
  });

  return NextResponse.json({ ok: true, id: target.id }, { status: 201 });
}

export async function DELETE(request: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing target id." }, { status: 400 });

  const kvkId = auth.session.role === "KVK_ADMIN" ? auth.session.kvkId ?? undefined : undefined;
  const result = await prisma.target.deleteMany({
    where: { id, ...(kvkId ? { kvkId } : { zoneId: auth.session.zoneId }) },
  });
  if (result.count === 0) return NextResponse.json({ error: "Target not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
