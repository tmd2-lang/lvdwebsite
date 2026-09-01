import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAdminUser, hasAdminRefreshToken } from "@/lib/admin-auth";
import { getClientById, getClientMembers } from "@/lib/client-data";
import {
  CLIENT_STATUS_LABELS,
  DESIGN_TIER_LABELS,
  PLANNING_PACKAGE_LABELS,
} from "@/lib/client-types";
import InviteForm from "./InviteForm";
import styles from "../../portal-admin.module.css";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "Date still open";
  return new Intl.DateTimeFormat("en-US", {
    month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  const { id } = await params;
  if (!user) {
    if (await hasAdminRefreshToken()) redirect(`/api/admin/auth/refresh?next=/admin/portal/clients/${id}`);
    redirect("/admin/login");
  }

  const client = await getClientById(id);
  if (!client) notFound();

  const members = await getClientMembers(client.id);

  return (
    <main className={styles.formShell}>
      <div className={styles.formHeader}>
        <Link className={styles.backLink} href="/admin/portal/clients"><span aria-hidden="true">←</span> All clients</Link>
        <p className={styles.eyebrow}>{CLIENT_STATUS_LABELS[client.status]}</p>
        <h1>{client.display_name}</h1>
        <p className={styles.formIntro}>
          {formatDate(client.event_date)}{client.venue ? ` · ${client.venue}` : ""}{client.location ? ` · ${client.location}` : ""}
        </p>
      </div>

      <section className={styles.detailPanel}>
        <h2>What they booked</h2>
        <dl className={styles.detailList}>
          <div><dt>Planning package</dt><dd>{PLANNING_PACKAGE_LABELS[client.planning_package]}</dd></div>
          <div><dt>Design tier</dt><dd>{client.design_tier ? DESIGN_TIER_LABELS[client.design_tier] : "None"}</dd></div>
          <div><dt>Guest count</dt><dd>{client.guest_count || "Not set"}</dd></div>
          <div><dt>Email</dt><dd>{client.email || "Not set"}</dd></div>
          <div><dt>Phone</dt><dd>{client.phone || "Not set"}</dd></div>
        </dl>
        {client.notes && <p className={styles.detailNotes}>{client.notes}</p>}
      </section>

      <section className={styles.detailPanel}>
        <h2>Portal access</h2>
        {members.length === 0 ? (
          <p className={styles.detailEmpty}>Nobody can sign in to this celebration yet.</p>
        ) : (
          <ul className={styles.memberList}>
            {members.map((member) => (
              <li key={member.id}>
                <strong>{member.invited_email || "Linked account"}</strong>
                <span>{member.relationship}</span>
              </li>
            ))}
          </ul>
        )}
        <InviteForm clientId={client.id} />
      </section>
    </main>
  );
}
