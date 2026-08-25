import "server-only";
import { NextResponse } from "next/server";
import { getSessionPayload, type SessionPayload } from "@/lib/auth";
import type { Role } from "@/lib/generated/prisma/enums";

export type AuthResult =
  | { ok: true; session: SessionPayload }
  | { ok: false; response: NextResponse };

/** Reusable guard for API route handlers: verifies the session cookie, optionally restricts by role. */
export async function requireSession(allowedRoles?: Role[]): Promise<AuthResult> {
  const session = await getSessionPayload();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Not signed in." }, { status: 401 }),
    };
  }
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Not authorized." }, { status: 403 }),
    };
  }
  return { ok: true, session };
}
