"use client";

import { FormEvent, MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { LEAD_STATUSES } from "@/lib/admin-types";
import { consultationLabel } from "@/lib/consultation-display";
import { adSourceLabel } from "@/lib/ad-source";
import { filterInquiries, lastActivityAt, latestView, viewState, isUnread, inquiryCounts, type InquiryFilters } from "@/lib/inquiry-views";
import type { AdminLead, AdminUser, LeadNote, LeadStatus, LeadActivity, LeadAppointment } from "@/lib/admin-types";
import styles from "./inquiries.module.css";
import SalesControls, { type SalesUpdate } from "./SalesControls";
import { ATTENTION_REASONS, attentionReasons, needsAttention } from "@/lib/attention";

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  contacted: "Contacted",
  qualified: "Good Fit",
  booked: "Booked",
  archived: "Archived",
  spam: "Not a Fit",
};

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

function submittedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }).format(new Date(value));
}

function displayPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  const localNumber = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

  if (localNumber.length !== 10) return value;
  return `(${localNumber.slice(0, 3)}) ${localNumber.slice(3, 6)}-${localNumber.slice(6)}`;
}

function initials(name: string | null) {
  const parts = (name || "New inquiry").trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase()).join("");
}

function gmailComposeUrl(email: string, name: string | null) {
  const firstName = name?.trim().split(/\s+/)[0] || "there";
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: email,
    su: `Your Lady Victoria Designs inquiry, ${firstName}`,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

function openGmailPopup(event: MouseEvent<HTMLAnchorElement>, url: string) {
  if (window.matchMedia("(max-width: 760px)").matches) return;

  const width = Math.min(760, window.screen.availWidth - 48);
  const height = Math.min(720, window.screen.availHeight - 64);
  const left = Math.max(24, Math.round(window.screenX + (window.outerWidth - width) / 2));
  const top = Math.max(24, Math.round(window.screenY + (window.outerHeight - height) / 2));
  const popup = window.open(
    url,
    "lvd-gmail-compose",
    `popup=yes,width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`,
  );

  if (popup) {
    event.preventDefault();
    popup.opener = null;
    popup.focus();
  }
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

export default function InquiriesDashboard({
  initialLeads,
  user,
  initialSelectedId,
  portalMode = false,
}: {
  initialLeads: AdminLead[];
  user: AdminUser;
  initialSelectedId?: string;
  portalMode?: boolean;
}) {
  const [leads, setLeads] = useState(initialLeads);
  const [selectedId, setSelectedId] = useState(initialSelectedId || "");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InquiryFilters["status"]>("all");
  const [viewFilter, setViewFilter] = useState<InquiryFilters["viewed"]>("all");
  const [notesFilter, setNotesFilter] = useState<InquiryFilters["notes"]>("all");
  const [sort, setSort] = useState<InquiryFilters["sort"]>("newest");
  const [openVersion, setOpenVersion] = useState(0);
  const recordedViews = useRef(new Set<string>());
  const detailPanelRef = useRef<HTMLElement>(null);
  const detailScrollRef = useRef<HTMLDivElement>(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(Boolean(initialSelectedId));
  const [savingStatus, setSavingStatus] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [deletingSelected, setDeletingSelected] = useState(false);
  const [savingRead, setSavingRead] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [attentionOnly, setAttentionOnly] = useState(false);
  const attentionLeads = useMemo(() => needsAttention(leads), [leads]);
  const visibleLeads = useMemo(() => {
    const filtered = filterInquiries(leads, { search, status: statusFilter, viewed: viewFilter, notes: notesFilter, sort, actorId: user.id });
    if (!attentionOnly) return filtered;
    const keep = new Set(filtered.map((lead) => lead.id));
    return attentionLeads.filter((lead) => keep.has(lead.id));
  }, [leads, search, statusFilter, viewFilter, notesFilter, sort, user.id, attentionOnly, attentionLeads]);
  const counts = inquiryCounts(leads, user.id);
  const selected = leads.find((lead) => lead.id === selectedId) || null;
  const selectedGmailUrl = selected?.email ? gmailComposeUrl(selected.email, selected.name) : "";
  const trackingAvailable = Boolean(initialLeads[0]?.tracking_started_at);
  const hasFilters = Boolean(attentionOnly || search || statusFilter !== "all" || viewFilter !== "all" || notesFilter !== "all");

  useEffect(() => {
    // A default preview is not a view. Track only an explicitly opened lead or deep link.
    if (!selectedId || !trackingAvailable || recordedViews.current.has(selectedId)) return;
    if (window.matchMedia("(max-width: 760px)").matches && !mobileDetailOpen) return;
    const id = selectedId;
    recordedViews.current.add(id);
    const pendingId = `pending-view-${id}`;
    void fetch(`/api/admin/inquiries/${id}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "view" }),
    }).then((response) => responseJson<{ activity: LeadActivity }>(response)).then((result) => {
      setLeads((current) => current.map((lead) => lead.id === id
        ? { ...lead, activity: [result.activity, ...(lead.activity || []).filter((item) => item.id !== pendingId)] } : lead));
    }).catch((caught) => {
      setLeads((current) => current.map((lead) => lead.id === id ? { ...lead, activity: (lead.activity || []).filter((item) => item.id !== pendingId) } : lead));
      setError(caught instanceof Error ? caught.message : "Could not record this view.");
    });
  }, [selectedId, trackingAvailable, mobileDetailOpen, user.id, user.name, openVersion]);

  useEffect(() => {
    const panel = detailPanelRef.current;
    if (!panel || !selectedId || !mobileDetailOpen) return;
    if (detailScrollRef.current) detailScrollRef.current.scrollTop = 0;
    const media = window.matchMedia("(max-width: 760px)");
    let releaseModal: (() => void) | undefined;

    function updateModal() {
      releaseModal?.();
      releaseModal = undefined;
      if (!media.matches || !panel) return;
      const previousFocus = document.activeElement;
      const previousOverflow = document.body.style.overflow;
      const background: Array<{ element: HTMLElement; inert: boolean }> = [];
      // Include the enclosing portal navigation, not just this workspace's list.
      let branch: HTMLElement = panel;
      while (branch.parentElement) {
        for (const sibling of Array.from(branch.parentElement.children)) {
          if (sibling !== branch && sibling instanceof HTMLElement) {
            background.push({ element: sibling, inert: sibling.inert });
            sibling.inert = true;
          }
        }
        if (branch.parentElement === document.body) break;
        branch = branch.parentElement;
      }
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-modal", "true");
      document.body.style.overflow = "hidden";
      const focusable = () => Array.from(panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), select:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex="0"]',
      )).filter((element) => element.getClientRects().length > 0);
      const focusFirst = () => focusable()[0]?.focus({ preventScroll: true });
      function onKeyDown(event: KeyboardEvent) {
        if (event.key === "Escape") {
          event.preventDefault();
          setMobileDetailOpen(false);
          return;
        }
        if (event.key !== "Tab") return;
        const elements = focusable();
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last?.focus({ preventScroll: true });
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first?.focus({ preventScroll: true });
        }
      }
      function onFocusIn(event: FocusEvent) {
        if (event.target instanceof Node && !panel?.contains(event.target)) focusFirst();
      }
      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("focusin", onFocusIn);
      focusFirst();
      releaseModal = () => {
        document.removeEventListener("keydown", onKeyDown);
        document.removeEventListener("focusin", onFocusIn);
        background.forEach(({ element, inert }) => { element.inert = inert; });
        document.body.style.overflow = previousOverflow;
        panel.removeAttribute("role");
        panel.removeAttribute("aria-modal");
        if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
      };
    }
    updateModal();
    media.addEventListener("change", updateModal);
    return () => { media.removeEventListener("change", updateModal); releaseModal?.(); };
  }, [selectedId, mobileDetailOpen]);

  function clearFilters() {
    setSearch(""); setStatusFilter("all"); setViewFilter("all"); setNotesFilter("all"); setAttentionOnly(false);
  }
  const allVisibleSelected = visibleLeads.length > 0 && visibleLeads.every((lead) => selectedLeadIds.includes(lead.id));

  function chooseLead(id: string) {
    if (savingRead || leads.find((lead) => lead.id === id)?.activity?.some((item) => item.id.startsWith("pending-view-"))) return;
    recordedViews.current.delete(id);
    if (trackingAvailable) {
      const pending: LeadActivity = { id: `pending-view-${id}`, lead_id: id, actor_id: user.id, actor_name: user.name, kind: "viewed", detail: null, created_at: new Date().toISOString() };
      setLeads((current) => current.map((lead) => lead.id === id ? { ...lead, activity: [pending, ...(lead.activity || []).filter((item) => item.id !== pending.id)] } : lead));
    }
    setOpenVersion((value) => value + 1);
    setSelectedId(id);
    setMobileDetailOpen(true);
    setError("");
    setMessage("");
  }

  function filterCard(kind: "attention" | "total" | "unread" | "contacted" | "booked") {
    clearFilters(); setSelectedId(""); setMobileDetailOpen(false); setSelectedLeadIds([]);
    if (kind === "attention") setAttentionOnly(true);
    if (kind === "unread") setViewFilter("unread");
    if (kind === "contacted" || kind === "booked") setStatusFilter(kind);
  }

  async function markUnread() {
    if (!selected || savingRead) return;
    const id = selected.id;
    setSavingRead(true); setError("");
    try {
      const result = await responseJson<{ activity: LeadActivity }>(await fetch(`/api/admin/inquiries/${id}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "mark_unread" }),
      }));
      recordedViews.current.add(id);
      setLeads((current) => current.map((lead) => lead.id === id ? { ...lead, activity: [result.activity, ...(lead.activity || [])] } : lead));
      announce("Marked unread for you.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not mark unread."); }
    finally { setSavingRead(false); }
  }

  function announce(text: string) {
    setError("");
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2600);
  }

  function toggleLeadSelection(id: string) {
    setSelectedLeadIds((current) => current.includes(id)
      ? current.filter((selectedLeadId) => selectedLeadId !== id)
      : [...current, id]);
  }

  function toggleVisibleSelection() {
    if (allVisibleSelected) {
      const visibleIds = new Set(visibleLeads.map((lead) => lead.id));
      setSelectedLeadIds((current) => current.filter((id) => !visibleIds.has(id)));
      return;
    }

    setSelectedLeadIds((current) => [...new Set([...current, ...visibleLeads.map((lead) => lead.id)])]);
  }

  async function deleteSelected() {
    const ids = selectedLeadIds.filter((id) => leads.some((lead) => lead.id === id));
    if (ids.length === 0) return;
    const label = ids.length === 1 ? "inquiry" : "inquiries";
    if (!confirm(`Permanently delete ${ids.length} ${label}? This cannot be undone.`)) return;

    setDeletingSelected(true);
    setError("");
    try {
      await responseJson(await fetch("/api/admin/inquiries/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      }));
      const remainingLeads = leads.filter((lead) => !ids.includes(lead.id));
      setLeads(remainingLeads);
      setSelectedLeadIds([]);
      if (selectedId && ids.includes(selectedId)) {
        setSelectedId("");
        setMobileDetailOpen(false);
      }
      announce(`${ids.length} ${label} deleted.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Those inquiries could not be deleted.");
    } finally {
      setDeletingSelected(false);
    }
  }

  async function changeStatus(status: LeadStatus) {
    if (!selected || status === selected.status) return;
    setSavingStatus(true);
    setError("");
    try {
      const result = await responseJson<{ lead: { status: LeadStatus; updated_at: string }; activity: LeadActivity | null }>(await fetch(`/api/admin/inquiries/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }));
      setLeads((current) => current.map((lead) => lead.id === selected.id ? { ...lead, ...result.lead, activity: result.activity ? [result.activity, ...(lead.activity || [])] : lead.activity } : lead));
      announce(`Moved to ${STATUS_LABELS[status]}.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That change could not be saved.");
    } finally {
      setSavingStatus(false);
    }
  }

  async function updateSales(update: SalesUpdate) {
    if (!selected) return false;
    const leadId = selected.id;
    setError("");
    try {
      const result = await responseJson<{ lead: Partial<AdminLead>; activity: LeadActivity }>(await fetch(`/api/admin/inquiries/${leadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sales", sales: update }),
      }));
      setLeads((current) => current.map((lead) => lead.id === leadId ? { ...lead, ...result.lead, activity: [result.activity, ...(lead.activity || [])] } : lead));
      announce(result.activity.detail ? `Saved: ${result.activity.detail}.` : "Saved.");
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That change could not be saved.");
      return false;
    }
  }

  async function deleteInquiry() {
    if (!selected) return;
    if (!confirm("Are you sure you want to permanently delete this inquiry? This cannot be undone.")) return;
    
    setSavingStatus(true);
    setError("");
    try {
      await responseJson(await fetch(`/api/admin/inquiries/${selected.id}`, {
        method: "DELETE",
      }));
      setLeads((current) => current.filter((lead) => lead.id !== selected.id));
      setSelectedId("");
      setMobileDetailOpen(false);
      announce("Inquiry deleted.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That inquiry could not be deleted.");
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
      const result = await responseJson<{ note: LeadNote; activity: LeadActivity | null }>(await fetch(`/api/admin/inquiries/${selected.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      }));
      setLeads((current) => current.map((lead) => lead.id === selected.id ? { ...lead, notes: [result.note, ...lead.notes], activity: result.activity ? [result.activity, ...(lead.activity || [])] : lead.activity } : lead));
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

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      if (document.visibilityState === "hidden") return;
      try {
        const response = await fetch("/api/admin/inquiries/appointments", { cache: "no-store" });
        if (!response.ok) return;
        const result = await response.json() as { available: boolean; appointments: LeadAppointment[] };
        if (active) setLeads((current) => current.map((lead) => ({ ...lead, consultation_sync_available: result.available,
          appointments: result.appointments.filter((item) => item.lead_id === lead.id) })));
      } catch { /* The next interval retries without interrupting planner edits. */ }
    };
    const timer = window.setInterval(() => { void refresh(); }, 60000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  return (
    <main className={`${styles.app} ${portalMode ? styles.portalMode : ""}`}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.monogram}>LVD</p>
          <p className={styles.studioName}>Lady Victoria<br />Designs</p>
        </div>
        <nav aria-label="Studio navigation">
          <a href="/admin">Home</a>
          <a href="/admin/portal">Client portal</a>
          <a className={styles.navActive} href="/admin/inquiries"><span>Inquiries</span><b>{trackingAvailable ? counts.unread : counts.total}</b></a>
          <a href="/admin/profile">Profile</a>
        </nav>
        <div className={styles.account}>
          <p>{user.name}</p>
          <button type="button" onClick={signOut}>Sign out</button>
        </div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.mobileHeader}>
          <a href="/admin"><b>LVD</b><span>Studio</span></a>
          <nav aria-label="Mobile studio navigation"><a href="/admin">Home</a><a href="/admin/portal">Portal</a><a href="/admin/inquiries" aria-current="page">Inquiries</a><a href="/admin/profile">Profile</a></nav>
        </header>

        <div className={styles.topbar}>
          <div>
            <p className={styles.eyebrow}>Your studio</p>
            <h1>Inquiries</h1>
            <p>Everything you need to know, from first hello to booked.</p>
          </div>
          <div className={styles.today}><span>Today</span><b>{new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date())}</b></div>
        </div>

        <section className={styles.summaryCards} aria-label="Inquiry overview">
          {([
            { key: "attention", label: "Needs attention", hint: "Consults today, missing outcomes, proposals and new leads to call" },
            { key: "total", label: "Total inquiries", hint: "Across your studio" },
            { key: "unread", label: "Unread", hint: "Waiting for you to open" },
            { key: "contacted", label: "Contacted", hint: "Leads you've reached out to" },
            { key: "booked", label: "Booked", hint: "Confirmed bookings" },
          ] as const).map((card) => <button type="button" key={card.key} disabled={card.key === "unread" && !trackingAvailable}
            aria-pressed={card.key === "attention" ? attentionOnly : card.key === "total" ? !hasFilters : card.key === "unread" ? viewFilter === "unread" : statusFilter === card.key}
            onClick={() => filterCard(card.key)}>
            <span>{card.label}</span><b>{card.key === "attention" ? attentionLeads.length : card.key === "unread" && !trackingAvailable ? "—" : counts[card.key]}</b><small>{card.hint}</small>
          </button>)}
        </section>
        {!trackingAvailable && <p className={styles.trackingNotice}>View tracking is awaiting setup. Historical views are unavailable; notes and status filters still work.</p>}
        {!selected && (message || error) && <p className={error ? styles.toastError : styles.toast} role={error ? "alert" : "status"}>{error || message}</p>}
        <div className={styles.contentGrid}>
          <section className={styles.listPanel} aria-label="Inquiry list">
            <div className={styles.listToolbar}>
              <label className={styles.search}>
                <span aria-hidden="true">⌕</span>
                <input value={search} onChange={(event) => { setSearch(event.target.value); setSelectedId(""); setMobileDetailOpen(false); setSelectedLeadIds([]); }} placeholder="Search name, email, venue, date, or notes" aria-label="Search inquiries" />
              </label>
              <div className={styles.filters}>
                <label>Status<select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value as InquiryFilters["status"]); setSelectedId(""); setMobileDetailOpen(false); setSelectedLeadIds([]); }}>
                  <option value="all">All statuses</option><option value="not_contacted">Not contacted (New / Reviewing)</option>
                  {LEAD_STATUSES.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
                </select></label>
                <label>Read / unread<select value={viewFilter} disabled={!trackingAvailable} onChange={(event) => { setViewFilter(event.target.value as InquiryFilters["viewed"]); setSelectedId(""); setMobileDetailOpen(false); setSelectedLeadIds([]); }}>
                  <option value="all">All inquiries</option><option value="unread">Unread for me</option><option value="read">Read by me</option><option value="viewed">Seen by anyone in studio</option>
                </select></label>
                <label>Notes<select value={notesFilter} onChange={(event) => { setNotesFilter(event.target.value as InquiryFilters["notes"]); setSelectedId(""); setMobileDetailOpen(false); setSelectedLeadIds([]); }}>
                  <option value="all">With or without notes</option><option value="with">Has notes</option><option value="without">No notes</option>
                </select></label>
                <label>Sort by<select value={sort} onChange={(event) => setSort(event.target.value as InquiryFilters["sort"])}>
                  <option value="newest">Newest received</option><option value="oldest">Oldest received</option><option value="event">Event date (soonest)</option><option value="activity">Latest activity</option>
                </select></label>
              </div>
              <div className={styles.resultsBar}><span role="status">{visibleLeads.length} of {leads.length} inquiries</span>{hasFilters && <button type="button" onClick={clearFilters}>Clear filters</button>}</div>
              <div className={styles.selectionBar}>
                <label className={styles.selectAll}>
                  <input type="checkbox" checked={allVisibleSelected} onChange={toggleVisibleSelection} aria-label="Select all visible inquiries" />
                  <span>Select visible</span>
                </label>
                {selectedLeadIds.length > 0 && <span className={styles.selectionCount}>{selectedLeadIds.length} selected</span>}
                {selectedLeadIds.length > 0 && <button type="button" className={styles.bulkDeleteButton} onClick={() => void deleteSelected()} disabled={deletingSelected}>{deletingSelected ? "Deleting…" : "Delete selected"}</button>}
              </div>
            </div>

            <div className={styles.leadList}>
              {visibleLeads.length === 0 ? (
                <div className={styles.empty}>
                  <h2>{hasFilters ? "No matching inquiries" : "No inquiries yet"}</h2>
                  <p>{hasFilters ? "Try different filters or clear your search." : "New submissions will appear here."}</p>
                  {hasFilters && <button type="button" onClick={clearFilters}>Clear filters</button>}
                </div>
              ) : visibleLeads.map((lead) => (
                <div className={styles.leadCardRow} key={lead.id}>
                  <label className={styles.selectLead}>
                    <input type="checkbox" checked={selectedLeadIds.includes(lead.id)} onChange={() => toggleLeadSelection(lead.id)} aria-label={`Select ${lead.name || "new inquiry"}`} />
                  </label>
                  <button type="button" className={`${styles.leadCard} ${trackingAvailable && isUnread(lead, user.id) ? styles.leadUnread : ""} ${selected?.id === lead.id ? styles.leadCardActive : ""}`} onClick={() => chooseLead(lead.id)} aria-pressed={selected?.id === lead.id}>

                    <span className={styles.cardMain}>
                      <span className={styles.cardTitle}>{trackingAvailable && isUnread(lead, user.id) && <span className={styles.unreadDot} aria-label="Unread for you" />}<b>{lead.name || "New inquiry"}</b></span>
                      <span className={styles.cardEvent}>{readableDate(lead.event_date, lead.date_undecided)}</span>
                      <span className={styles.cardBadges}><span>{STATUS_LABELS[lead.status]}</span><span>{lead.notes.length} {lead.notes.length === 1 ? "note" : "notes"}</span>
                        <span>{trackingAvailable ? isUnread(lead, user.id) ? "Unread for you" : "Read by you" : "Read tracking unavailable"}</span>
                      </span>
                      <span className={styles.cardConsultation}>{consultationLabel(lead)}</span>
                      {attentionReasons(lead).length > 0 && <span className={styles.attentionTags}>{attentionReasons(lead).map((reason) => <span key={reason}>{ATTENTION_REASONS[reason]}</span>)}</span>}
                      {adSourceLabel(lead) && <span className={styles.cardSource}>{adSourceLabel(lead)}</span>}
                      <span className={styles.cardMeta}>Received {submittedAt(lead.created_at)}</span>
                      <span className={styles.cardMeta}>{latestView(lead) ? `Seen by ${latestView(lead)!.actor_name}` : ""}</span>
                      <span className={styles.cardMeta}>Activity {submittedAt(lastActivityAt(lead))}</span>
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </section>

          <aside ref={detailPanelRef} className={styles.detailPanel} data-open={mobileDetailOpen && selected ? "true" : "false"} aria-label="Inquiry details">
            {selected ? (
              <>
                <div className={styles.detailHeader}>
                  <button className={styles.mobileClose} type="button" onClick={() => setMobileDetailOpen(false)} aria-label="Close inquiry">×</button>
                  <div className={styles.detailIdentity}>
                    <span className={styles.avatarLarge}>{initials(selected.name)}</span>
                    <div><p>{SOURCE_LABELS[selected.source] || "Website inquiry"}</p><h2>{selected.name || "New inquiry"}</h2>{adSourceLabel(selected) && <span className={styles.detailSource}>{adSourceLabel(selected)}</span>}<span>Received {submittedAt(selected.created_at)}</span></div>
                  </div>
                </div>

                <div key={selected.id} ref={detailScrollRef} className={styles.detailScroll}>
                  {(message || error) && <p className={error ? styles.toastError : styles.toast} role={error ? "alert" : "status"}>{error || message}</p>}
                  {!visibleLeads.some((lead) => lead.id === selected.id) && <p className={styles.trackingNotice}>This open inquiry no longer matches your filters. Its details stay open until you choose another inquiry or change filters.</p>}
                  <section className={styles.consultationBlock} aria-label="Design consultation">
                    <h3>Design consultation</h3>
                    <p>{consultationLabel(selected)}</p>
                    <small>Synced from Calendly. Scheduling does not confirm attendance or a booked event.</small>
                  </section>
                  {selected.sales_available !== false && <SalesControls lead={selected} onUpdate={updateSales} />}
                  <section className={styles.statusControls} aria-label="Inquiry status">
                    <label>Status<select value={selected.status} disabled={savingStatus} onChange={(event) => void changeStatus(event.target.value as LeadStatus)}>
                      {LEAD_STATUSES.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
                    </select></label>
                    <p>{savingStatus ? "Saving status…" : "Update after contacting the lead. Opening Gmail does not mark them contacted."}</p>
                    <div className={styles.readControls}><span>{trackingAvailable ? isUnread(selected, user.id) ? "Unread for you" : "Read by you" : "Read tracking unavailable"}</span>
                      <button type="button" disabled={!trackingAvailable || savingRead || selected.activity?.some((item) => item.id.startsWith("pending-view-")) || isUnread(selected, user.id)} onClick={() => void markUnread()}>{savingRead ? "Saving…" : "Mark unread for me"}</button>
                    </div>
                    <p>{latestView(selected) ? `Last opened by ${latestView(selected)?.actor_name} · ${submittedAt(latestView(selected)!.created_at)}` : viewState(selected) === "unviewed" ? "Not yet opened by the studio." : "Earlier view history is unavailable."}</p>
                  </section>
                  {(selected.email || selected.phone) && (
                    <section className={styles.contactBlock} aria-label="Contact information">
                      <p>Contact</p>
                      <div className={styles.contactDetails}>
                        {selected.email && (
                          <div>
                            <span>Email</span>
                            <a
                              href={selectedGmailUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(event) => openGmailPopup(event, selectedGmailUrl)}
                            >
                              {selected.email}
                            </a>
                          </div>
                        )}
                        {selected.phone && (
                          <div>
                            <span>Phone</span>
                            <a href={`tel:${selected.phone.replace(/[^+\d]/g, "")}`}>{displayPhone(selected.phone)}</a>
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  <section className={styles.contactActions}>
                    {selected.email && (
                      <a
                        href={selectedGmailUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) => openGmailPopup(event, selectedGmailUrl)}
                      >
                        Email {selected.name?.split(" ")[0] || "client"} in Gmail
                      </a>
                    )}
                    {selected.phone && <a href={`tel:${selected.phone.replace(/[^+\d]/g, "")}`}>Call</a>}
                  </section>

                  <section className={styles.detailSection}>
                    <h3>Event details</h3>
                    <dl className={styles.eventDetails}>
                      <div><dt>Celebration</dt><dd>{selected.celebration_type || "Not shared"}</dd></div>
                      <div><dt>Event date</dt><dd>{readableDate(selected.event_date, selected.date_undecided)}</dd></div>
                      <div><dt>Guests</dt><dd>{selected.guest_count || "Not shared"}</dd></div>
                      <div><dt>Venue</dt><dd>{selected.venue || "Not chosen yet"}</dd></div>
                      <div><dt>Budget</dt><dd>{selected.investment || "Not shared"}</dd></div>
                    </dl>
                  </section>

                  {selected.utm_source && (
                    <details className={styles.marketingDetails}>
                      <summary>Marketing details</summary>
                      <dl className={styles.eventDetails}>
                        <div><dt>Source / medium</dt><dd>{selected.utm_source} / {selected.utm_medium || "—"}</dd></div>
                        <div><dt>Landing page</dt><dd>{selected.landing_page || "—"}</dd></div>
                        <div><dt>Campaign ID</dt><dd>{selected.meta_campaign_id || selected.utm_campaign || "—"}</dd></div>
                        <div><dt>Ad set ID</dt><dd>{selected.meta_adset_id || "—"}</dd></div>
                        <div><dt>Ad ID</dt><dd>{selected.meta_ad_id || "—"}</dd></div>
                        <div><dt>First clicked</dt><dd>{selected.first_touch_at ? submittedAt(selected.first_touch_at) : "Not recorded"}</dd></div>
                        {selected.attribution?.last && selected.attribution.last.params.utm_content !== selected.attribution.first?.params.utm_content && (
                          <div><dt>Most recent ad</dt><dd>{selected.attribution.last.params.utm_ad_name || selected.attribution.last.params.utm_content || "—"}</dd></div>
                        )}
                      </dl>
                    </details>
                  )}

                  {selected.services.length > 0 && (
                    <section className={styles.detailSection}>
                      <h3>Interested in</h3>
                      <div className={styles.tags}>{selected.services.map((service) => <span key={service}>{service}</span>)}</div>
                    </section>
                  )}

                  {selected.vision && (
                    <section className={styles.detailSection}>
                      <h3>Their vision</h3>
                      <blockquote className={styles.visionQuote}>“{selected.vision}”</blockquote>
                    </section>
                  )}

                  {selected.attachments.length > 0 && (
                    <section className={styles.detailSection}>
                      <div className={styles.inspirationHeading}>
                        <h3>Inspiration images</h3>
                        <span>{selected.attachments.length} uploaded</span>
                      </div>
                      <div className={styles.inspirationGrid}>
                        {selected.attachments.map((url, index) => (
                          <a
                            className={styles.inspirationImage}
                            href={url}
                            key={url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Open inspiration image ${index + 1} from ${selected.name || "this inquiry"} full size`}
                          >
                            <Image
                              src={url}
                              alt={`Inspiration image ${index + 1} from ${selected.name || "this inquiry"}`}
                              fill
                              sizes="(max-width: 760px) 44vw, 240px"
                              unoptimized
                            />
                            <span>View full size <i aria-hidden="true">↗</i></span>
                          </a>
                        ))}
                      </div>
                    </section>
                  )}

                  <section className={styles.detailSection}>
                    <div className={styles.notesHeading}><h3>Private notes</h3><span>Only the studio can see these</span></div>
                    <form key={selected.id} className={styles.noteForm} onSubmit={saveNote}>
                      <textarea aria-label="Private note" name="note" placeholder="Add a reminder, thought, or follow-up…" rows={3} maxLength={4000} />
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

                  <section className={styles.detailSection}>
                    <h3>Studio activity</h3>
                    <p className={styles.activityHelp}>Read / unread is personal. The studio can still see who opened an inquiry. Earlier activity is not backfilled.</p>
                    {(selected.activity?.length || 0) > 30 && <p className={styles.activityHelp}>Showing the latest 30 events.</p>}
                    <ol className={styles.activityList}>
                      {(selected.activity || []).slice(0, 30).map((item) => <li key={item.id}>
                        <b>{item.actor_name}</b> {item.kind === "viewed" ? item.detail === "unread" ? "marked unread for themselves" : "opened this inquiry" : item.kind === "note_added" ? "added a private note" : item.kind === "sales_update" ? `recorded: ${item.detail || "sales update"}` : item.kind.startsWith("appointment_") ? `${item.kind === "appointment_scheduled" ? "scheduled" : item.kind === "appointment_rescheduled" ? "rescheduled" : "canceled"} a design consultation${item.detail ? ` · ${submittedAt(item.detail)} ET` : ""}` : `changed status to ${STATUS_LABELS[item.detail as LeadStatus] || item.detail}`}
                        <time dateTime={item.created_at}>{submittedAt(item.created_at)}</time>
                      </li>)}
                    </ol>
                    {!selected.activity?.length && <p className={styles.noNotes}>No recorded activity yet.</p>}
                  </section>
                  <section className={styles.organizeActions}>
                    <button type="button" onClick={() => void deleteInquiry()} className={styles.deleteButton} disabled={savingStatus} style={{ color: "red", backgroundColor: "transparent", border: "1px solid red", marginLeft: "auto" }}>Delete</button>
                  </section>
                </div>
              </>
            ) : (
              <div className={styles.emptyDetail}><p>{visibleLeads.length ? "Choose an inquiry to see its details." : "No inquiries match this view."}</p></div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
