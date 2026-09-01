"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  DESIGN_TIER_IDS,
  DESIGN_TIER_LABELS,
  PLANNING_PACKAGE_IDS,
  PLANNING_PACKAGE_LABELS,
} from "@/lib/client-types";
import styles from "../../portal-admin.module.css";

export default function NewClientForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerOneName: data.get("partnerOneName"),
          partnerTwoName: data.get("partnerTwoName"),
          email: data.get("email"),
          phone: data.get("phone"),
          eventDate: data.get("eventDate"),
          venue: data.get("venue"),
          location: data.get("location"),
          guestCount: data.get("guestCount"),
          planningPackage: data.get("planningPackage"),
          designTier: data.get("designTier"),
          notes: data.get("notes"),
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not save this client.");

      router.push("/admin/portal/clients");
      router.refresh();
    } catch (submitError) {
      setBusy(false);
      setError(submitError instanceof Error ? submitError.message : "Could not save this client.");
    }
  }

  return (
    <form className={styles.clientForm} onSubmit={handleSubmit}>
      <fieldset disabled={busy}>
        <legend>Who is celebrating</legend>
        <div className={styles.formRow}>
          <label>
            <span>First name<b aria-hidden="true">*</b></span>
            <input name="partnerOneName" required autoComplete="off" placeholder="Amara" />
          </label>
          <label>
            <span>Partner&rsquo;s name</span>
            <input name="partnerTwoName" autoComplete="off" placeholder="Julien" />
          </label>
        </div>
        <div className={styles.formRow}>
          <label>
            <span>Email</span>
            <input name="email" type="email" autoComplete="off" placeholder="amara@example.com" />
          </label>
          <label>
            <span>Phone</span>
            <input name="phone" type="tel" autoComplete="off" />
          </label>
        </div>
      </fieldset>

      <fieldset disabled={busy}>
        <legend>The celebration</legend>
        <div className={styles.formRow}>
          <label>
            <span>Event date</span>
            <input name="eventDate" type="date" />
            <small>Leave empty if the date is still open.</small>
          </label>
          <label>
            <span>Guest count</span>
            <input name="guestCount" autoComplete="off" placeholder="150" />
          </label>
        </div>
        <div className={styles.formRow}>
          <label>
            <span>Venue</span>
            <input name="venue" autoComplete="off" placeholder="Meridian House" />
          </label>
          <label>
            <span>City or area</span>
            <input name="location" autoComplete="off" placeholder="Washington, DC" />
          </label>
        </div>
      </fieldset>

      <fieldset disabled={busy}>
        <legend>What they booked</legend>
        <div className={styles.formRow}>
          <label>
            <span>Planning package<b aria-hidden="true">*</b></span>
            <select name="planningPackage" required defaultValue="full_planning">
              {PLANNING_PACKAGE_IDS.map((id) => (
                <option key={id} value={id}>{PLANNING_PACKAGE_LABELS[id]}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Design tier</span>
            <select name="designTier" defaultValue="">
              <option value="">None</option>
              {DESIGN_TIER_IDS.map((id) => (
                <option key={id} value={id}>{DESIGN_TIER_LABELS[id]}</option>
              ))}
            </select>
            <small>Optional. Separate from the planning package.</small>
          </label>
        </div>
        <label className={styles.fullWidth}>
          <span>Notes</span>
          <textarea name="notes" rows={3} placeholder="Anything the team should know." />
        </label>
      </fieldset>

      {error && <p className={styles.formError} role="alert">{error}</p>}

      <div className={styles.formActions}>
        <Link href="/admin/portal/clients">Cancel</Link>
        <button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Create client"}
          <span aria-hidden="true">{busy ? "" : "→"}</span>
        </button>
      </div>
    </form>
  );
}
