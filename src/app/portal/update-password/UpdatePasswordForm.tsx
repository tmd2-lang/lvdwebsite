"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import styles from "../portal.module.css";

function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

export default function UpdatePasswordForm() {
  const router = useRouter();
  const [tokens, setTokens] = useState<{ access: string; refresh: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Supabase puts the one-time tokens in the part of the address after "#",
    // which never reaches the server. Read them, then clear them from the bar.
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const access = hash.get("access_token") || "";
    const refresh = hash.get("refresh_token") || "";

    // Deferred to the next tick on purpose. Clearing the hash during hydration
    // gets undone: the App Router installs its own history entry from the
    // original address straight after, putting the token back in the bar.
    const timer = window.setTimeout(() => {
      if (access) window.history.replaceState(null, "", "/portal/update-password");
      setTokens(access ? { access, refresh } : null);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") || "");
    const confirmation = String(data.get("confirmation") || "");
    setError("");

    if (!tokens?.access) {
      setError("This link has expired. Please request a new one.");
      return;
    }
    if (password.length < 12) {
      setError("Please use at least 12 characters.");
      return;
    }
    if (password !== confirmation) {
      setError("Those passwords don’t match.");
      return;
    }

    const config = supabaseConfig();
    if (!config) {
      setError("The portal isn’t ready yet. Please contact the studio.");
      return;
    }

    setBusy(true);
    try {
      const saved = await fetch(`${config.url}/auth/v1/user`, {
        method: "PUT",
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${tokens.access}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });
      if (!saved.ok) throw new Error("This link has expired. Please request a new one.");

      // Open their portal straight away rather than asking them to sign in again.
      const session = await fetch("/api/portal/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: tokens.access, refreshToken: tokens.refresh }),
      });
      const result = await session.json().catch(() => ({}));
      if (!session.ok) throw new Error(result.error || "We couldn’t open your portal.");

      router.push("/portal");
      router.refresh();
    } catch (caught) {
      setBusy(false);
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
    }
  }

  if (!ready) return <p className={styles.welcomeWaiting}>Just a moment…</p>;

  if (!tokens) {
    return (
      <div className={styles.welcomeExpired}>
        <p>
          This reset link is missing or has expired. Reset links are single use and
          time limited, so please request a fresh one.
        </p>
        <Link className={styles.welcomeSignIn} href="/portal/forgot-password">
          Send a new link <span aria-hidden="true">→</span>
        </Link>
      </div>
    );
  }

  return (
    <form className={styles.loginForm} onSubmit={(event) => void submit(event)}>
      <label>
        Choose a new password
        <input name="password" type="password" autoComplete="new-password" required minLength={12} disabled={busy} placeholder="At least 12 characters" />
      </label>
      <label>
        Confirm password
        <input name="confirmation" type="password" autoComplete="new-password" required minLength={12} disabled={busy} placeholder="Type it once more" />
      </label>

      {error && <p className={styles.loginError} role="alert">{error}</p>}

      <button className={styles.loginSubmit} type="submit" disabled={busy}>
        {busy ? "Opening your portal…" : "Save and open my portal"}
        <span aria-hidden="true">{busy ? "" : "→"}</span>
      </button>
      <p className={styles.loginSupport}>Only you will know this password. The studio never sees it.</p>
    </form>
  );
}
