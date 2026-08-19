"use client";

import { useEffect, useRef } from "react";

const GOOGLE_ADS_APPOINTMENT_CONVERSION =
  "AW-11134478295/yhlaCPiwzeMcENfPqr0p";

type TrackingFunction = (
  command: string,
  eventName: string,
  parameters?: Record<string, string | number>,
) => void;

declare global {
  interface Window {
    gtag?: TrackingFunction;
    pintrk?: TrackingFunction;
  }
}

function trackAppointmentConversion() {
  window.gtag?.("event", "conversion", {
    send_to: GOOGLE_ADS_APPOINTMENT_CONVERSION,
    value: 0.0,
    currency: "USD",
  });
}

export default function MarketingConversionTracking() {
  const appointmentTracked = useRef(false);
  const googleLeadTracked = useRef(false);
  const pinterestLeadTracked = useRef(false);

  useEffect(() => {
    const trackInquiry = () => {
      if (!googleLeadTracked.current && window.gtag) {
        window.gtag("event", "conversion", {
          send_to: "AW-11134478295/LOpLCJ-l-ckcENfPqr0p",
        });
        googleLeadTracked.current = true;
      }

      if (!pinterestLeadTracked.current && window.pintrk) {
        window.pintrk("track", "lead", {
          event_id: `inquiry-${Date.now()}`,
          lead_type: "Inquiry",
        });
        pinterestLeadTracked.current = true;
      }

      return googleLeadTracked.current && pinterestLeadTracked.current;
    };

    trackInquiry();
    const trackingPoll = window.setInterval(() => {
      if (trackInquiry()) window.clearInterval(trackingPoll);
    }, 100);
    const trackingTimeout = window.setTimeout(() => {
      window.clearInterval(trackingPoll);
    }, 10_000);

    const handleCalendlyMessage = (event: MessageEvent<unknown>) => {
      if (event.origin !== "https://calendly.com") return;

      const data = event.data;
      if (
        typeof data !== "object" ||
        data === null ||
        !("event" in data) ||
        data.event !== "calendly.event_scheduled" ||
        appointmentTracked.current
      ) {
        return;
      }

      appointmentTracked.current = true;
      trackAppointmentConversion();
      window.pintrk?.("track", "lead", {
        event_id: `appointment-${Date.now()}`,
        lead_type: "Appointment",
      });
    };

    window.addEventListener("message", handleCalendlyMessage);
    return () => {
      window.clearInterval(trackingPoll);
      window.clearTimeout(trackingTimeout);
      window.removeEventListener("message", handleCalendlyMessage);
    };
  }, []);

  return null;
}
