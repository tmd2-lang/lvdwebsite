"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

/**
 * A visible "Saved" after every studio save, so nobody repeats one thinking it
 * failed. The page data reloads in the background; until it lands the message
 * reads "Saved. Updating…", then "Saved", then clears.
 */
export function useSaveStatus() {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!savedAt || refreshing) return;
    const timer = setTimeout(() => setSavedAt(null), 4000);
    return () => clearTimeout(timer);
  }, [savedAt, refreshing]);

  function saved() {
    setSavedAt(Date.now());
    startRefresh(() => router.refresh());
  }

  return { saved, saveLabel: savedAt ? (refreshing ? "Saved. Updating…" : "Saved") : "" };
}
