"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  CALENDAR_KIND_LABELS, EMPTY_CALENDAR_FILTERS, calendarDays, calendarFocusEntries,
  calendarMoney, filterCalendarEntries, formatCalendarDate, isCalendarOverdue,
  shiftCalendarMonth, studioToday, type CalendarData, type CalendarEntry, type CalendarFocus,
} from "@/lib/calendar-view";
import styles from "./calendar.module.css";

const FOCUS_LABELS: Record<CalendarFocus, string> = {
  schedule: "Schedule", overdue: "Overdue tasks & payments", week: "Due this week", approvals: "Waiting on couple approval",
};

function Entry({ entry, today }: { entry: CalendarEntry; today: string }) {
  const overdue = isCalendarOverdue(entry, today);
  return <li className={styles.entry}>
    <div className={styles.entryDate}>
      <span className={styles[entry.kind]}>{CALENDAR_KIND_LABELS[entry.kind]}</span>
      {entry.date ? <time dateTime={entry.date}>{formatCalendarDate(entry.date, { month: "short", day: "numeric", year: "numeric" })}</time> : <span>No due date</span>}
      {overdue && <b>Overdue</b>}
    </div>
    <Link href={entry.href} prefetch={false}>
      <strong>{entry.title}</strong>
      <span>{entry.clientName}</span>
      <small>{entry.track}{entry.owner ? ` · ${entry.owner}` : ""} · {entry.status}{entry.suggested ? " · Suggested date" : ""}</small>
    </Link>
    <div className={styles.entryEnd}>
      {entry.balanceCents !== null && <strong>{calendarMoney(entry.balanceCents)}<small>remaining</small></strong>}
      {entry.waitingApproval && <span className={styles.approvalTag}>Approval waiting</span>}
      <Link href={entry.href} prefetch={false} aria-label={`Open ${entry.clientName}: ${entry.title}`}>Open <span aria-hidden="true">↗</span></Link>
    </div>
  </li>;
}

export default function CalendarPanel({ data, initialToday }: { data: CalendarData; initialToday: string }) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const [today, setToday] = useState(initialToday);
  const [month, setMonth] = useState(initialToday.slice(0, 7));
  const [view, setView] = useState<"month" | "agenda">("month");
  const [focus, setFocus] = useState<CalendarFocus>("schedule");
  const [day, setDay] = useState<string | null>(null);
  const [filters, setFilters] = useState(EMPTY_CALENDAR_FILTERS);
  const [limit, setLimit] = useState(40);
  useEffect(() => {
    const update = () => setToday(studioToday());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const filtered = filterCalendarEntries(data.entries, filters);
  const focused = calendarFocusEntries(filtered, focus, today);
  const scheduled = focused.filter((e) => e.date && e.date.slice(0, 7) === month && (!day || e.date === day));
  const shown = focus === "schedule" ? scheduled : focused;
  const undated = filtered.filter((e) => !e.date);
  const owners = [...new Set(data.entries.map((e) => e.owner).filter(Boolean))].sort();
  const activeFilters = Object.values(filters).some(Boolean);
  const days = calendarDays(month);
  const byDay = new Map<string, CalendarEntry[]>();
  for (const e of filtered) {
    if (!e.date) continue;
    const items = byDay.get(e.date) ?? [];
    items.push(e);
    byDay.set(e.date, items);
  }
  function changeMonth(next: string) {
    if (!/^\d{4}-\d{2}$/.test(next) || Number(next.slice(5)) < 1 || Number(next.slice(5)) > 12 || Number(next.slice(0, 4)) < 1 || Number(next.slice(0, 4)) > 9998) return;
    setMonth(next); setDay(null); setFocus("schedule"); setLimit(40);
  }
  function chooseFocus(next: CalendarFocus) { setFocus(next); setDay(null); setLimit(40); }

  return <main className={styles.page}>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>Across the studio</p><h1>Studio calendar.</h1>
        <p>Wedding days, planning deadlines and budget payments, together.</p></div>
      <button type="button" disabled={refreshing} onClick={() => startRefresh(() => router.refresh())}>{refreshing ? "Refreshing…" : "Refresh schedule"}</button>
    </header>

    {data.warnings.length > 0 && <div role="alert" className={styles.warning}>{data.warnings.map((w) => <p key={w}>{w}</p>)}</div>}
    <section className={styles.alerts} aria-label="Deadline alerts">
      {(["overdue", "week", "approvals"] as const).map((key) => {
        const count = calendarFocusEntries(filtered, key, today).length;
        return <button key={key} type="button" aria-pressed={focus === key} onClick={() => chooseFocus(focus === key ? "schedule" : key)}>
          <span>{FOCUS_LABELS[key]}</span><strong className={key === "overdue" && count ? styles.red : undefined}>{count}</strong>
          <small>{key === "week" ? "Today through Sunday" : key === "approvals" ? "Tasks waiting on the client" : "Open items before today"}</small>
        </button>;
      })}
    </section>
    <p className={styles.caption}>Alerts follow the filters below across all dates. Studio day: {formatCalendarDate(today)} · America/New_York.</p>

    <section className={styles.filters} aria-label="Calendar filters">
      <label>Client<select value={filters.client} onChange={(e) => { setFilters((current) => ({ ...current, client: e.target.value })); setLimit(40); }}><option value="">All clients</option>{data.clients.map((c) => <option key={c.id} value={c.id}>{c.display_name}</option>)}</select></label>
      <label>Track<select value={filters.track} onChange={(e) => { setFilters((current) => ({ ...current, track: e.target.value })); setLimit(40); }}><option value="">All tracks</option>{["Planning Core", "Design & Floral", "Shared / Other"].map((t) => <option key={t}>{t}</option>)}</select></label>
      <label>Owner<select value={filters.owner} onChange={(e) => { setFilters((current) => ({ ...current, owner: e.target.value })); setLimit(40); }}><option value="">All owners</option>{owners.map((o) => <option key={o}>{o}</option>)}<option value="unassigned">No task owner</option></select></label>
      <label>Type<select value={filters.kind} onChange={(e) => { setFilters((current) => ({ ...current, kind: e.target.value })); setLimit(40); }}><option value="">All types</option>{Object.entries(CALENDAR_KIND_LABELS).map(([k, v]) => <option value={k} key={k}>{v}</option>)}</select></label>
      <label className={styles.search}>Search<input type="search" placeholder="Client, task or vendor…" value={filters.search} onChange={(e) => { setFilters((current) => ({ ...current, search: e.target.value })); setLimit(40); }} /></label>
      {activeFilters && <button type="button" onClick={() => { setFilters(EMPTY_CALENDAR_FILTERS); setLimit(40); }}>Clear filters</button>}
    </section>

    <section className={styles.schedule} aria-label="Studio schedule">
      <div className={styles.toolbar}>
        <div className={styles.monthControls}>
          <button type="button" aria-label="Previous month" onClick={() => changeMonth(shiftCalendarMonth(month, -1))}>←</button>
          <label className={styles.monthLabel}>Month<input aria-label="Calendar month" type="month" min="0001-01" max="9998-12" value={month} onChange={(e) => changeMonth(e.target.value)} /></label>
          <button type="button" aria-label="Next month" onClick={() => changeMonth(shiftCalendarMonth(month, 1))}>→</button>
          <button type="button" onClick={() => { changeMonth(today.slice(0, 7)); setDay(today); }}>Today</button>
        </div>
        <div className={styles.viewButtons} aria-label="Calendar view">{(["month", "agenda"] as const).map((v) => <button type="button" aria-pressed={view === v} onClick={() => setView(v)} key={v}>{v === "month" ? "Month" : "Agenda"}</button>)}</div>
      </div>

      {focus === "schedule" && view === "month" && <>
        <div className={styles.legend}><span className={styles.wedding}>Wedding</span><span className={styles.task}>Checklist</span><span className={styles.payment}>Payment</span><span>Suggested dates follow the wedding date until set by the studio.</span></div>
        <div className={styles.grid} role="group" aria-label={formatCalendarDate(`${month}-01`, { month: "long", year: "numeric" })}>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div className={styles.weekday} key={d}>{d}</div>)}
          {days.map((date) => {
            const items = byDay.get(date) ?? [];
            return <div className={`${styles.cell} ${date.slice(0, 7) !== month ? styles.outside : ""} ${date === today ? styles.today : ""} ${date === day ? styles.selected : ""}`} key={date}>
              <button type="button" className={styles.dayButton} aria-pressed={day === date} aria-label={`${formatCalendarDate(date)}, ${items.length} ${items.length === 1 ? "item" : "items"}`} onClick={() => { if (date.slice(0, 7) !== month) setMonth(date.slice(0, 7)); setDay(day === date ? null : date); setLimit(40); }}>
                <time dateTime={date}>{Number(date.slice(8))}</time><small>{items.length || ""}</small>
              </button>
              <div className={styles.previews}>{items.slice(0, 3).map((e) => <Link className={styles[e.kind]} href={e.href} prefetch={false} key={e.id} title={`${e.clientName}: ${e.title}`}><b>{e.clientName}</b><span>{e.title}</span></Link>)}
                {items.length > 3 && <button type="button" onClick={() => { setMonth(date.slice(0, 7)); setDay(date); setLimit(40); }}>+{items.length - 3} more</button>}
              </div>
              <div className={styles.dots} aria-hidden="true">{(["wedding", "task", "payment"] as const).filter((kind) => items.some((e) => e.kind === kind)).map((kind) => <i className={styles[kind]} key={kind} />)}</div>
            </div>;
          })}
        </div>
      </>}

      <div className={styles.listHeading}>
        <h2>{focus !== "schedule" ? FOCUS_LABELS[focus] : day ? formatCalendarDate(day, { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : formatCalendarDate(`${month}-01`, { month: "long", year: "numeric" })}</h2>
        <span role="status">{shown.length} {shown.length === 1 ? "item" : "items"}</span>
        {(focus !== "schedule" || day) && <button type="button" onClick={() => { chooseFocus("schedule"); }}>Show full month</button>}
      </div>
      {shown.length ? <ul className={styles.list}>{shown.slice(0, limit).map((e) => <Entry entry={e} today={today} key={e.id} />)}</ul> : <p className={styles.empty}>{data.warnings.length ? "No items available in this view. Resolve the loading issue above to see the full schedule." : data.clients.length === 0 ? "Add a client to start your studio schedule." : "No open items match this view. Choose another month or adjust the filters."}</p>}
      {shown.length > limit && <button className={styles.showMore} type="button" onClick={() => setLimit(limit + 40)}>Show more ({shown.length - limit} remaining)</button>}
    </section>
    {undated.length > 0 && <details className={styles.undated}><summary>{undated.length} open {undated.length === 1 ? "item has" : "items have"} no due date</summary><p>Set a date in the client’s Checklist or Budget to put it on the calendar. Undated approvals still appear in approval alerts.</p><ul className={styles.list}>{undated.map((e) => <Entry entry={e} today={today} key={e.id} />)}</ul></details>}
    <footer className={styles.footer}>Open an item to edit it in the client workspace. Refresh the schedule after changes. Payments come from Budget; email reminders and invoice syncing are separate builds.</footer>
  </main>;
}
