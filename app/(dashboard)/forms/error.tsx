"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const RELOAD_FLAG = "forms-chunk-reload";

/**
 * The real reference app's Performance Indicators page (/forms/performance)
 * is known to crash on a stale chunk load (a deploy replaced the JS chunk
 * files while the tab was still open with old references). Rather than
 * replicate that crash, force a one-time reload to recover automatically;
 * sessionStorage prevents a reload loop if the error persists.
 */
export default function FormsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const isChunkLoadError =
      error.name === "ChunkLoadError" || /Loading chunk [\d]+ failed/i.test(error.message);

    if (isChunkLoadError && !sessionStorage.getItem(RELOAD_FLAG)) {
      sessionStorage.setItem(RELOAD_FLAG, "1");
      window.location.reload();
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-card py-24 text-center">
      <p className="text-sm text-muted-foreground">Something went wrong loading this page.</p>
      <Button size="sm" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
