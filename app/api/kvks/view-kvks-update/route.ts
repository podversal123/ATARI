import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

// Co-locate with the Neon database (ap-southeast-1 / Singapore) - without this Vercel runs functions in its default us-east region, adding a cross-Pacific round trip to every query.
export const preferredRegion = "sin1";

/**
 * Backs the "View KVKs" Add form under Form Management -> About KVK, whose
 * real fields are the signed-in KVK's own address plus its host
 * organization's contact details - not a brand-new KVK record (that's
 * Masters -> KVK Master, wired separately). Scoped to the KVK Admin's own
 * KVK; Super Admin has no single "own KVK" here so isn't supported by this
 * form, same scoping choice as every other generic Add form.
 */
export async function POST(request: Request) {
  const auth = await requireSession(["KVK_ADMIN"]);
  if (!auth.ok) return auth.response;
  if (!auth.session.kvkId) {
    return NextResponse.json({ error: "No KVK on this account." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const kvkAddress = typeof body?.kvkAddress === "string" ? body.kvkAddress : "";
  const hostName = typeof body?.hostName === "string" ? body.hostName.trim() : "";
  const mobile = typeof body?.mobile === "string" ? body.mobile : "";
  const email = typeof body?.email === "string" ? body.email : "";
  const hostAddress = typeof body?.hostAddress === "string" ? body.hostAddress : "";

  if (!kvkAddress || !hostName) {
    return NextResponse.json(
      { error: "KVK address and host organization are required." },
      { status: 400 },
    );
  }

  const kvk = await prisma.kvk.findUnique({ where: { id: auth.session.kvkId } });
  if (!kvk) return NextResponse.json({ error: "KVK not found." }, { status: 404 });

  const host = await prisma.hostOrganization.findFirst({
    where: { zoneId: auth.session.zoneId, name: hostName },
  });
  if (!host) {
    return NextResponse.json({ error: `Unknown host organization: ${hostName}` }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.kvk.update({ where: { id: kvk.id }, data: { address: kvkAddress, hostOrgId: host.id } }),
    prisma.hostOrganization.update({
      where: { id: host.id },
      data: { mobilePhone: mobile || undefined, email: email || undefined, address: hostAddress || undefined },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
