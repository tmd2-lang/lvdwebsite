"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import styles from "../portal.module.css";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setBusy(true);

    try {
      const response = await fetch("/api/portal/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn’t send that link.");
      setMessage(result.message || "If that address has a portal, a reset link is on its way.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn’t send that link.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={styles.loginForm} onSubmit={(event) => void submit(event)}>
      <label>
        Email address
        <input
          required
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          disabled={busy}
        />
      </label>

      {error && <p className={styles.loginError} role="alert">{error}</p>}
      {message && <p className={styles.loginSupport} role="status">{message}</p>}

      <button className={styles.loginSubmit} type="submit" disabled={busy}>
        {busy ? "Sending your link…" : "Send reset link"}
        <span aria-hidden="true">{busy ? "" : "→"}</span>
      </button>

      <p className={styles.loginSupport}>
        Remembered it? <Link href="/portal/login">Back to sign in</Link>
      </p>
    </form>
  );
}
