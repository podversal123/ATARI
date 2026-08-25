import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

// Co-locate with the Neon database (ap-southeast-1 / Singapore) - without this Vercel runs functions in its default us-east region, adding a cross-Pacific round trip to every query.
export const preferredRegion = "sin1";

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
