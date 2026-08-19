"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";

const CALENDLY_URL = "https://calendly.com/ladyvictoriadesigns";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        resize?: boolean;
      }) => void;
    };
  }
}

export default function CalendlyEmbed() {
  const containerRef = useRef<HTMLDivElement>(null);

  const initializeCalendly = useCallback(() => {
    const container = containerRef.current;
    if (!container || !window.Calendly || container.dataset.initialized === "true") {
      return;
    }

    window.Calendly.initInlineWidget({
      url: CALENDLY_URL,
      parentElement: container,
      resize: true,
    });
    container.dataset.initialized = "true";
  }, []);

  useEffect(() => {
    initializeCalendly();
  }, [initializeCalendly]);

  return (
    <>
      <Script
        id="calendly-widget"
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
        onLoad={initializeCalendly}
        onReady={initializeCalendly}
      />
      <div ref={containerRef} className="w-full min-h-[620px]" />
    </>
  );
}
