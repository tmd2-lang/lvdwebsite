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
      setMessage(`${nameFor(member)} can no longer sign in.`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not remove their access.");
    }
  }

  if (members.length === 0) {
    return <p className={styles.detailEmpty}>Nobody can sign in to this celebration yet.</p>;
  }

  return (
    <>
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
              {confirming === member.id ? "Tap again" : "Remove access"}
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
