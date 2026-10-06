"use client";
import { useEffect, useRef, type ComponentProps } from "react";
import { CONSULTATION_URL, consultationUrl } from "@/lib/consultation-booking";
export default function CalendlyBookingLink(props: ComponentProps<"a">) {
  const anchor = useRef<HTMLAnchorElement>(null);
  useEffect(() => { if (anchor.current) anchor.current.href = consultationUrl(); }, []);
  return <a {...props} ref={anchor} href={CONSULTATION_URL} />;
}
