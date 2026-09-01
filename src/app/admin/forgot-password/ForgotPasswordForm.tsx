"use client";

import { FormEvent, useState } from "react";
import styles from "../login/login.module.css";

export default function ForgotPasswordForm() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(""); setError("");
    const email = String(new FormData(event.currentTarget).get("email") || "");
    try {
      const response = await fetch("/api/admin/auth/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error("We couldn’t send the reset email.");
      setMessage(result.message || "If that email belongs to the studio, a reset link is on its way.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "We couldn’t send the reset email."); }
    finally { setBusy(false); }
  }

  return <form className={styles.form} onSubmit={(event) => void submit(event)}>
    <label><span>Email</span><input name="email" type="email" autoComplete="email" placeholder="you@example.com" required autoFocus /></label>
    {error && <p className={styles.error} role="alert">{error}</p>}
    {message && <p className={styles.success} role="status">{message}</p>}
    <button type="submit" disabled={busy}>{busy ? "Sending reset link…" : "Email me a reset link"}</button>
  </form>;
}
