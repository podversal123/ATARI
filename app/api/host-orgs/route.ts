import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

// Co-locate with the Neon database (ap-southeast-1 / Singapore) - without this Vercel runs functions in its default us-east region, adding a cross-Pacific round trip to every query.
export const preferredRegion = "sin1";

/** Create endpoint for HostMasterAddForm's real Zone->State->District->Institute cascade - the generic 4-column master-record registry only covers Host Master's list columns (hostName/address/phone/email), not this richer Create shape (mirrors /api/kvks' own pattern). */
export async function POST(request: Request) {
  const auth = await requireSession(["SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const name = typeof body?.hostName === "string" ? body.hostName.trim() : "";
  const mobile = typeof body?.mobile === "string" ? body.mobile.trim() : "";
  const landline = typeof body?.landline === "string" ? body.landline.trim() : "";
  const fax = typeof body?.fax === "string" ? body.fax.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const address = typeof body?.hostAddress === "string" ? body.hostAddress.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Host name is required." }, { status: 400 });
  }

  const zoneId = auth.session.zoneId;
  const existing = await prisma.hostOrganization.findFirst({ where: { zoneId, name } });
  if (existing) {
    return NextResponse.json({ error: "A host organization with this name already exists." }, { status: 409 });
  }

  const hostOrg = await prisma.hostOrganization.create({
    data: {
      name,
      address: address || undefined,
      officePhone: landline || undefined,
      mobilePhone: mobile || undefined,
      fax: fax || undefined,
      email: email || undefined,
      zoneId,
    },
  });

  return NextResponse.json({ id: hostOrg.id }, { status: 201 });
}
