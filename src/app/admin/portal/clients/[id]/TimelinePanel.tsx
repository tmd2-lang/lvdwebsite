"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  OVERVIEW_FIELDS,
  QUALITY_CHECKS,
  TIMELINE_PHASES,
  TIMELINE_PRIORITIES,
  TIMELINE_STATUSES,
  TIMELINE_TRACKS,
  TIMELINE_VISIBILITY,
  UNCONFIRMED_STATUSES,
  VENDOR_TYPES,
  byStartTime,
  dayMinutes,
  formatTime,
  isClientVisible,
  localToday,
  nextRef,
  type CrewMember,
  type ProductionBlock,
  type TimelineCue,
  type TimelineDoc,
  type TimelineSection,
  type TimelineVendor,
} from "@/lib/timeline-view";
import styles from "../../portal-admin.module.css";

type View = "cues" | "production" | "vendors" | "crew" | "overview" | "brief";
type CueFilter = "studio" | "couple" | "vendor";

const VIEWS: { id: View; label: string }[] = [
  { id: "cues", label: "Run of show" },
  { id: "production", label: "Production" },
  { id: "vendors", label: "Vendors" },
  { id: "crew", label: "Crew" },
  { id: "overview", label: "Overview" },
  { id: "brief", label: "Print brief" },
];

type Field = { key: string; label: string; type?: "time" | "number" | "textarea" | "email" | "tel"; options?: string[]; required?: boolean; wide?: boolean };

const CUE_FIELDS: Field[] = [
  { key: "start", label: "Start", type: "time" },
  { key: "end", label: "End", type: "time" },
  { key: "phase", label: "Phase", options: TIMELINE_PHASES },
  { key: "activity", label: "Activity / cue", required: true, wide: true },
  { key: "location", label: "Location" },
  { key: "owner", label: "Owner" },
  { key: "people", label: "People involved" },
  { key: "dependency", label: "Depends on" },
  { key: "track", label: "Track", options: TIMELINE_TRACKS },
  { key: "visibility", label: "Who sees it", options: TIMELINE_VISIBILITY },
  { key: "priority", label: "Priority", options: TIMELINE_PRIORITIES },
  { key: "status", label: "Status", options: TIMELINE_STATUSES },
  { key: "notes", label: "Notes", type: "textarea", wide: true },
];

const PRODUCTION_FIELDS: Field[] = [
  { key: "start", label: "Start", type: "time" },
  { key: "end", label: "End", type: "time" },
  { key: "ready_by", label: "Ready by", type: "time" },
  { key: "workstream", label: "Workstream" },
  { key: "task", label: "Task / deliverable", required: true, wide: true },
  { key: "location", label: "Location" },
  { key: "crew", label: "Crew" },
  { key: "crew_count", label: "Crew count", type: "number" },
  { key: "equipment", label: "Equipment" },
  { key: "quality_check", label: "Quality check", options: QUALITY_CHECKS },
  { key: "status", label: "Status", options: TIMELINE_STATUSES },
  { key: "notes", label: "Notes", type: "textarea", wide: true },
];

const VENDOR_FIELDS: Field[] = [
  { key: "company", label: "Company", required: true },
  { key: "type", label: "Type", options: VENDOR_TYPES },
  { key: "lead", label: "On-site lead" },
  { key: "mobile", label: "Mobile", type: "tel" },
  { key: "email", label: "Email", type: "email" },
  { key: "arrival", label: "Arrival", type: "time" },
  { key: "ready_by", label: "Ready by", type: "time" },
  { key: "departure", label: "Departure / strike", type: "time" },
  { key: "setup_location", label: "Setup location" },
  { key: "loading", label: "Loading / parking", wide: true },
  { key: "power", label: "Power / equipment", wide: true },
  { key: "meals", label: "Meals" },
];

const CREW_FIELDS: Field[] = [
  { key: "name", label: "Name", required: true },
  { key: "role", label: "Role" },
  { key: "mobile", label: "Mobile", type: "tel" },
  { key: "call_time", label: "Call time", type: "time" },
  { key: "out_time", label: "Out time", type: "time" },
  { key: "meal", label: "Meal" },
];

const STATUS_CLASS: Record<string, string | undefined> = {
  "Pending Confirmation": styles.checklistStatusProgress,
  Confirmed: styles.checklistStatusWaiting,
  Changed: styles.checklistStatusRisk,
  Complete: styles.checklistStatusDone,
  Canceled: styles.checklistStatusNa,
};

function RowEditor({ fields, row, busy, onSave, onCancel, onRemove }: {
  fields: Field[];
  row: Record<string, unknown>;
  busy: boolean;
  onSave: (row: Record<string, unknown>) => void;
  onCancel: () => void;
  onRemove?: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next: Record<string, unknown> = { ...row };
    for (const field of fields) {
      const value = String(data.get(field.key) ?? "");
      next[field.key] = field.type === "number" ? Number(value || 0) : value;
    }
    onSave(next);
  }

  return (
    <form className={`${styles.checklistEditor} ${styles.timelineEditor}`} onSubmit={submit}>
      {fields.map((field) => (
        <label key={field.key} className={field.wide ? styles.timelineWide : undefined}>
          <span>{field.label}</span>
          {field.options ? (
            <select name={field.key} defaultValue={String(row[field.key] ?? field.options[0])}>
              {field.options.map((option) => <option key={option}>{option}</option>)}
            </select>
          ) : field.type === "textarea" ? (
            <textarea name={field.key} rows={2} maxLength={2000} defaultValue={String(row[field.key] ?? "")} />
          ) : (
            <input
              name={field.key}
              type={field.type ?? "text"}
              min={field.type === "number" ? 0 : undefined}
              required={field.required}
              defaultValue={String(row[field.key] ?? "")}
            />
          )}
        </label>
      ))}
      <div className={`${styles.uploadActions} ${styles.timelineWide}`}>
        <div className={styles.timelineEditorLeft}>
          {onRemove && (
            <button
              type="button"
              className={styles.budgetDanger}
              onClick={() => (confirming ? onRemove() : setConfirming(true))}
              onBlur={() => setConfirming(false)}
            >
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

export default function TimelinePanel({
  clientId,
  eventDate,
  initial,
  loadError,
}: {
  clientId: string;
  eventDate: string | null;
  initial: TimelineDoc;
  loadError?: string;
}) {
  const router = useRouter();
  const [doc, setDoc] = useState(initial);
  const [view, setView] = useState<View>("cues");
  const [cueFilter, setCueFilter] = useState<CueFilter>("studio");
  const [track, setTrack] = useState("all");
  const [editing, setEditing] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(loadError || "");
  const [conflict, setConflict] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [now, setNow] = useState<number | null>(null);

  // On the wedding day the run of show marks what is happening now. Worked
  // out after load, from the phone's own clock, and refreshed each minute.
  useEffect(() => {
    if (!eventDate) return;
    const tick = () => {
      const date = new Date();
      setNow(localToday() === eventDate ? dayMinutes(`${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`) : null);
    };
    tick();
    const timer = window.setInterval(tick, 60_000);
    return () => window.clearInterval(timer);
  }, [eventDate]);

  async function save(section: TimelineSection, data: unknown) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, section, data, expectedUpdatedAt: doc.updated_at }),
      });
      const result = (await response.json().catch(() => ({}))) as { timeline?: TimelineDoc; error?: string; conflict?: boolean };
      if (!response.ok || !result.timeline) {
        setConflict(Boolean(result.conflict));
        throw new Error(result.error || "Could not save the timeline.");
      }
      setDoc(result.timeline);
      setEditing("");
      // Keep the page's copy current too, so switching tabs and back does
      // not reopen the timeline from before this save.
      router.refresh();
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the timeline.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, action: "reset" }),
      });
      const result = (await response.json().catch(() => ({}))) as { timeline?: TimelineDoc; error?: string };
      if (!response.ok || !result.timeline) throw new Error(result.error || "Could not reset the timeline.");
      setDoc(result.timeline);
      setConfirmReset(false);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not reset the timeline.");
    } finally {
      setBusy(false);
    }
  }

  /** Saves one row of a list section: replaces it, appends it, or removes it. */
  function saveRow<T extends { ref: string }>(section: "cues" | "production" | "vendors" | "crew", list: T[], row: T, remove = false) {
    const exists = list.some((item) => item.ref === row.ref);
    const next = remove ? list.filter((item) => item.ref !== row.ref) : exists ? list.map((item) => (item.ref === row.ref ? row : item)) : [...list, row];
    return save(section, next);
  }

  function confirmAll() {
    void save("confirm", null);
  }

  const unconfirmed = [...doc.cues, ...doc.production].filter((row) => UNCONFIRMED_STATUSES.includes(row.status)).length;

  const cues = byStartTime(doc.cues).filter((cue) => {
    if (cueFilter === "couple" && !isClientVisible(cue)) return false;
    if (cueFilter === "vendor" && cue.visibility !== "Vendor Facing") return false;
    if (track !== "all" && cue.track !== track && cue.track !== "Shared") return false;
    return true;
  });
  const nowRef = now === null ? null : [...cues].reverse().find((cue) => dayMinutes(cue.start) <= now)?.ref ?? null;
  const nextCueRef = now === null ? null : cues.find((cue) => dayMinutes(cue.start) > now)?.ref ?? null;

  const newCue = (): TimelineCue => ({ ref: nextRef("TL", doc.cues), start: "", end: "", phase: "Reception", track: "Shared", activity: "", location: "", owner: "", people: "", dependency: "", visibility: "Internal Only", priority: "Medium", status: "Draft", notes: "" });
  const newBlock = (): ProductionBlock => ({ ref: nextRef("PROD", doc.production), start: "", end: "", workstream: "", task: "", location: "", crew: "LVD crew", crew_count: 0, equipment: "", ready_by: "", quality_check: "Pending", status: "Draft", notes: "" });
  const newVendor = (): TimelineVendor => ({ ref: nextRef("VEN", doc.vendors), company: "", type: "Other", lead: "", mobile: "", email: "", arrival: "", ready_by: "", departure: "", loading: "", setup_location: "", power: "", meals: "" });
  const newCrew = (): CrewMember => ({ ref: nextRef("CREW", doc.crew), name: "", role: "", call_time: "", out_time: "", meal: "", mobile: "" });

  function addButton(label: string, ref: string) {
    return editing === ref ? null : (
      <button type="button" className={`${styles.budgetSecondary} ${styles.timelineAdd}`} onClick={() => setEditing(ref)}>{label}</button>
    );
  }

  const critical = byStartTime(doc.cues).filter((cue) => cue.priority === "Critical" && cue.status !== "Canceled");

  return (
    <section className={styles.workspaceCard}>
      <div className={`${styles.workspaceCardHeader} ${styles.imageCardHeader}`}>
        <div>
          <p className={styles.eyebrow}>Event-day command · Version {doc.version}</p>
          <h2>Timeline</h2>
        </div>
        <div className={styles.imageFilter}>
          {VIEWS.map((item) => (
            <button type="button" key={item.id} className={view === item.id ? styles.imageFilterActive : undefined} onClick={() => { setView(item.id); setEditing(""); }}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.timelineStatusBar}>
        <p>
          {doc.updated_at ? `Last saved by ${doc.updated_by ?? "the studio"}` : "Starter template. Nothing saved for this client yet."}
          {unconfirmed > 0 ? ` · ${unconfirmed} ${unconfirmed === 1 ? "item" : "items"} not confirmed` : " · Everything confirmed"}
        </p>
        <div>
          {unconfirmed > 0 && <button type="button" className={styles.budgetSecondary} disabled={busy} onClick={confirmAll}>Confirm all</button>}
          <button
            type="button"
            className={styles.budgetDanger}
            disabled={busy}
            onClick={() => (confirmReset ? void reset() : setConfirmReset(true))}
            onBlur={() => setConfirmReset(false)}
          >
            {confirmReset ? "Tap again to start over from the template" : "Start over"}
          </button>
        </div>
      </div>

      {error && (
        <p className={`${styles.formError} ${styles.budgetError}`} role="alert">
          {error}{" "}
          {conflict && <button type="button" className={styles.timelineReload} onClick={() => window.location.reload()}>Reload</button>}
        </p>
      )}

      {view === "cues" && (
        <>
          <div className={styles.checklistControls}>
            <select value={cueFilter} onChange={(event) => setCueFilter(event.target.value as CueFilter)} aria-label="Whose view">
              <option value="studio">Studio view (everything)</option>
              <option value="couple">What the couple would see</option>
              <option value="vendor">Vendor-facing cues</option>
            </select>
            <select value={track} onChange={(event) => setTrack(event.target.value)} aria-label="Track">
              <option value="all">Both tracks</option>
              <option value="Planning Core">Planning Core (+ shared)</option>
              <option value="Design & Floral">Design & Floral (+ shared)</option>
            </select>
          </div>
          <ul className={`${styles.checklistRows} ${styles.timelineRows}`}>
            {cues.map((cue) => (
              <li key={cue.ref} className={cue.ref === nowRef ? styles.timelineNow : cue.status === "Canceled" ? styles.taskDone : undefined}>
                <div className={styles.timelineRow}>
                  <time>
                    <b>{formatTime(cue.start)}</b>
                    {cue.end && <small>to {formatTime(cue.end)}</small>}
                    {cue.ref === nowRef && <em className={styles.checklistTag}>Now</em>}
                    {cue.ref === nextCueRef && <em className={styles.checklistTag}>Next</em>}
                  </time>
                  <div className={styles.checklistText}>
                    <strong>{cue.activity}</strong>
                    <small>
                      {[cue.phase, cue.location, cue.owner].filter(Boolean).join(" · ")}
                      {cue.priority === "Critical" && <em className={`${styles.checklistTag} ${styles.checklistLate}`}>Critical</em>}
                      <em className={styles.checklistTag}>{cue.visibility}</em>
                      {cue.track !== "Shared" && <em className={styles.checklistTag}>{cue.track === "Design & Floral" ? "Design" : "Planning"}</em>}
                    </small>
                    {cue.notes && editing !== cue.ref && <p className={styles.checklistNote}>{cue.notes}</p>}
                  </div>
                  <div className={styles.timelineRowEnd}>
                    <span className={`${styles.checklistStatus} ${styles.budgetPill} ${STATUS_CLASS[cue.status] ?? ""}`}>{cue.status}</span>
                    <button type="button" onClick={() => setEditing((current) => (current === cue.ref ? "" : cue.ref))}>{editing === cue.ref ? "Close" : "Edit"}</button>
                  </div>
                </div>
                {editing === cue.ref && (
                  <RowEditor
                    fields={CUE_FIELDS}
                    row={cue}
                    busy={busy}
                    onCancel={() => setEditing("")}
                    onSave={(row) => void saveRow("cues", doc.cues, row as TimelineCue)}
                    onRemove={() => void saveRow("cues", doc.cues, cue, true)}
                  />
                )}
              </li>
            ))}
          </ul>
          {cues.length === 0 && <p className={styles.budgetEmpty}>No cues match this view.</p>}
          {editing === "new-cue" && (
            <RowEditor fields={CUE_FIELDS} row={newCue()} busy={busy} onCancel={() => setEditing("")} onSave={(row) => void saveRow("cues", doc.cues, row as TimelineCue)} />
          )}
          {addButton("Add cue", "new-cue")}
        </>
      )}

      {view === "production" && (
        <>
          <ul className={`${styles.checklistRows} ${styles.timelineRows}`}>
            {byStartTime(doc.production).map((block) => (
              <li key={block.ref} className={block.status === "Canceled" ? styles.taskDone : undefined}>
                <div className={styles.timelineRow}>
                  <time><b>{formatTime(block.start)}</b>{block.end && <small>to {formatTime(block.end)}</small>}</time>
                  <div className={styles.checklistText}>
                    <strong>{block.workstream ? `${block.workstream}: ` : ""}{block.task}</strong>
                    <small>
                      {[block.location, `${block.crew}${block.crew_count ? ` (${block.crew_count})` : ""}`, block.ready_by && `ready by ${formatTime(block.ready_by)}`].filter(Boolean).join(" · ")}
                      <em className={`${styles.checklistTag} ${block.quality_check === "Passed" ? "" : block.quality_check === "Corrected" ? styles.checklistLate : ""}`}>QC: {block.quality_check}</em>
                    </small>
                    {block.equipment && <p className={styles.checklistNote}>{block.equipment}</p>}
                  </div>
                  <div className={styles.timelineRowEnd}>
                    <span className={`${styles.checklistStatus} ${styles.budgetPill} ${STATUS_CLASS[block.status] ?? ""}`}>{block.status}</span>
                    <button type="button" onClick={() => setEditing((current) => (current === block.ref ? "" : block.ref))}>{editing === block.ref ? "Close" : "Edit"}</button>
                  </div>
                </div>
                {editing === block.ref && (
                  <RowEditor
                    fields={PRODUCTION_FIELDS}
                    row={block}
                    busy={busy}
                    onCancel={() => setEditing("")}
                    onSave={(row) => void saveRow("production", doc.production, row as ProductionBlock)}
                    onRemove={() => void saveRow("production", doc.production, block, true)}
                  />
                )}
              </li>
            ))}
          </ul>
          {editing === "new-block" && (
            <RowEditor fields={PRODUCTION_FIELDS} row={newBlock()} busy={busy} onCancel={() => setEditing("")} onSave={(row) => void saveRow("production", doc.production, row as ProductionBlock)} />
          )}
          {addButton("Add production block", "new-block")}
        </>
      )}

      {view === "vendors" && (
        <>
          {doc.vendors.length === 0 && editing !== "new-vendor" && <p className={styles.budgetEmpty}>No vendors on the call sheet yet. Add each vendor&rsquo;s on-site lead, arrival and departure.</p>}
          <ul className={`${styles.checklistRows} ${styles.timelineRows}`}>
            {[...doc.vendors].sort((a, b) => dayMinutes(a.arrival) - dayMinutes(b.arrival)).map((vendor) => (
              <li key={vendor.ref}>
                <div className={styles.timelineRow}>
                  <time><b>{vendor.arrival ? formatTime(vendor.arrival) : "—"}</b>{vendor.departure && <small>out {formatTime(vendor.departure)}</small>}</time>
                  <div className={styles.checklistText}>
                    <strong>{vendor.company} <em className={styles.checklistTag}>{vendor.type}</em></strong>
                    <small>
                      {vendor.lead || "No on-site lead yet"}
                      {vendor.mobile && <> · <a href={`tel:${vendor.mobile}`}>{vendor.mobile}</a></>}
                      {vendor.setup_location && ` · ${vendor.setup_location}`}
                    </small>
                  </div>
                  <div className={styles.timelineRowEnd}>
                    <button type="button" onClick={() => setEditing((current) => (current === vendor.ref ? "" : vendor.ref))}>{editing === vendor.ref ? "Close" : "Edit"}</button>
                  </div>
                </div>
                {editing === vendor.ref && (
                  <RowEditor
                    fields={VENDOR_FIELDS}
                    row={vendor}
                    busy={busy}
                    onCancel={() => setEditing("")}
                    onSave={(row) => void saveRow("vendors", doc.vendors, row as TimelineVendor)}
                    onRemove={() => void saveRow("vendors", doc.vendors, vendor, true)}
                  />
                )}
              </li>
            ))}
          </ul>
          {editing === "new-vendor" && (
            <RowEditor fields={VENDOR_FIELDS} row={newVendor()} busy={busy} onCancel={() => setEditing("")} onSave={(row) => void saveRow("vendors", doc.vendors, row as TimelineVendor)} />
          )}
          {addButton("Add vendor", "new-vendor")}
        </>
      )}

      {view === "crew" && (
        <>
          {doc.crew.length === 0 && editing !== "new-crew" && <p className={styles.budgetEmpty}>No crew yet. Add LVD&rsquo;s own team for the day: role, call time, out time, and phone.</p>}
          <ul className={`${styles.checklistRows} ${styles.timelineRows}`}>
            {[...doc.crew].sort((a, b) => dayMinutes(a.call_time) - dayMinutes(b.call_time)).map((member) => (
              <li key={member.ref}>
                <div className={styles.timelineRow}>
                  <time><b>{member.call_time ? formatTime(member.call_time) : "—"}</b>{member.out_time && <small>out {formatTime(member.out_time)}</small>}</time>
                  <div className={styles.checklistText}>
                    <strong>{member.name}</strong>
                    <small>
                      {member.role || "No role set"}
                      {member.mobile && <> · <a href={`tel:${member.mobile}`}>{member.mobile}</a></>}
                      {member.meal && ` · Meal: ${member.meal}`}
                    </small>
                  </div>
                  <div className={styles.timelineRowEnd}>
                    <button type="button" onClick={() => setEditing((current) => (current === member.ref ? "" : member.ref))}>{editing === member.ref ? "Close" : "Edit"}</button>
                  </div>
                </div>
                {editing === member.ref && (
                  <RowEditor
                    fields={CREW_FIELDS}
                    row={member}
                    busy={busy}
                    onCancel={() => setEditing("")}
                    onSave={(row) => void saveRow("crew", doc.crew, row as CrewMember)}
                    onRemove={() => void saveRow("crew", doc.crew, member, true)}
                  />
                )}
              </li>
            ))}
          </ul>
          {editing === "new-crew" && (
            <RowEditor fields={CREW_FIELDS} row={newCrew()} busy={busy} onCancel={() => setEditing("")} onSave={(row) => void saveRow("crew", doc.crew, row as CrewMember)} />
          )}
          {addButton("Add crew member", "new-crew")}
        </>
      )}

      {view === "overview" && (
        <form
          className={`${styles.checklistEditor} ${styles.timelineEditor} ${styles.timelineOverview}`}
          key={doc.updated_at ?? "starter"}
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            void save("overview", Object.fromEntries(OVERVIEW_FIELDS.map((field) => [field, String(data.get(field) ?? "")])));
          }}
        >
          {OVERVIEW_FIELDS.map((field) => (
            <label key={field} className={field.startsWith("Venue Systems") ? styles.timelineWide : undefined}>
              <span>{field}</span>
              {field.startsWith("Venue Systems")
                ? <textarea name={field} rows={3} defaultValue={doc.overview[field] ?? ""} />
                : <input name={field} defaultValue={doc.overview[field] ?? ""} />}
            </label>
          ))}
          <div className={`${styles.uploadActions} ${styles.timelineWide}`}>
            <p>The command facts for the day. These head the print brief.</p>
            <button type="submit" disabled={busy}>{busy ? "Saving…" : "Save overview"}</button>
          </div>
        </form>
      )}

      {view === "brief" && (
        <div className={styles.timelineBrief}>
          <div className={styles.timelineBriefActions}>
            <p>Built from the overview, the Critical cues, the call sheet, and the crew. It always matches the timeline.</p>
            <button type="button" className={styles.budgetSecondary} onClick={() => window.print()}>Print</button>
          </div>
          <article className={styles.timelinePrint}>
            <header>
              <p>Lady Victoria Designs · Event-Day Command Brief · Version {doc.version}</p>
              <h3>{doc.overview["Couple / Client"] || "Celebration"}</h3>
            </header>
            <dl>
              {OVERVIEW_FIELDS.filter((field) => field !== "Couple / Client" && doc.overview[field]).map((field) => (
                <div key={field}><dt>{field}</dt><dd>{doc.overview[field]}</dd></div>
              ))}
            </dl>
            <h4>Critical cues</h4>
            <table>
              <tbody>
                {critical.map((cue) => <tr key={cue.ref}><th>{formatTime(cue.start)}</th><td>{cue.activity}</td><td>{cue.owner}</td></tr>)}
              </tbody>
            </table>
            {doc.vendors.length > 0 && (
              <>
                <h4>Vendor contacts</h4>
                <table>
                  <tbody>
                    {doc.vendors.map((vendor) => <tr key={vendor.ref}><th>{vendor.company}</th><td>{vendor.lead}</td><td>{vendor.mobile}</td></tr>)}
                  </tbody>
                </table>
              </>
            )}
            {doc.crew.length > 0 && (
              <>
                <h4>LVD crew</h4>
                <table>
                  <tbody>
                    {doc.crew.map((member) => <tr key={member.ref}><th>{member.name}</th><td>{member.role}</td><td>{member.mobile}</td></tr>)}
                  </tbody>
                </table>
              </>
            )}
          </article>
        </div>
      )}
    </section>
  );
}
