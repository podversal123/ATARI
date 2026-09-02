import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { uploadPrivateFile, type UploadKind } from "@/lib/blob";
import { safeErrorMessage } from "@/lib/safe-error-message";

const VALID_KINDS: UploadKind[] = [
  "staff-photo",
  "staff-resume",
  "cfld-crop-image",
  "module-image",
  "cfld-training-photo",
  "cfld-action-photo",
  "oft-photograph",
  "oft-supplementary-datasheet",
  "farmer-award-photo",
];

export async function POST(request: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const kind = formData?.get("kind");

  if (!(file instanceof File) || typeof kind !== "string" || !VALID_KINDS.includes(kind as UploadKind)) {
    return NextResponse.json({ error: "A file and a valid kind are required." }, { status: 400 });
  }

  try {
    const blob = await uploadPrivateFile(kind as UploadKind, file);
    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (error) {
    const message = safeErrorMessage(error, "Upload failed.");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
