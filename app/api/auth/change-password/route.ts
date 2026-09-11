import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPayload, hashPassword, verifyPassword } from "@/lib/auth";

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export async function POST(request: Request) {
  const session = await getSessionPayload();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { passwordHash: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  /**
   * Verify the account holder actually knows the current password before
   * accepting a new one - without this, anyone who gets hold of an already-
   * open, still-authenticated session (shared/unlocked machine, a hijacked
   * cookie) could permanently lock the real owner out just by knowing the
   * new password to set, with no proof of identity required.
   */
  const currentOk = currentPassword ? await verifyPassword(currentPassword, user.passwordHash) : false;
  if (!currentOk) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }

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
