"use client";

import { useState } from "react";
import styles from "@/app/portal/portal.module.css";

export default function ClientLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    // Auth is not connected yet. This stands in for the request so the
    // pending and error states are real and reviewable.
    window.setTimeout(() => {
      setPending(false);
      setError("Client accounts aren’t active yet. Reach out to the studio and we’ll get you set up.");
    }, 700);
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
        <button type="button" disabled={pending}>Forgot password?</button>
      </div>

      <button className={styles.loginSubmit} type="submit" disabled={pending}>
        {pending ? "Signing you in…" : "Enter your portal"}
        <span aria-hidden="true">{pending ? "" : "→"}</span>
      </button>

      <p className={styles.loginSupport}>Need assistance? <button type="button">Contact the studio</button></p>
    </form>
  );
}
