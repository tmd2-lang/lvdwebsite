"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  CLIENT_STATUSES,
  CLIENT_STATUS_LABELS,
  DESIGN_TIER_IDS,
  DESIGN_TIER_LABELS,
  PLANNING_PACKAGE_IDS,
  PLANNING_PACKAGE_LABELS,
  type PortalClient,
} from "@/lib/client-types";
import styles from "../../../portal-admin.module.css";

export default function EditClientForm({ client }: { client: PortalClient }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerOneName: data.get("partnerOneName"), partnerTwoName: data.get("partnerTwoName"),
          email: data.get("email"), phone: data.get("phone"), eventDate: data.get("eventDate"),
          venue: data.get("venue"), location: data.get("location"), guestCount: data.get("guestCount"),
          planningPackage: data.get("planningPackage"), designTier: data.get("designTier"),
          status: data.get("status"), notes: data.get("notes"),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not update this client.");
      router.push(`/admin/portal/clients/${client.id}`);
      router.refresh();
    } catch (caught) {
      setBusy(false);
      setError(caught instanceof Error ? caught.message : "Could not update this client.");
    }
  }

  async function deleteRecord() {
    setDeleting(true);
    setDeleteError("");
    try {
      const response = await fetch(`/api/admin/clients/${client.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not delete this client.");
      router.push("/admin/portal/clients");
      router.refresh();
    } catch (caught) {
      setDeleting(false);
      setDeleteError(caught instanceof Error ? caught.message : "Could not delete this client.");
    }
  }

  return (
    <>
      <form className={styles.clientForm} onSubmit={handleSubmit}>
      <fieldset disabled={busy}>
        <legend>Who is celebrating</legend>
        <div className={styles.formRow}>
          <label><span>First name<b aria-hidden="true">*</b></span><input name="partnerOneName" required defaultValue={client.partner_one_name} /></label>
          <label><span>Partner&rsquo;s name</span><input name="partnerTwoName" defaultValue={client.partner_two_name || ""} /></label>
        </div>
        <div className={styles.formRow}>
          <label><span>Email</span><input name="email" type="email" defaultValue={client.email || ""} /></label>
          <label><span>Phone</span><input name="phone" type="tel" defaultValue={client.phone || ""} /></label>
        </div>
      </fieldset>

      <fieldset disabled={busy}>
        <legend>The celebration</legend>
        <div className={styles.formRow}>
          <label><span>Event date</span><input name="eventDate" type="date" defaultValue={client.event_date || ""} /><small>Leave empty if the date is still open.</small></label>
          <label><span>Guest count</span><input name="guestCount" defaultValue={client.guest_count || ""} /></label>
        </div>
        <div className={styles.formRow}>
          <label><span>Venue</span><input name="venue" defaultValue={client.venue || ""} /></label>
          <label><span>City or area</span><input name="location" defaultValue={client.location || ""} /></label>
        </div>
      </fieldset>

      <fieldset disabled={busy}>
        <legend>Portal setup</legend>
        <div className={styles.formRow}>
          <label><span>Planning package</span><select name="planningPackage" defaultValue={client.planning_package}>{PLANNING_PACKAGE_IDS.map((id) => <option key={id} value={id}>{PLANNING_PACKAGE_LABELS[id]}</option>)}</select></label>
          <label><span>Design tier</span><select name="designTier" defaultValue={client.design_tier || ""}><option value="">None</option>{DESIGN_TIER_IDS.map((id) => <option key={id} value={id}>{DESIGN_TIER_LABELS[id]}</option>)}</select></label>
        </div>
        <div className={styles.formRow}>
          <label><span>Client status</span><select name="status" defaultValue={client.status}>{CLIENT_STATUSES.map((status) => <option key={status} value={status}>{CLIENT_STATUS_LABELS[status]}</option>)}</select></label>
        </div>
        <label className={styles.fullWidth}><span>Notes</span><textarea name="notes" rows={3} defaultValue={client.notes || ""} /></label>
      </fieldset>

      {error && <p className={styles.formError} role="alert">{error}</p>}
      <div className={styles.formActions}>
        <Link href={`/admin/portal/clients/${client.id}`}>Cancel</Link>
        <button type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}<span aria-hidden="true">{busy ? "" : "→"}</span></button>
      </div>
      </form>

      <section className={styles.dangerZone} aria-labelledby="delete-client-heading">
        <div>
          <p className={styles.eyebrow}>Danger zone</p>
          <h2 id="delete-client-heading">Delete This Client</h2>
          <p>Removes their portal record, invoices, uploaded documents, and portal access. This cannot be undone.</p>
        </div>
        <button type="button" onClick={() => setDeleteOpen(true)}>Delete client</button>
      </section>

      {deleteOpen && (
        <div className={styles.deleteBackdrop} role="presentation">
          <section className={styles.deleteDialog} role="dialog" aria-modal="true" aria-labelledby="delete-dialog-heading">
            <p className={styles.eyebrow}>Permanent action</p>
            <h2 id="delete-dialog-heading">Delete {client.display_name}?</h2>
            <p>This removes the client record and everything stored inside their portal. Their login account remains available to reuse later.</p>
            <label>
              <span>Type <strong>{client.display_name}</strong> to confirm</span>
              <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoFocus disabled={deleting} />
            </label>
            {deleteError && <p className={styles.formError} role="alert">{deleteError}</p>}
            <div className={styles.deleteDialogActions}>
              <button type="button" onClick={() => { setDeleteOpen(false); setConfirmation(""); setDeleteError(""); }} disabled={deleting}>Cancel</button>
              <button type="button" onClick={() => void deleteRecord()} disabled={confirmation !== client.display_name || deleting}>{deleting ? "Deleting…" : "Delete permanently"}</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
