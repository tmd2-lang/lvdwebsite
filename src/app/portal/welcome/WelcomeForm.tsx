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

export default function WelcomeForm() {
  const router = useRouter();
  const [tokens, setTokens] = useState<{ access: string; refresh: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // Whatever the studio typed on the invitation, offered back so they do not
  // have to retype their own name. Fully editable.
  const [suggestedName, setSuggestedName] = useState("");

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
      if (access) window.history.replaceState(null, "", "/portal/welcome");
      setTokens(access ? { access, refresh } : null);
      setReady(true);
    }, 0);

    // Read back the name attached to the invitation. Failing is harmless: the
    // field is simply empty and they type it themselves.
    if (access) {
      const config = supabaseConfig();
      if (config) {
        void fetch(`${config.url}/auth/v1/user`, {
          headers: { apikey: config.anonKey, Authorization: `Bearer ${access}` },
        })
          .then((response) => (response.ok ? response.json() : null))
          .then((user: { user_metadata?: { first_name?: string } } | null) => {
            const invited = user?.user_metadata?.first_name?.trim();
            if (invited) setSuggestedName(invited);
          })
          .catch(() => null);
      }
    }

    return () => window.clearTimeout(timer);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const firstName = String(data.get("firstName") || "").trim();
    const password = String(data.get("password") || "");
    const confirmation = String(data.get("confirmation") || "");
    setError("");

    if (!firstName) {
      setError("Please tell us what to call you.");
      return;
    }

    if (!tokens?.access) {
      setError("This link has expired. Ask the studio to send you a new invitation.");
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
        body: JSON.stringify({
          password,
          data: { first_name: firstName, display_name: firstName },
        }),
      });
      if (!saved.ok) throw new Error("This link has expired. Ask the studio for a new invitation.");

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
          This link is missing or has expired. Invitations are single use, so if you have
          already set a password you can go straight to signing in.
        </p>
        <Link className={styles.welcomeSignIn} href="/portal/login">Go to sign in <span aria-hidden="true">→</span></Link>
      </div>
    );
  }

  return (
    <form className={styles.loginForm} onSubmit={(event) => void submit(event)}>
      <label>
        What should we call you?
        <input name="firstName" type="text" autoComplete="given-name" required maxLength={60} disabled={busy} placeholder="Amara" defaultValue={suggestedName} key={suggestedName} />
      </label>
      <label>
        Choose a password
        <input name="password" type="password" autoComplete="new-password" required minLength={12} disabled={busy} placeholder="At least 12 characters" />
      </label>
      <label>
        Confirm password
        <input name="confirmation" type="password" autoComplete="new-password" required minLength={12} disabled={busy} placeholder="Type it once more" />
      </label>

      {error && <p className={styles.loginError} role="alert">{error}</p>}

      <button className={styles.loginSubmit} type="submit" disabled={busy}>
        {busy ? "Opening your portal…" : "Open my portal"}
        <span aria-hidden="true">{busy ? "" : "→"}</span>
      </button>
      <p className={styles.loginSupport}>Only you will know this password. The studio never sees it.</p>
    </form>
  );
}
