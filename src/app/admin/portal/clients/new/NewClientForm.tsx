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

export type ClientPrefill = {
  partnerOneName: string;
  partnerTwoName: string;
  email: string;
  phone: string;
  eventDate: string;
  venue: string;
  guestCount: string;
  notes: string;
};

export default function NewClientForm({ leadId, prefill }: { leadId?: string; prefill?: ClientPrefill }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [booked, setBooked] = useState(true);
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
          bookedOn: data.get("bookedOn"),
          status: data.get("status"),
          venue: data.get("venue"),
          location: data.get("location"),
          guestCount: data.get("guestCount"),
          planningPackage: data.get("planningPackage"),
          designTier: data.get("designTier"),
          notes: data.get("notes"),
          leadId: leadId ?? "",
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        // Someone converted this inquiry first: open their client instead.
        if (response.status === 409 && result.clientId) {
          router.push(`/admin/portal/clients/${result.clientId}`);
          return;
        }
        throw new Error(result.error || "Could not save this client.");
      }

      // A converted inquiry goes straight to its new client, ready to plan.
      router.push(leadId && result.client?.id ? `/admin/portal/clients/${result.client.id}?tab=checklist` : "/admin/portal/clients");
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
            <input name="partnerOneName" required autoComplete="off" placeholder="Amara" defaultValue={prefill?.partnerOneName} />
          </label>
          <label>
            <span>Partner&rsquo;s name</span>
            <input name="partnerTwoName" autoComplete="off" placeholder="Julien" defaultValue={prefill?.partnerTwoName} />
          </label>
        </div>
        <div className={styles.formRow}>
          <label>
            <span>Email</span>
            <input name="email" type="email" autoComplete="off" placeholder="amara@example.com" defaultValue={prefill?.email} />
          </label>
          <label>
            <span>Phone</span>
            <input name="phone" type="tel" autoComplete="off" defaultValue={prefill?.phone} />
          </label>
        </div>
      </fieldset>

      <fieldset disabled={busy}>
        <legend>The celebration</legend>
        <div className={styles.formRow}>
          <label>
            <span>Event date</span>
            <input name="eventDate" type="date" defaultValue={prefill?.eventDate} />
            <small>Leave empty if the date is still open.</small>
          </label>
          <label>
            <span>Guest count</span>
            <input name="guestCount" autoComplete="off" placeholder="150" defaultValue={prefill?.guestCount} />
          </label>
        </div>
        <div className={styles.formRow}>
          <label>
            <span>Venue</span>
            <input name="venue" autoComplete="off" placeholder="Meridian House" defaultValue={prefill?.venue} />
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
            <span>Status<b aria-hidden="true">*</b></span>
            <select name="status" defaultValue="booked" onChange={(event) => setBooked(event.target.value === "booked")}>
              <option value="booked">Booked</option>
              <option value="active">Still deciding</option>
            </select>
          </label>
          <label>
            <span>Booked on{booked && <b aria-hidden="true">*</b>}</span>
            <input name="bookedOn" type="date" required={booked} />
            <small>{booked ? "The day they booked. Onboarding deadlines and the checklist schedule count from this date." : "Add it in Edit once they book."}</small>
          </label>
        </div>
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
          <textarea name="notes" rows={prefill?.notes ? 6 : 3} placeholder="Anything the team should know." defaultValue={prefill?.notes} />
        </label>
      </fieldset>

      {error && <p className={styles.formError} role="alert">{error}</p>}

      <div className={styles.formActions}>
        <Link href="/admin/portal/clients">Cancel</Link>
        <button type="submit" disabled={busy}>
          {busy ? "Saving…" : leadId ? "Make them a client" : "Create client"}
          <span aria-hidden="true">{busy ? "" : "→"}</span>
        </button>
      </div>
    </form>
  );
}
