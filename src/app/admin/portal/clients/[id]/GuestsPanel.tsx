"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import {
  EVENTS,
  GUEST_FIELD_GROUPS,
  GUEST_VIEWS,
  HOUSEHOLD_FIELDS,
  SETUP_FIELDS,
  TABLE_FIELDS,
  blankRecord,
  guestCounts,
  guestName,
  handoffCsv,
  isAttending,
  text,
  viewFilter,
  yes,
  type FieldDef,
  type GuestData,
  type GuestRecord,
  type GuestSettings,
  type GuestView,
  type RecordKind,
} from "@/lib/guests-view";
import styles from "../../portal-admin.module.css";

const RSVP_CLASS: Record<string, string | undefined> = {
  "Awaiting Response": styles.checklistStatusProgress,
  Attending: styles.checklistStatusDone,
  Declined: styles.checklistStatusNa,
  Canceled: styles.checklistStatusNa,
  Invited: styles.checklistStatusWaiting,
};

function formatDate(date: string) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

function RecordEditor({ groups, record, households, tables, busy, lockedNote, onSave, onCancel, onRemove }: {
  groups: { title: string; fields: FieldDef[] }[];
  record: GuestData;
  households: GuestRecord[];
  tables: GuestRecord[];
  busy: boolean;
  lockedNote?: boolean;
  onSave: (data: GuestData) => void;
  onCancel: () => void;
  onRemove?: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next: GuestData = { ...record };
    for (const field of groups.flatMap((group) => group.fields)) {
      if (field.kind === "yesno") next[field.key] = form.get(field.key) === "on";
      else if (field.kind === "number") next[field.key] = Number(form.get(field.key) || 0);
      else next[field.key] = String(form.get(field.key) ?? "");
    }
    onSave(next);
  }

  return (
    <form className={`${styles.checklistEditor} ${styles.guestEditor}`} onSubmit={submit}>
      {lockedNote && <p className={styles.checklistNotice}>Counts are locked. Changes to attendance, meals, allergies, or seats will be logged as exceptions.</p>}
      {groups.map((group) => (
        <fieldset key={group.title}>
          {groups.length > 1 && <legend>{group.title}</legend>}
          <div className={styles.timelineEditor}>
            {group.fields.map((field) => {
              const value = record[field.key];
              if (field.kind === "yesno") {
                return (
                  <label key={field.key} className={styles.guestCheck}>
                    <input type="checkbox" name={field.key} defaultChecked={value === true} />
                    <span>{field.label}</span>
                  </label>
                );
              }
              const options = field.kind === "household"
                ? [["", "No household"], ...households.map((household) => [household.id, text(household.data, "name")])]
                : field.kind === "table"
                  ? [["", "No seat yet"], ...tables.map((table) => [table.id, text(table.data, "name")])]
                  : field.options?.map((option) => [option, option || "Not chosen"]);
              return (
                <label key={field.key} className={field.kind === "textarea" ? styles.timelineWide : undefined}>
                  <span>{field.label}</span>
                  {options ? (
                    <select name={field.key} defaultValue={typeof value === "string" ? value : ""}>
                      {options.map(([optionValue, label]) => <option key={optionValue} value={optionValue}>{label}</option>)}
                    </select>
                  ) : field.kind === "textarea" ? (
                    <textarea name={field.key} rows={2} maxLength={field.max} defaultValue={typeof value === "string" ? value : ""} />
                  ) : (
                    <input
                      name={field.key}
                      type={field.kind === "date" ? "date" : field.kind === "number" ? "number" : field.kind === "email" ? "email" : "text"}
                      min={field.kind === "number" ? 0 : undefined}
                      maxLength={field.max}
                      required={field.required}
                      defaultValue={value === undefined ? "" : String(value)}
                    />
                  )}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
      <div className={styles.uploadActions}>
        <div className={styles.timelineEditorLeft}>
          {onRemove && (
            <button type="button" className={styles.budgetDanger} onClick={() => (confirming ? onRemove() : setConfirming(true))} onBlur={() => setConfirming(false)}>
              {confirming ? "Tap again to remove" : "Remove"}
            </button>
          )}
          <button type="button" className={styles.budgetDanger} onClick={onCancel}>Cancel</button>
        </div>
        <button type="submit" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}

/** One line under a guest's name, showing what matters in the open view. */
function summary(view: GuestView, guest: GuestRecord, tableName: Map<string, string>, householdName: Map<string, string>) {
  const d = guest.data;
  const seat = tableName.get(text(d, "table_id"));
  switch (view) {
    case "followup":
      return [text(d, "source") && `via ${text(d, "source")}`, text(d, "last_outreach") && `last outreach ${formatDate(text(d, "last_outreach"))}`, text(d, "method"), text(d, "follow"), text(d, "mobile")];
    case "meals":
      return [text(d, "meal") || "No meal yet", text(d, "dietary"), text(d, "allergen") && `Allergen: ${text(d, "allergen")}`, text(d, "accessibility"), yes(d, "highchair") && "Highchair", seat ? `Table ${seat}` : "No seat"];
    case "travel":
      return [text(d, "arrival") && `Arrives ${formatDate(text(d, "arrival"))}`, text(d, "flight"), [text(d, "hotel"), text(d, "property"), text(d, "room")].filter((part) => part && part !== "Not Required").join(", "), text(d, "transport") !== "Not Required" && [text(d, "transport"), text(d, "route")].filter(Boolean).join(": "), text(d, "gift") && `Gift: ${text(d, "gift")}`];
    default:
      return [householdName.get(text(d, "household_id")), text(d, "side"), text(d, "type"), text(d, "meal"), seat ? `Table ${seat}` : isAttending(guest) ? "No seat" : ""];
  }
}

export default function GuestsPanel({
  clientId,
  initialRecords,
  initialSettings,
  loadError,
}: {
  clientId: string;
  initialRecords: GuestRecord[];
  initialSettings: GuestSettings;
  loadError?: string;
}) {
  const router = useRouter();
  const [records, setRecords] = useState(initialRecords);
  const [settings, setSettings] = useState(initialSettings);
  const [view, setView] = useState<GuestView>("guests");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(loadError || "");
  const [showSetup, setShowSetup] = useState(false);

  const guests = records.filter((record) => record.kind === "guest");
  const households = records.filter((record) => record.kind === "household");
  const tables = records.filter((record) => record.kind === "table");
  const tableName = useMemo(() => new Map(tables.map((table) => [table.id, text(table.data, "name")])), [tables]);
  const householdName = useMemo(() => new Map(households.map((household) => [household.id, text(household.data, "name")])), [households]);
  const counts = guestCounts(guests);
  const hint = GUEST_VIEWS.find((item) => item.id === view)?.hint;

  const query = search.trim().toLowerCase();
  const shown = guests
    .filter(viewFilter(view))
    .filter((guest) => !query || `${guestName(guest)} ${householdName.get(text(guest.data, "household_id")) ?? ""} ${text(guest.data, "email")}`.toLowerCase().includes(query))
    .sort((a, b) => text(a.data, "last").localeCompare(text(b.data, "last")) || text(a.data, "first").localeCompare(text(b.data, "first")));

  async function post(payload: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, ...payload }),
      });
      const result = (await response.json().catch(() => ({}))) as { record?: GuestRecord; settings?: GuestSettings; error?: string };
      if (!response.ok) throw new Error(result.error || "Could not save that.");
      // The page refetches too, so switching tabs and back shows this save.
      router.refresh();
      return result;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save that.");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function saveRecord(kind: RecordKind, recordId: string | null, data: GuestData) {
    const result = await post({ action: "save", kind, id: recordId, data });
    if (!result?.record) return;
    const saved = result.record;
    setRecords((current) => (recordId ? current.map((record) => (record.id === recordId ? saved : record)) : [...current, saved]));
    setEditing("");
    // A locked save may have written to the exception log.
    if (settings.counts_locked && kind === "guest") {
      const refreshed = await post({ action: "settings" });
      if (refreshed?.settings) setSettings(refreshed.settings);
    }
  }

  async function removeRecord(record: GuestRecord) {
    const result = await post({ action: "delete", id: record.id });
    if (!result) return;
    setRecords((current) => current
      .filter((item) => item.id !== record.id)
      .map((item) => {
        // Mirror the server: guests lose a removed household or table.
        const field = record.kind === "household" ? "household_id" : record.kind === "table" ? "table_id" : null;
        return field && item.kind === "guest" && item.data[field] === record.id ? { ...item, data: { ...item.data, [field]: "" } } : item;
      }));
    setEditing("");
    if (settings.counts_locked && record.kind === "guest") {
      const refreshed = await post({ action: "settings" });
      if (refreshed?.settings) setSettings(refreshed.settings);
    }
  }

  async function saveSettings(patch: Record<string, unknown>) {
    const result = await post({ action: "settings", ...patch });
    if (result?.settings) setSettings(result.settings);
  }

  function toggleEvent(guest: GuestRecord, event: string) {
    const events = { ...((guest.data.events as Record<string, boolean>) ?? {}) };
    events[event] = !events[event];
    void saveRecord("guest", guest.id, { ...guest.data, events });
  }

  function downloadHandoff() {
    const blob = new Blob([handoffCsv(guests, tables)], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "caterer-handoff.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  const editorFor = (kind: RecordKind, record: GuestRecord | null) => (
    <RecordEditor
      groups={kind === "guest" ? GUEST_FIELD_GROUPS : [{ title: "", fields: kind === "household" ? HOUSEHOLD_FIELDS : TABLE_FIELDS }]}
      record={record?.data ?? blankRecord(kind)}
      households={households}
      tables={tables}
      busy={busy}
      lockedNote={kind === "guest" && settings.counts_locked}
      onCancel={() => setEditing("")}
      onSave={(data) => void saveRecord(kind, record?.id ?? null, data)}
      onRemove={record ? () => void removeRecord(record) : undefined}
    />
  );

  return (
    <section className={styles.workspaceCard}>
      <div className={`${styles.workspaceCardHeader} ${styles.imageCardHeader}`}>
        <div><p className={styles.eyebrow}>Guests, RSVP & hospitality</p><h2>Guests</h2></div>
        <div className={styles.imageFilter}>
          {GUEST_VIEWS.map((item) => (
            <button type="button" key={item.id} className={view === item.id ? styles.imageFilterActive : undefined} onClick={() => { setView(item.id); setEditing(""); }}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`${styles.checklistSummary} ${styles.guestStats}`}>
        {counts.map((count) => (
          <div key={count.label}>
            <span>{count.label}</span>
            <strong className={count.warn ? styles.checklistLate : undefined}>{count.value}</strong>
          </div>
        ))}
      </div>

      <div className={styles.timelineStatusBar}>
        <p>
          {settings.counts_locked
            ? `Counts locked${settings.locked_by ? ` by ${settings.locked_by}` : ""}. The caterer's final count is set; later changes are logged.`
            : `Counts open.${settings.setup["Caterer Final Count Due"] ? ` Caterer final count due ${settings.setup["Caterer Final Count Due"]}.` : ""}`}
        </p>
        <div>
          <button type="button" className={styles.budgetSecondary} onClick={() => setShowSetup((open) => !open)} aria-expanded={showSetup}>
            {showSetup ? "Close setup" : "Setup & events"}
          </button>
          <button type="button" className={styles.budgetSecondary} disabled={busy} onClick={() => void saveSettings({ locked: !settings.counts_locked })}>
            {settings.counts_locked ? "Unlock counts" : "Lock counts"}
          </button>
        </div>
      </div>

      {showSetup && (
        <form
          className={`${styles.checklistEditor} ${styles.timelineEditor} ${styles.timelineOverview}`}
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            void saveSettings({
              setup: Object.fromEntries(SETUP_FIELDS.map((field) => [field, String(form.get(field) ?? "")])),
              events: EVENTS.filter((item) => form.get(`event:${item}`) === "on"),
            });
          }}
        >
          {SETUP_FIELDS.map((field) => (
            <label key={field}><span>{field}</span><input name={field} defaultValue={settings.setup[field] ?? ""} /></label>
          ))}
          <fieldset className={styles.timelineWide}>
            <legend>Events this celebration has</legend>
            <div className={styles.guestEventChoices}>
              {EVENTS.map((item) => (
                <label key={item} className={styles.guestCheck}>
                  <input type="checkbox" name={`event:${item}`} defaultChecked={settings.events.includes(item)} />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className={`${styles.uploadActions} ${styles.timelineWide}`}>
            <p>Couple, date, and venue come from the client record.</p>
            <button type="submit" disabled={busy}>{busy ? "Saving…" : "Save setup"}</button>
          </div>
        </form>
      )}

      {settings.exceptions.length > 0 && (
        <details className={styles.guestExceptions}>
          <summary>{settings.exceptions.length} {settings.exceptions.length === 1 ? "change" : "changes"} since counts were locked</summary>
          <ul>
            {[...settings.exceptions].reverse().map((entry, index) => (
              <li key={`${entry.at}-${index}`}>
                {new Date(entry.at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} · {entry.guest}: {entry.field.replace("_id", "")} {entry.from} → {entry.to} <small>({entry.by})</small>
              </li>
            ))}
          </ul>
        </details>
      )}

      {error && <p className={`${styles.formError} ${styles.budgetError}`} role="alert">{error}</p>}
      {hint && <p className={styles.guestHint}>{hint}</p>}

      {["guests", "followup", "meals", "travel"].includes(view) && (
        <>
          <div className={styles.checklistControls}>
            <input type="search" placeholder="Search guests, households, email" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search guests" />
          </div>
          {shown.length === 0 && <p className={styles.budgetEmpty}>{guests.length === 0 ? "No guests yet. Add households first if you want to group guests for invitations, then add each guest." : "No guests in this view."}</p>}
          <ul className={`${styles.checklistRows} ${styles.timelineRows}`}>
            {shown.map((guest) => (
              <li key={guest.id}>
                <div className={styles.guestRow}>
                  <div className={styles.checklistText}>
                    <strong>
                      {guestName(guest)}
                      {yes(guest.data, "vip") && <em className={styles.checklistTag}>VIP</em>}
                      {yes(guest.data, "severe") && <em className={`${styles.checklistTag} ${styles.checklistLate}`}>Severe allergy</em>}
                      {yes(guest.data, "plus_allowed") && <em className={styles.checklistTag}>+1{text(guest.data, "plus_name") ? ` ${text(guest.data, "plus_name")}` : ""}</em>}
                    </strong>
                    <small>{summary(view, guest, tableName, householdName).filter(Boolean).join(" · ")}</small>
                  </div>
                  <div className={styles.timelineRowEnd}>
                    <span className={`${styles.checklistStatus} ${styles.budgetPill} ${RSVP_CLASS[text(guest.data, "rsvp")] ?? ""}`}>{text(guest.data, "rsvp")}</span>
                    <button type="button" onClick={() => setEditing((current) => (current === guest.id ? "" : guest.id))}>{editing === guest.id ? "Close" : "Edit"}</button>
                  </div>
                </div>
                {editing === guest.id && editorFor("guest", guest)}
              </li>
            ))}
          </ul>
          {editing === "new-guest" ? editorFor("guest", null) : (
            <button type="button" className={`${styles.budgetSecondary} ${styles.timelineAdd}`} onClick={() => setEditing("new-guest")}>Add guest</button>
          )}
        </>
      )}

      {view === "events" && (
        settings.events.length === 0 || guests.length === 0 ? (
          <p className={styles.budgetEmpty}>{guests.length === 0 ? "Add guests first." : "Pick this celebration's events under Setup & events."}</p>
        ) : (
          <div className={styles.budgetTableWrap}>
            <table className={`${styles.budgetTable} ${styles.guestMatrix}`}>
              <thead><tr><th>Guest</th>{settings.events.map((item) => <th key={item}>{item}</th>)}</tr></thead>
              <tbody>
                {shown.map((guest) => (
                  <tr key={guest.id}>
                    <th scope="row">{guestName(guest)}</th>
                    {settings.events.map((item) => (
                      <td key={item}>
                        <input
                          type="checkbox"
                          aria-label={`${guestName(guest)} at ${item}`}
                          checked={Boolean((guest.data.events as Record<string, boolean> | undefined)?.[item])}
                          disabled={busy}
                          onChange={() => toggleEvent(guest, item)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className={styles.guestMatrixTotal}>
                  <th scope="row">Total</th>
                  {settings.events.map((item) => <td key={item}>{guests.filter((guest) => (guest.data.events as Record<string, boolean> | undefined)?.[item]).length}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        )
      )}

      {view === "seating" && (
        <>
          {tables.length === 0 && editing !== "new-table" && <p className={styles.budgetEmpty}>No tables yet. Add each table with its capacity, then seat guests from their own record.</p>}
          <ul className={`${styles.checklistRows} ${styles.timelineRows}`}>
            {tables.map((table) => {
              const seated = guests.filter((guest) => isAttending(guest) && text(guest.data, "table_id") === table.id);
              const capacity = Number(table.data.capacity ?? 0);
              const over = seated.length > capacity;
              return (
                <li key={table.id}>
                  <div className={styles.guestRow}>
                    <div className={styles.checklistText}>
                      <strong>{text(table.data, "name")} {yes(table.data, "vip") && <em className={styles.checklistTag}>VIP</em>}</strong>
                      <small>
                        {[text(table.data, "type"), text(table.data, "zone")].filter(Boolean).join(" · ")}
                        {" · "}<span className={over ? styles.checklistLate : undefined}>{seated.length} of {capacity} seats{over ? " (over)" : `, ${capacity - seated.length} open`}</span>
                      </small>
                      {seated.length > 0 && <p className={styles.checklistNote}>{seated.map(guestName).join(", ")}</p>}
                    </div>
                    <div className={styles.timelineRowEnd}>
                      <button type="button" onClick={() => setEditing((current) => (current === table.id ? "" : table.id))}>{editing === table.id ? "Close" : "Edit"}</button>
                    </div>
                  </div>
                  {editing === table.id && editorFor("table", table)}
                </li>
              );
            })}
          </ul>
          {editing === "new-table" ? editorFor("table", null) : (
            <button type="button" className={`${styles.budgetSecondary} ${styles.timelineAdd}`} onClick={() => setEditing("new-table")}>Add table</button>
          )}
        </>
      )}

      {view === "households" && (
        <>
          {households.length === 0 && editing !== "new-household" && <p className={styles.budgetEmpty}>No households yet. A household is one mailing address, like &ldquo;Mr. and Mrs. Patel&rdquo;.</p>}
          <ul className={`${styles.checklistRows} ${styles.timelineRows}`}>
            {households.map((household) => {
              const members = guests.filter((guest) => text(guest.data, "household_id") === household.id);
              return (
                <li key={household.id}>
                  <div className={styles.guestRow}>
                    <div className={styles.checklistText}>
                      <strong>{text(household.data, "name")}</strong>
                      <small>{[text(household.data, "contact"), [text(household.data, "city"), text(household.data, "state")].filter(Boolean).join(", "), text(household.data, "invitation")].filter(Boolean).join(" · ")}</small>
                      {members.length > 0 && <p className={styles.checklistNote}>{members.map(guestName).join(", ")}</p>}
                    </div>
                    <div className={styles.timelineRowEnd}>
                      <button type="button" onClick={() => setEditing((current) => (current === household.id ? "" : household.id))}>{editing === household.id ? "Close" : "Edit"}</button>
                    </div>
                  </div>
                  {editing === household.id && editorFor("household", household)}
                </li>
              );
            })}
          </ul>
          {editing === "new-household" ? editorFor("household", null) : (
            <button type="button" className={`${styles.budgetSecondary} ${styles.timelineAdd}`} onClick={() => setEditing("new-household")}>Add household</button>
          )}
        </>
      )}

      {view === "handoff" && (
        <div className={styles.timelineBrief}>
          <div className={styles.timelineBriefActions}>
            <p>{guests.filter(isAttending).length} attending · {guests.filter((guest) => isAttending(guest) && yes(guest.data, "highchair")).length} highchairs. Only these columns ever go to the caterer or venue.</p>
            <div className={styles.timelineEditorLeft}>
              <button type="button" className={styles.budgetSecondary} onClick={downloadHandoff}>Download CSV</button>
              <button type="button" className={styles.budgetSecondary} onClick={() => window.print()}>Print</button>
            </div>
          </div>
          <article className={styles.timelinePrint}>
            <header><p>Lady Victoria Designs · Caterer Handoff{settings.counts_locked ? " · Final count (locked)" : " · Not final"}</p></header>
            <div className={styles.budgetTableWrap}>
              <table>
                <thead><tr><th>Guest</th><td>Meal</td><td>Dietary / allergy</td><td>Access</td><td>Table</td></tr></thead>
                <tbody>
                  {guests.filter(isAttending).map((guest) => (
                    <tr key={guest.id}>
                      <th>{guestName(guest)}</th>
                      <td>{text(guest.data, "meal") || "—"}</td>
                      <td>{[text(guest.data, "dietary"), yes(guest.data, "severe") ? `SEVERE: ${text(guest.data, "allergen") || "see notes"}` : text(guest.data, "allergen")].filter(Boolean).join(" · ") || "—"}</td>
                      <td>{[text(guest.data, "accessibility"), yes(guest.data, "highchair") && "Highchair"].filter(Boolean).join(" · ") || "—"}</td>
                      <td>{tableName.get(text(guest.data, "table_id")) || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
