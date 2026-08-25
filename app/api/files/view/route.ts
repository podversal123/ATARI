import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { isOwnPrivateBlobUrl, readPrivateFile } from "@/lib/blob";

/**
 * Every uploaded file (Staff Photo/Resume, CFLD crop images) lives in a
 * private Blob store - the DB just holds the blob's URL string, which isn't
 * directly fetchable by a browser. Any signed-in user can view any file
 * through this route (this app's whole RBAC model is per-page/per-KVK, not
 * per-file) - it exists to keep files off the public internet entirely, not
 * to add a second access-control layer on top.
 */
export async function GET(request: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const url = new URL(request.url).searchParams.get("url");
  if (!url || !isOwnPrivateBlobUrl(url)) {
    return NextResponse.json({ error: "Invalid file reference." }, { status: 400 });
  }

  const result = await readPrivateFile(url);
  if (!result || result.statusCode !== 200) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      "Content-Disposition": "inline",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
