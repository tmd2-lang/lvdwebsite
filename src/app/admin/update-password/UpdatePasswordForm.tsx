"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import styles from "../login/login.module.css";

function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

export default function UpdatePasswordForm() {
  const [accessToken, setAccessToken] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const token = hash.get("access_token") || "";
    if (token) window.history.replaceState({}, document.title, "/admin/update-password");
    const timer = window.setTimeout(() => { setAccessToken(token); setReady(true); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") || "");
    const confirmation = String(data.get("confirmation") || "");
    setMessage(""); setError("");
    if (!accessToken) { setError("This reset link is missing or has expired. Request a new one."); return; }
    if (password.length < 12) { setError("Use a password with at least 12 characters."); return; }
    if (password !== confirmation) { setError("The passwords do not match."); return; }
    const config = supabaseConfig();
    if (!config) { setError("Password recovery is not configured yet."); return; }
    setBusy(true);
    try {
      const response = await fetch(`${config.url}/auth/v1/user`, { method: "PUT", headers: { apikey: config.anonKey, Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      if (!response.ok) throw new Error("That reset link is invalid or expired.");
      setMessage("Password updated. You can sign in with your new password now."); setAccessToken("");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Your password could not be updated."); }
    finally { setBusy(false); }
  }

  return <main className={styles.page}>
    <section className={styles.intro}><p className={styles.brand}>Lady Victoria Designs</p><div><p className={styles.script}>One more step</p><h1>Choose a new<br />password.</h1><p className={styles.introCopy}>Make it unique to your private studio account and keep it somewhere safe.</p></div><p className={styles.privateNote}>Private studio access</p></section>
    <section className={styles.formSide}><div className={styles.formWrap}><p className={styles.kicker}>Password recovery</p><h2>Set a new password.</h2><p className={styles.formCopy}>Use at least 12 characters. A password manager is the best place to keep it.</p>
      {ready ? <form className={styles.form} onSubmit={(event) => void submit(event)}><label><span>New password</span><input name="password" type="password" autoComplete="new-password" required minLength={12} /></label><label><span>Confirm password</span><input name="confirmation" type="password" autoComplete="new-password" required minLength={12} /></label>{error && <p className={styles.error} role="alert">{error}</p>}{message && <p className={styles.success} role="status">{message}</p>}<button type="submit" disabled={busy || !accessToken}>{busy ? "Updating password…" : "Update password"}</button></form> : <p className={styles.formCopy}>Preparing your secure reset link…</p>}
      <Link className={styles.siteLink} href="/admin/login">← Back to sign in</Link>
    </div></section>
  </main>;
}
