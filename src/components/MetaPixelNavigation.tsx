"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackMetaPageView } from "@/lib/meta-pixel";

export default function MetaPixelNavigation() {
  const pathname = usePathname();
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    trackMetaPageView();
  }, [pathname]);

  return null;
}

