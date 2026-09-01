"use client";

import { useState } from "react";
import styles from "@/app/portal/portal.module.css";

const SUPPORT_EMAIL = "hello@ladyvictoriadesigns.com";
const SUPPORT_MAILTO = "mailto:hello@ladyvictoriadesigns.com?subject=Client%20portal%20support&body=Hi%20Lady%20Victoria%20Designs%20team%2C%0A%0AI%20need%20help%20accessing%20my%20client%20portal.%0A%0AName%3A%0AEvent%20date%3A%0A";

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

export default function StudioSupport() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await copyText(SUPPORT_EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={styles.loginSupportWrap}>
      <p className={styles.loginSupport}>
        Need assistance?{" "}
        <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-controls="portal-support-options">
          Contact the studio
        </button>
      </p>

      {open && (
        <section className={styles.loginSupportPanel} id="portal-support-options" aria-label="Client portal support">
          <div>
            <strong>We’re here to help.</strong>
            <p>Email the studio with your name and event date so we can locate your portal.</p>
          </div>
          <a href={SUPPORT_MAILTO}>{SUPPORT_EMAIL}</a>
          <button type="button" onClick={() => void copyEmail()}>{copied ? "Email copied" : "Copy email"}</button>
        </section>
      )}
    </div>
  );
}
