import Link from "next/link";
import { redirect } from "next/navigation";
import { canManageClientPortal, getAdminUser, hasAdminRefreshToken } from "@/lib/admin-auth";
import { getLeadForConversion, type LeadForConversion } from "@/lib/admin-data";
import { getClientByLeadId, getClients } from "@/lib/client-data";
import NewClientForm, { type ClientPrefill } from "./NewClientForm";
import styles from "../../portal-admin.module.css";

export const dynamic = "force-dynamic";

/** "Valentina & Marco" or "Valentina and Marco" → two partners. */
function splitNames(name: string | null) {
  const parts = (name ?? "").split(/\s+(?:&|and|\+)\s+/i).map((part) => part.trim()).filter(Boolean);
  return { partnerOneName: parts[0] ?? "", partnerTwoName: parts.slice(1).join(" & ") };
}

function prefillFrom(lead: LeadForConversion): ClientPrefill {
  const background = [
    lead.celebration_type && `Celebration: ${lead.celebration_type}`,
    lead.services.length > 0 && `Asked about: ${lead.services.join(", ")}`,
    lead.investment && `Budget range: ${lead.investment}`,
    lead.vision && `Their vision: ${lead.vision}`,
  ].filter(Boolean).join("\n");
  return {
    ...splitNames(lead.name),
    email: lead.email ?? "",
    phone: lead.phone ?? "",
    eventDate: lead.date_undecided ? "" : lead.event_date ?? "",
    venue: lead.venue ?? "",
    guestCount: lead.guest_count ?? "",
    notes: background ? `From their inquiry:\n${background}` : "",
  };
}

const digits = (value: string | null) => (value ?? "").replace(/\D/g, "").slice(-10);

export default async function NewClientPage({ searchParams }: { searchParams: Promise<{ lead?: string }> }) {
  const user = await getAdminUser();
  const leadId = (await searchParams).lead ?? "";
  const here = `/admin/portal/clients/new${leadId ? `?lead=${encodeURIComponent(leadId)}` : ""}`;
  if (!user) {
    if (await hasAdminRefreshToken()) redirect(`/api/admin/auth/refresh?next=${encodeURIComponent(here)}`);
    redirect("/admin/login");
  }
  if (!canManageClientPortal(user)) redirect("/admin/portal/inquiries");

  const lead = leadId ? await getLeadForConversion(leadId) : null;
  if (lead) {
    // Converted already: go to that client rather than making a second one.
    const existing = await getClientByLeadId(lead.id);
    if (existing) redirect(`/admin/portal/clients/${existing.id}`);
  }

  // A client with the same email or phone may be the same couple.
  const possibleDuplicates = lead
    ? (await getClients()).filter((client) =>
      (lead.email && client.email && client.email.toLowerCase() === lead.email.toLowerCase())
      || (digits(lead.phone).length === 10 && digits(client.phone) === digits(lead.phone)))
    : [];

  return (
    <main className={styles.formShell}>
      <div className={styles.formHeader}>
        <Link className={styles.backLink} href={lead ? `/admin/portal/inquiries?lead=${lead.id}` : "/admin/portal/clients"}>
          <span aria-hidden="true">←</span> {lead ? "Back to the inquiry" : "All clients"}
        </Link>
        <p className={styles.eyebrow}>{lead ? "Convert an inquiry" : "New celebration"}</p>
        <h1>{lead ? "Make them a client." : "Create a client."}</h1>
        <p className={styles.formIntro}>
          {lead
            ? "Their details are filled in from the inquiry. Check them, choose what they booked, and save. The inquiry stays linked to this client."
            : "Their portal, invoices, documents, and gallery all connect back to this record."}
        </p>
        {leadId && !lead && <p className={styles.formError} role="alert">That inquiry could not be found, so this is a blank form.</p>}
        {possibleDuplicates.length > 0 && (
          <p className={styles.formError} role="alert">
            Possible duplicate: {possibleDuplicates.map((client, index) => (
              <span key={client.id}>{index > 0 && ", "}<Link href={`/admin/portal/clients/${client.id}`}>{client.display_name}</Link></span>
            ))} already has this email or phone. Check before saving.
          </p>
        )}
      </div>
      <NewClientForm leadId={lead?.id} prefill={lead ? prefillFrom(lead) : undefined} />
    </main>
  );
}
