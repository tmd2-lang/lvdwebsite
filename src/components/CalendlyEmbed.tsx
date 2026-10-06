"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";

import { consultationContext, consultationUrl } from "@/lib/consultation-booking";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        resize?: boolean;
        prefill?: { name: string; email: string };
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

    const context = consultationContext();
    window.Calendly.initInlineWidget({
      url: consultationUrl(),
      ...(context ? { prefill: { name: context.name, email: context.email } } : {}),
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
