"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ClientMember } from "@/lib/client-data";
import styles from "../../portal-admin.module.css";

export default function MemberList({
  clientId,
  members,
}: {
  clientId: string;
  members: ClientMember[];
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  // The last revoke, kept so it can be put back. Nothing is destroyed by a
  // revoke, so undo is just re-linking the same account.
  const [undoable, setUndoable] = useState<ClientMember | null>(null);

  function nameFor(member: ClientMember) {
    return member.display_name || member.invited_email || "Linked account";
  }

  async function remove(member: ClientMember) {
    if (confirming !== member.id) {
      setConfirming(member.id);
      return;
    }
    setConfirming("");
    setError("");
    setMessage("");
    try {
      const response = await fetch(
        `/api/admin/clients/${clientId}/invite?memberId=${encodeURIComponent(member.id)}`,
        { method: "DELETE" },
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not remove their access.");
      setUndoable(member);
      setMessage("");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not remove their access.");
    }
  }

  /**
   * Puts a revoked person back. Their account was never deleted, so this
   * re-links the same one: no new invitation email, and their password still
   * works.
   */
  async function undoRemove() {
    if (!undoable) return;
    setError("");
    try {
      const response = await fetch(`/api/admin/clients/${clientId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: undoable.invited_email,
          relationship: undoable.relationship,
          name: undoable.invited_name || "",
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not restore their access.");
      setMessage(`${nameFor(undoable)} can sign in again.`);
      setUndoable(null);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not restore their access.");
    }
  }

  const undoBar = undoable && (
    <div className={styles.undoBar} role="status">
      <span>{nameFor(undoable)} can no longer sign in.</span>
      <button type="button" onClick={() => void undoRemove()}>Undo</button>
      <button type="button" onClick={() => setUndoable(null)} aria-label="Dismiss">Dismiss</button>
    </div>
  );

  if (members.length === 0) {
    return (
      <>
        {undoBar}
        <p className={styles.detailEmpty}>Nobody can sign in to this celebration yet.</p>
        {error && <p className={styles.formError} role="alert">{error}</p>}
      </>
    );
  }

  return (
    <>
      {undoBar}

      <ul className={styles.memberList}>
        {members.map((member) => (
          <li key={member.id}>
            <div>
              <strong>{nameFor(member)}</strong>
              {member.display_name && member.invited_email && <small>{member.invited_email}</small>}
            </div>
            <span>{member.relationship}</span>
            <button
              type="button"
              className={confirming === member.id ? styles.imageConfirm : undefined}
              onClick={() => void remove(member)}
              onBlur={() => setConfirming((current) => (current === member.id ? "" : current))}
              aria-label={
                confirming === member.id
                  ? `Confirm removing access for ${nameFor(member)}`
                  : `Remove access for ${nameFor(member)}`
              }
            >
              {confirming === member.id ? "Tap again" : "Remove"}
            </button>
          </li>
        ))}
      </ul>

      {/* Their account survives, so re-inviting them later costs nothing. */}
      {members.length === 1 && (
        <p className={styles.memberWarning}>
          Removing the last person leaves nobody able to open this portal.
        </p>
      )}
      {error && <p className={styles.formError} role="alert">{error}</p>}
      {message && <p className={styles.formSuccess} role="status">{message}</p>}
    </>
  );
}
