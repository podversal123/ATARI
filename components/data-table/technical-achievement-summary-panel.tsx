"use client";

import { useSession } from "@/lib/session";
import { TechnicalAchievementSummary } from "./technical-achievement-summary";

/**
 * Resolves the report's scope from the signed-in role. A Super Admin sees the
 * figures aggregated across every KVK; a KVK Admin sees only their own, which
 * is a data scope difference rather than a different screen.
 */
export function TechnicalAchievementSummaryPanel() {
  const session = useSession();
  const isKvk = session.role !== "super-admin";

  return (
    <TechnicalAchievementSummary
      scopeNote={
        isKvk
          ? `Figures for ${session.kvkName ?? "your KVK"}`
          : "Figures aggregated across all KVKs"
      }
      showKvkFilter={!isKvk}
    />
  );
}
