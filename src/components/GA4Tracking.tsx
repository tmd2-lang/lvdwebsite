"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { isPublicPage, trackGA4 } from "@/lib/ga4";

export default function GA4Tracking() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const lastPage = useRef("");
  const appointments = useRef(new Set<string>());

  useEffect(() => {
    const key = `${pathname}?${search}`;
    if (lastPage.current === key) return;
    lastPage.current = key;
    if (isPublicPage(pathname)) trackGA4("page_view");
  }, [pathname, search]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://calendly.com" || event.data?.event !== "calendly.event_scheduled") return;
      // Accept messages only from a Calendly iframe on this page.
      const trusted = Array.from(document.querySelectorAll("iframe")).some(frame => {
        try { return new URL(frame.src).origin === event.origin && frame.contentWindow === event.source; }
        catch { return false; }
      });
      if (!trusted) return;
      const uri = event.data?.payload?.event?.uri;
      const key = typeof uri === "string" ? uri : "scheduled";
      if (appointments.current.has(key)) return;
      appointments.current.add(key);
      trackGA4("book_appointment");
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);
  return null;
}
