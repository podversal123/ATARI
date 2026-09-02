import { downloadBlob } from "./utils";
import type { ModuleImageRecord } from "./module-images";

const IMAGE_EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
};

function safeName(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, "-").trim();
}

/**
 * Real ZIP bulk download for the "Download Images By" menu (Super Admin)
 * and the KVK Admin "Bulk Download" button - both were dead/stubbed with no
 * backend or storage before. Fetches each row's own previewUrl (the
 * session-authenticated /api/files/view proxy, same one the per-row
 * Download already uses), packs every photograph into one ZIP, one folder
 * per KVK so a multi-KVK download stays organized. Rows whose fetch fails
 * are silently skipped rather than aborting the whole download - the return
 * value reports how many made it in so the caller can tell the user.
 */
export async function downloadModuleImagesZip(
  rows: ModuleImageRecord[],
  zipName: string,
): Promise<{ included: number; skipped: number }> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  let included = 0;
  let skipped = 0;

  await Promise.all(
    rows.map(async (row, index) => {
      if (!row.previewUrl) {
        skipped += 1;
        return;
      }
      try {
        const response = await fetch(row.previewUrl);
        if (!response.ok) throw new Error("fetch failed");
        const blob = await response.blob();
        const extension = IMAGE_EXTENSION_BY_MIME[blob.type] ?? ".jpg";
        const folder = safeName(row.kvk) || "Unknown KVK";
        const fileName = `${safeName(row.caption) || "photo"} - ${index + 1}${extension}`;
        zip.file(`${folder}/${fileName}`, blob);
        included += 1;
      } catch {
        skipped += 1;
      }
    }),
  );

  const content = await zip.generateAsync({ type: "blob" });
  downloadBlob(content, `${zipName}.zip`);
  return { included, skipped };
}
