"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import styles from "../../portal-admin.module.css";

export default function InviteForm({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/clients/${clientId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.get("email"), relationship: data.get("relationship") }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not send that invitation.");

      setMessage(result.message || "Invitation sent.");
      form.reset();
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not send that invitation.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={styles.inviteForm} onSubmit={handleSubmit}>
      <div className={styles.inviteRow}>
        <label>
          <span>Email address</span>
          <input name="email" type="email" required placeholder="amara@example.com" disabled={busy} />
        </label>
        <label>
          <span>Who they are</span>
          <select name="relationship" defaultValue="client" disabled={busy}>
            <option value="client">Client</option>
            <option value="partner">Partner</option>
            <option value="family">Family</option>
            <option value="guest">Guest</option>
          </select>
        </label>
        <button type="submit" disabled={busy}>{busy ? "Sending…" : "Send invitation"}</button>
      </div>
      <p className={styles.inviteNote}>
        They receive a link and choose their own password. Nobody at the studio ever sees it.
      </p>
      {error && <p className={styles.formError} role="alert">{error}</p>}
      {message && <p className={styles.formSuccess} role="status">{message}</p>}
    </form>
  );
}
