import type { ReportSection } from "./report-types";

/**
 * Collects every Module-Image url referenced across a built report tree and
 * fetches each once (via the same-origin file proxy, which needs the browser
 * session), returning a `url -> data-URL` map the PDF / Word / Excel
 * renderers embed from. The HTML preview uses the urls directly as <img src>
 * and needs none of this.
 */
export async function prefetchReportImages(sections: ReportSection[]): Promise<Map<string, string>> {
  const urls = new Set<string>();
  for (const sec of sections) for (const sub of sec.subsections) for (const im of sub.images ?? []) urls.add(im.url);
  const out = new Map<string, string>();
  await Promise.all(
    [...urls].map(async (url) => {
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const blob = await res.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const fr = new FileReader();
          fr.onload = () => resolve(String(fr.result));
          fr.onerror = () => reject(fr.error);
          fr.readAsDataURL(blob);
        });
        out.set(url, dataUrl);
      } catch {
        // A missing/blocked image is skipped, not fatal.
      }
    }),
  );
  return out;
}
