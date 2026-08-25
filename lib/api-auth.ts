import "server-only";
import { NextResponse } from "next/server";
import { getSessionPayload, type SessionPayload } from "@/lib/auth";
import type { Role } from "@/lib/generated/prisma/enums";

export type AuthResult =
  | { ok: true; session: SessionPayload }
  | { ok: false; response: NextResponse };

/** Vercel sets x-forwarded-for to "client, proxy1, proxy2..." - the first entry is the real client. */
export function getClientIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip");
}

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
