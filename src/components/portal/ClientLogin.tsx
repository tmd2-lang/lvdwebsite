"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "@/app/portal/portal.module.css";
import StudioSupport from "@/components/portal/StudioSupport";

export default function ClientLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      const response = await fetch("/api/portal/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn’t sign you in.");

      router.push("/portal");
      router.refresh();
    } catch (submitError) {
      setPending(false);
      setError(submitError instanceof Error ? submitError.message : "We couldn’t sign you in.");
    }
  }

  return (
    <form className={styles.loginForm} onSubmit={handleSubmit} noValidate={false}>
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
          disabled={pending}
          aria-invalid={error ? true : undefined}
        />
      </label>

      <label>
        Password
        <input
          required
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          disabled={pending}
          aria-invalid={error ? true : undefined}
        />
      </label>

      {error && <p className={styles.loginError} role="alert">{error}</p>}

      <div className={styles.loginOptions}>
        <label><input type="checkbox" name="remember" disabled={pending} /> Remember me</label>
        <Link href="/portal/forgot-password" tabIndex={pending ? -1 : undefined} aria-disabled={pending || undefined}>Forgot password?</Link>
      </div>

      <button className={styles.loginSubmit} type="submit" disabled={pending}>
        {pending ? "Signing you in…" : "Enter your portal"}
        <span aria-hidden="true">{pending ? "" : "→"}</span>
      </button>

      <StudioSupport />
    </form>
  );
}
