import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionCookie } from "@/lib/auth";

// Co-locate with the Neon database (ap-southeast-1 / Singapore) - without this Vercel runs functions in its default us-east region, adding a cross-Pacific round trip to every query.
export const preferredRegion = "sin1";

/** Maps the DB's Role enum to the client session's role string - lib/session.ts's Session shape is kept as-is so no consumer needs to change. */
function toClientRole(role: string) {
  if (role === "SUPER_ADMIN") return "super-admin";
  if (role === "KVK_ADMIN") return "kvk-admin";
  return "kvk-user";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { username },
    include: { kvk: true },
  });

  // Same generic error whether the username doesn't exist or the password is
  // wrong - never leak which one it was.
  const invalid = () =>
    NextResponse.json({ error: "Invalid username or password." }, { status: 401 });

  if (!user) return invalid();

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return invalid();

  await createSessionCookie({
    sub: user.id,
    role: user.role,
    zoneId: user.zoneId,
    kvkId: user.kvkId,
  });

  return NextResponse.json({
    role: toClientRole(user.role),
    kvkName: user.kvk?.name,
  });
}
