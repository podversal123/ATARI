import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPayload, hashPassword } from "@/lib/auth";

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export async function POST(request: Request) {
  const session = await getSessionPayload();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  if (!PASSWORD_RULE.test(newPassword)) {
    return NextResponse.json(
      {
        error:
          "Password must be at least 8 characters and contain uppercase, lowercase, and a number.",
      },
      { status: 400 },
    );
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: session.sub },
    data: { passwordHash },
  });

  return NextResponse.json({ ok: true });
}
