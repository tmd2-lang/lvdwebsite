"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import styles from "../../portal.module.css";

export default function PortalProfileForm({
  currentName,
  email,
}: {
  currentName: string;
  email: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function save(body: Record<string, string>, success: string, form?: HTMLFormElement) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/portal/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn’t save that.");
      setMessage(success);
      form?.reset();
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn’t save that.");
    } finally {
      setBusy(false);
    }
  }

  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("name") || "").trim();
    if (!name) {
      setError("Please tell us what to call you.");
      return;
    }
    await save({ name }, "Name updated.");
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const password = String(data.get("password") || "");
    const confirmation = String(data.get("confirmation") || "");
    if (password.length < 12) {
      setError("Please use at least 12 characters.");
      return;
    }
    if (password !== confirmation) {
      setError("Those passwords don’t match.");
      return;
    }
    await save({ password }, "Password updated.", form);
  }

  return (
    <div className={styles.profileStack}>
      {error && <p className={styles.loginError} role="alert">{error}</p>}
      {message && <p className={styles.profileSaved} role="status">{message}</p>}

      <section className={styles.panel}>
        <div className={styles.panelHeading}>
          <h2>Your Name</h2>
          <span>How the studio sees you</span>
        </div>
        <form className={styles.profileForm} onSubmit={(event) => void saveName(event)}>
          <label>
            Name
            <input name="name" defaultValue={currentName} required maxLength={60} disabled={busy} placeholder="Amara" />
          </label>
          <button type="submit" disabled={busy}>{busy ? "Saving…" : "Save name"}</button>
        </form>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeading}>
          <h2>Sign In</h2>
          <span>{email}</span>
        </div>
        <form className={styles.profileForm} onSubmit={(event) => void savePassword(event)}>
          <label>
            New password
            <input name="password" type="password" autoComplete="new-password" required minLength={12} disabled={busy} placeholder="At least 12 characters" />
          </label>
          <label>
            Confirm password
            <input name="confirmation" type="password" autoComplete="new-password" required minLength={12} disabled={busy} placeholder="Type it once more" />
          </label>
          <button type="submit" disabled={busy}>{busy ? "Saving…" : "Change password"}</button>
        </form>
        <p className={styles.profileNote}>
          Your email address is how the studio invited you. Ask them if it needs to change.
        </p>
      </section>
    </div>
  );
}
