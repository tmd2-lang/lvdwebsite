"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
  const [shouldShow, setShouldShow] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    // Check if the user has already seen the preloader during this browsing session
    const hasSeen = sessionStorage.getItem("lvd_preloader_seen");
    if (!hasSeen) {
      setShouldShow(true);
      sessionStorage.setItem("lvd_preloader_seen", "true");
    }
  }, []);

  // If not mounted yet or already seen in this session, do not render
  if (!isMounted || !shouldShow) {
    return null;
  }

  return (
    <div
      className="site-preloader pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center bg-ivory text-ink"
      aria-hidden="true"
    >
      <div className="site-preloader__label font-display italic text-2xl mb-4 text-ink">
        Lady Victoria Designs
      </div>
      <div className="w-48 h-[1px] bg-ink/10 relative overflow-hidden">
        <div className="site-preloader__line absolute top-0 left-0 h-full w-full bg-gold" />
      </div>
    </div>
  );
}
