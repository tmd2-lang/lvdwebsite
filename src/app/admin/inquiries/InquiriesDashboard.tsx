"use client";

import { FormEvent, useMemo, useState } from "react";
import type { AdminLead, AdminUser, LeadNote, LeadStatus } from "@/lib/admin-types";
import styles from "./inquiries.module.css";

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  contacted: "Reached Out",
  qualified: "Good Fit",
  booked: "Booked",
  archived: "Archived",
  spam: "Not a Fit",
};

const FILTERS: Array<{ label: string; value: "all" | LeadStatus }> = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Reviewing", value: "reviewing" },
  { label: "Reached Out", value: "contacted" },
  { label: "Good Fit", value: "qualified" },
  { label: "Booked", value: "booked" },
  { label: "Archived", value: "archived" },
];

const SOURCE_LABELS: Record<string, string> = {
  inquire: "Inquiry form",
  consultation: "Consultation",
  reserve: "Reserve your date",
  style_quiz: "Style quiz",
  admin: "Added by studio",
  imported: "Imported",
};

function readableDate(value: string | null, undecided = false) {
  if (undecided) return "Date still open";
  if (!value) return "Date not shared";
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value));
}

function submittedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function initials(name: string | null) {
  const parts = (name || "New inquiry").trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase()).join("");
}

async function responseJson<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    window.location.assign(`/api/admin/auth/refresh?next=${encodeURIComponent(window.location.pathname)}`);
    throw new Error("Refreshing your sign-in…");
  }
  const payload = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || "That change could not be saved.");
  return payload;
}

export default function InquiriesDashboard({ initialLeads, user }: { initialLeads: AdminLead[]; user: AdminUser }) {
  const [leads, setLeads] = useState(initialLeads);
  const [selectedId, setSelectedId] = useState(initialLeads[0]?.id || "");
  const [filter, setFilter] = useState<"all" | LeadStatus>("all");
  const [search, setSearch] = useState("");
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selected = leads.find((lead) => lead.id === selectedId) || leads[0] || null;
  const counts = useMemo(() => ({
    new: leads.filter((lead) => lead.status === "new").length,
    contacted: leads.filter((lead) => lead.status === "contacted").length,
    booked: leads.filter((lead) => lead.status === "booked").length,
  }), [leads]);

  const visibleLeads = useMemo(() => {
    const query = search.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesFilter = filter === "all" || lead.status === filter;
      const haystack = [lead.name, lead.email, lead.venue, lead.celebration_type, lead.event_date].filter(Boolean).join(" ").toLowerCase();
      return matchesFilter && (!query || haystack.includes(query));
    });
  }, [filter, leads, search]);

  function chooseLead(id: string) {
    setSelectedId(id);
    setMobileDetailOpen(true);
    setError("");
    setMessage("");
  }

  function announce(text: string) {
    setError("");
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2600);
  }

  async function changeStatus(status: LeadStatus) {
    if (!selected || status === selected.status) return;
    setSavingStatus(true);
    setError("");
    try {
      await responseJson(await fetch(`/api/admin/inquiries/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }));
      setLeads((current) => current.map((lead) => lead.id === selected.id ? { ...lead, status } : lead));
      announce(`Moved to ${STATUS_LABELS[status]}.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That change could not be saved.");
    } finally {
      setSavingStatus(false);
    }
  }

  async function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const body = String(data.get("note") || "").trim();
    if (!body) return;
    setSavingNote(true);
    setError("");
    try {
      const result = await responseJson<{ note: LeadNote }>(await fetch(`/api/admin/inquiries/${selected.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      }));
      setLeads((current) => current.map((lead) => lead.id === selected.id ? { ...lead, notes: [result.note, ...lead.notes] } : lead));
      form.reset();
      announce("Note saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That note could not be saved.");
    } finally {
      setSavingNote(false);
    }
  }

  async function signOut() {
    await fetch("/api/admin/auth/logout", { method: "POST" }).catch(() => null);
    window.location.assign("/admin/login");
  }

  return (
    <main className={styles.app} data-lenis-prevent>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.monogram}>LVD</p>
          <p className={styles.studioName}>Lady Victoria<br />Designs</p>
        </div>
        <nav aria-label="Studio navigation">
          <a className={styles.navActive} href="/admin/inquiries"><span>Inquiries</span><b>{leads.length}</b></a>
        </nav>
        <div className={styles.account}>
          <p>{user.name}</p>
          <button type="button" onClick={signOut}>Sign out</button>
        </div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.mobileHeader}>
          <div><b>LVD</b><span>Studio</span></div>
          <button type="button" onClick={signOut}>Sign out</button>
        </header>

        <div className={styles.topbar}>
          <div>
            <p className={styles.eyebrow}>Your studio</p>
            <h1>Inquiries</h1>
            <p>Everything you need to know, from first hello to booked.</p>
          </div>
          <div className={styles.today}><span>Today</span><b>{new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date())}</b></div>
        </div>

        <div className={styles.summary}>
          <article><span className={styles.newDot} /><div><b>{counts.new}</b><p>New inquiries</p></div></article>
          <article><span className={styles.reachedDot} /><div><b>{counts.contacted}</b><p>Reached out</p></div></article>
          <article><span className={styles.bookedDot} /><div><b>{counts.booked}</b><p>Booked celebrations</p></div></article>
        </div>

        <div className={styles.contentGrid}>
          <section className={styles.listPanel} aria-label="Inquiry list">
            <div className={styles.listToolbar}>
              <label className={styles.search}>
                <span aria-hidden="true">⌕</span>
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search a name, venue, or date" aria-label="Search inquiries" />
              </label>
              <div className={styles.filters}>
                {FILTERS.map((item) => (
                  <button key={item.value} type="button" className={filter === item.value ? styles.filterActive : ""} onClick={() => setFilter(item.value)}>
                    {item.label}
                    {item.value === "new" && counts.new > 0 && <span>{counts.new}</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.leadList}>
              {visibleLeads.length === 0 ? (
                <div className={styles.empty}>
                  <p className={styles.emptyScript}>All clear</p>
                  <h2>No inquiries here.</h2>
                  <p>Try another view or clear your search.</p>
                </div>
              ) : visibleLeads.map((lead) => (
                <button type="button" key={lead.id} className={`${styles.leadCard} ${selected?.id === lead.id ? styles.leadCardActive : ""}`} onClick={() => chooseLead(lead.id)}>
                  <span className={styles.avatar}>{initials(lead.name)}</span>
                  <span className={styles.cardMain}>
                    <span className={styles.cardTitle}><b>{lead.name || "New inquiry"}</b><time>{shortDate(lead.created_at)}</time></span>
                    <span className={styles.cardEvent}>{lead.celebration_type || "Celebration"} · {readableDate(lead.event_date, lead.date_undecided)}</span>
                    <span className={styles.cardMeta}>{lead.venue || "Venue not shared"}<i>•</i>{lead.investment || "Investment not shared"}</span>
                  </span>
                  <span className={`${styles.statusPill} ${styles[`status_${lead.status}`]}`}>{STATUS_LABELS[lead.status]}</span>
                </button>
              ))}
            </div>
          </section>

          <aside className={styles.detailPanel} data-open={mobileDetailOpen ? "true" : "false"} aria-label="Inquiry details">
            {selected ? (
              <>
                <div className={styles.detailHeader}>
                  <button className={styles.mobileClose} type="button" onClick={() => setMobileDetailOpen(false)} aria-label="Close inquiry">×</button>
                  <div className={styles.detailIdentity}>
                    <span className={styles.avatarLarge}>{initials(selected.name)}</span>
                    <div><p>{SOURCE_LABELS[selected.source] || "Website inquiry"}</p><h2>{selected.name || "New inquiry"}</h2><span>Received {submittedAt(selected.created_at)}</span></div>
                  </div>
                  <label className={styles.statusSelect}>
                    <span>Status</span>
                    <select value={selected.status} onChange={(event) => void changeStatus(event.target.value as LeadStatus)} disabled={savingStatus}>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </label>
                </div>

                {(message || error) && <p className={error ? styles.toastError : styles.toast} role="status">{error || message}</p>}

                <div className={styles.detailScroll}>
                  <section className={styles.contactActions}>
                    {selected.email && <a href={`mailto:${selected.email}`}>Email {selected.name?.split(" ")[0] || "client"}</a>}
                    {selected.phone && <a href={`tel:${selected.phone.replace(/[^+\d]/g, "")}`}>Call</a>}
                  </section>

                  <section className={styles.detailSection}>
                    <h3>Celebration details</h3>
                    <dl className={styles.detailsGrid}>
                      <div><dt>Celebration</dt><dd>{selected.celebration_type || "Not shared"}</dd></div>
                      <div><dt>Date</dt><dd>{readableDate(selected.event_date, selected.date_undecided)}</dd></div>
                      <div><dt>Venue</dt><dd>{selected.venue || "Not shared"}</dd></div>
                      <div><dt>Guest count</dt><dd>{selected.guest_count || "Not shared"}</dd></div>
                      <div><dt>Investment</dt><dd>{selected.investment || "Not shared"}</dd></div>
                      <div><dt>How they found you</dt><dd>{selected.referral_source || "Not shared"}</dd></div>
                    </dl>
                  </section>

                  {selected.services.length > 0 && (
                    <section className={styles.detailSection}>
                      <h3>Interested in</h3>
                      <div className={styles.tags}>{selected.services.map((service) => <span key={service}>{service}</span>)}</div>
                    </section>
                  )}

                  {selected.vision && (
                    <section className={styles.detailSection}>
                      <h3>Their vision</h3>
                      <blockquote>“{selected.vision}”</blockquote>
                    </section>
                  )}

                  <section className={styles.detailSection}>
                    <div className={styles.notesHeading}><h3>Private notes</h3><span>Only the studio can see these</span></div>
                    <form className={styles.noteForm} onSubmit={saveNote}>
                      <textarea name="note" placeholder="Add a reminder, thought, or follow-up…" rows={3} maxLength={4000} />
                      <button type="submit" disabled={savingNote}>{savingNote ? "Saving…" : "Save note"}</button>
                    </form>
                    <div className={styles.notesList}>
                      {selected.notes.length === 0 ? <p className={styles.noNotes}>No notes yet. Add anything you want to remember here.</p> : selected.notes.map((note) => (
                        <article key={note.id}>
                          <p>{note.body}</p>
                          <span>{note.author_name || "Studio"} · {submittedAt(note.created_at)}</span>
                        </article>
                      ))}
                    </div>
                  </section>
                </div>
              </>
            ) : (
              <div className={styles.emptyDetail}><p>New inquiries will appear here.</p></div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
