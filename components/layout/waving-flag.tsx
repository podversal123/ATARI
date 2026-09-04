import { cn } from "@/lib/utils";

/**
 * The Indian national flag on a pole - the topbar mark on every dashboard
 * page. Client supplied the real waving-flag animation as a GIF
 * (2026-09-04); it lives at public/brand/waving-flag.gif (down from the
 * original 47 MB / 3000x3000 to ~200 KB / 150px, cropped to the flag and
 * capped at 15 fps so it stays a lightweight topbar asset). Kept as a plain
 * <img> - an animated GIF must not go through next/image, which would
 * freeze it on the first frame.
 */
export function WavingFlag({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- next/image would optimise this animated GIF into a still first frame
    <img
      src="/brand/waving-flag.gif"
      alt="Flag of India"
      className={cn("h-9 w-auto shrink-0 object-contain", className)}
    />
  );
}
