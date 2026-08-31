import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Triggers a real browser download for an in-memory Blob (Excel/Word exports, etc.) - a fetched URL isn't needed since the file is generated client-side. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const IMAGE_EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
};

/**
 * Real per-row "Download" for an already-uploaded photo (Module Images,
 * Gallery) - the previewUrl is `/api/files/view?...`, a same-origin,
 * session-authenticated proxy in front of the private Blob store, so a
 * plain fetch + `downloadBlob` forces a real save instead of just opening
 * the image (which `<a href target="_blank">` alone only ever did). The
 * extension is read from the actual response Content-Type, not guessed
 * from the URL, since Blob URLs don't reliably carry one.
 */
export async function downloadImageFile(previewUrl: string, filenameBase: string) {
  const response = await fetch(previewUrl);
  if (!response.ok) throw new Error("Could not download this photograph.");
  const blob = await response.blob();
  const extension = IMAGE_EXTENSION_BY_MIME[blob.type] ?? ".jpg";
  downloadBlob(blob, `${filenameBase}${extension}`);
}
