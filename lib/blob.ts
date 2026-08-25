import "server-only";
import { put, get } from "@vercel/blob";

export type UploadKind = "staff-photo" | "staff-resume" | "cfld-crop-image";

const UPLOAD_RULES: Record<UploadKind, { folder: string; maxBytes: number; mimeTypes: string[] }> = {
  "staff-photo": {
    folder: "staff/photos",
    maxBytes: 5 * 1024 * 1024,
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  "cfld-crop-image": {
    folder: "cfld/crop-images",
    maxBytes: 5 * 1024 * 1024,
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  "staff-resume": {
    folder: "staff/resumes",
    maxBytes: 10 * 1024 * 1024,
    mimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
};

/** Only ever used by lib/api-auth.ts's routes after requireSession() has already passed - not exported to client code. */
export async function uploadPrivateFile(kind: UploadKind, file: File) {
  const rule = UPLOAD_RULES[kind];
  if (!rule.mimeTypes.includes(file.type)) {
    throw new Error(`Unsupported file type: ${file.type || "unknown"}`);
  }
  if (file.size > rule.maxBytes) {
    throw new Error(`File too large - max ${Math.round(rule.maxBytes / (1024 * 1024))}MB.`);
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const blob = await put(`${rule.folder}/${safeName}`, file, {
    access: "private",
    addRandomSuffix: true,
    contentType: file.type,
  });
  return blob;
}

/** Every blob store this app has ever created is private, region iad1 - a fresh env var swap (e.g. a new store) changes the hostname, so validate by suffix rather than hardcoding one store id. */
const PRIVATE_BLOB_HOST_SUFFIX = ".private.blob.vercel-storage.com";

export function isOwnPrivateBlobUrl(url: string) {
  try {
    return new URL(url).hostname.endsWith(PRIVATE_BLOB_HOST_SUFFIX);
  } catch {
    return false;
  }
}

/** Streams a private blob back out - callers must already have validated the URL with isOwnPrivateBlobUrl() and checked the caller's session. */
export async function readPrivateFile(url: string) {
  return get(url, { access: "private" });
}
