"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import {
  CHECKLIST_OWNERS,
  CHECKLIST_PHASES,
  CHECKLIST_STATUSES,
  CHECKLIST_STATUS_LABELS,
  CHECKLIST_TRACKS,
  daysUntil,
  effectiveDue,
  formatChecklistDate,
  isOpen,
  progressOf,
  type ChecklistItem,
  type ChecklistItemRow,
  type ChecklistStatus,
  type ChecklistTrack,
} from "@/lib/checklist-view";
import styles from "../../portal-admin.module.css";

type TrackFilter = "all" | ChecklistTrack;
type StatusFilter = "open" | "all" | ChecklistStatus;

const STATUS_CLASS: Partial<Record<ChecklistStatus, string>> = {
  in_progress: styles.checklistStatusProgress,
  waiting_client: styles.checklistStatusWaiting,
  waiting_vendor: styles.checklistStatusWaiting,
  at_risk: styles.checklistStatusRisk,
  complete: styles.checklistStatusDone,
  not_applicable: styles.checklistStatusNa,
};

function dueText(item: ChecklistItem) {
  const due = effectiveDue(item);
  if (!due) return item.timing;
  const suggested = !item.dueOn;
  const days = daysUntil(due);
  const date = formatChecklistDate(due);
  if (isOpen(item) && days !== null && days < 0) return `${date} · ${Math.abs(days)} ${Math.abs(days) === 1 ? "day" : "days"} late`;
  return suggested ? `${date} (suggested)` : date;
}

function isLate(item: ChecklistItem) {
  const days = daysUntil(effectiveDue(item));
  return isOpen(item) && days !== null && days < 0;
}

export default function ChecklistPanel({
  clientId,
  eventDate,
  initialItems,
  loadError,
}: {
  clientId: string;
  eventDate: string | null;
  initialItems: ChecklistItem[];
  loadError?: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [track, setTrack] = useState<TrackFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState("");
  const [saving, setSaving] = useState("");
  const [error, setError] = useState(loadError || "");

  const overall = progressOf(items);
  const trackProgress = CHECKLIST_TRACKS.map((name) => ({ name, ...progressOf(items.filter((item) => item.track === name)) }));
  const late = items.filter(isLate).length;
  const awaitingCouple = items.filter((item) => isOpen(item) && (item.status === "waiting_client" || item.assignedOwner === "Client")).length;

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      if (track !== "all" && item.track !== track) return false;
      if (statusFilter === "open" && !isOpen(item)) return false;
      if (statusFilter !== "open" && statusFilter !== "all" && item.status !== statusFilter) return false;
      if (query && !`${item.id} ${item.task} ${item.category} ${item.assignedOwner} ${item.notes}`.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [items, track, statusFilter, search]);

  async function save(item: ChecklistItem, changes: { status?: ChecklistStatus; owner?: string | null; dueOn?: string | null; notes?: string }) {
    setSaving(item.id);
    setError("");
    try {
      const response = await fetch("/api/admin/checklist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // Status always travels with the change. A task's first save creates
        // its row, and without it a not-applicable task would reset to not started.
        body: JSON.stringify({ clientId, taskId: item.id, status: item.status, ...changes }),
      });
      const result = (await response.json().catch(() => ({}))) as { item?: ChecklistItemRow; error?: string };
      if (!response.ok || !result.item) throw new Error(result.error || "Could not save that task.");
      const row = result.item;
      setItems((current) => current.map((entry) => entry.id === item.id
        ? {
          ...entry,
          status: row.status,
          assignedOwner: row.owner || entry.owner,
          dueOn: row.due_on,
          notes: row.notes ?? "",
          updatedBy: row.updated_by,
          updatedAt: row.updated_at,
        }
        : entry));
      // Keep the page's copy current too, so switching tabs and back does
      // not reopen the checklist from before this save.
      router.refresh();
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save that task.");
      return false;
    } finally {
      setSaving("");
    }
  }

  async function saveDetails(event: FormEvent<HTMLFormElement>, item: ChecklistItem) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const owner = String(data.get("owner") || "");
    const dueOn = String(data.get("dueOn") || "") || null;
    const saved = await save(item, {
      owner: owner === item.owner ? null : owner,
      // Leaving the suggested date alone keeps it a suggestion, so it still
      // moves if the wedding date changes.
      dueOn: !item.dueOn && dueOn === item.suggestedDue ? null : dueOn,
      notes: String(data.get("notes") || ""),
    });
    if (saved) setEditing("");
  }

  return (
    <section className={styles.workspaceCard}>
      <div className={`${styles.workspaceCardHeader} ${styles.imageCardHeader}`}>
        <div><p className={styles.eyebrow}>Master planning checklist</p><h2>Planning Checklist</h2></div>
        <div className={styles.imageFilter}>
          {(["all", ...CHECKLIST_TRACKS] as TrackFilter[]).map((name) => (
            <button type="button" key={name} className={track === name ? styles.imageFilterActive : undefined} onClick={() => setTrack(name)}>
              {name === "all" ? "Both tracks" : name}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.checklistSummary}>
        <div>
          <span>Overall</span>
          <strong>{overall.percent}%</strong>
          <small>{overall.done} of {overall.total} tasks complete</small>
          <i className={styles.checklistBar}><b style={{ width: `${overall.percent}%` }} /></i>
        </div>
        {trackProgress.map((entry) => (
          <div key={entry.name}>
            <span>{entry.name}</span>
            <strong>{entry.total ? `${entry.percent}%` : "—"}</strong>
            <small>{entry.total ? `${entry.done} of ${entry.total} complete` : "Not booked"}</small>
            <i className={styles.checklistBar}><b style={{ width: `${entry.percent}%` }} /></i>
          </div>
        ))}
        <div>
          <span>Needs attention</span>
          <strong>{late}</strong>
          <small>{late === 1 ? "task" : "tasks"} past due · {awaitingCouple} with the couple</small>
        </div>
      </div>

      {!eventDate && (
        <p className={styles.checklistNotice}>Add the wedding date on this client to get suggested due dates for every task.</p>
      )}

      <div className={styles.checklistControls}>
        <input type="search" placeholder="Search tasks, owners, notes" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search the checklist" />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} aria-label="Filter by status">
          <option value="open">Still open</option>
          <option value="all">Every task</option>
          {CHECKLIST_STATUSES.map((status) => <option key={status} value={status}>{CHECKLIST_STATUS_LABELS[status]}</option>)}
        </select>
      </div>

      {error && <p className={styles.formError} role="alert">{error}</p>}

      {visible.length === 0 ? (
        <div className={styles.workspaceEmpty}>
          <span>✓</span>
          <h3>Nothing here.</h3>
          <p>No tasks match these filters. Try “Every task” to see the whole list.</p>
        </div>
      ) : CHECKLIST_PHASES.map((phase) => {
        const phaseItems = visible.filter((item) => item.phase === phase);
        if (phaseItems.length === 0) return null;
        const phaseProgress = progressOf(items.filter((item) => item.phase === phase && (track === "all" || item.track === track)));
        return (
          <section className={styles.checklistPhase} key={phase}>
            <header>
              <h3>{phase}</h3>
              <span>{phaseProgress.done}/{phaseProgress.total} · {phaseProgress.percent}%</span>
            </header>
            <ul className={styles.checklistRows}>
              {phaseItems.map((item) => (
                <li key={item.id} className={item.status === "complete" ? styles.taskDone : undefined}>
                  <div className={styles.checklistRow}>
                    <select
                      className={`${styles.checklistStatus} ${STATUS_CLASS[item.status] || ""}`}
                      value={item.status}
                      disabled={saving === item.id}
                      onChange={(event) => void save(item, { status: event.target.value as ChecklistStatus })}
                      aria-label={`Status for ${item.task}`}
                    >
                      {CHECKLIST_STATUSES.map((status) => <option key={status} value={status}>{CHECKLIST_STATUS_LABELS[status]}</option>)}
                    </select>
                    <div className={styles.checklistText}>
                      <strong>{item.task}</strong>
                      <small>
                        <span className={isLate(item) ? styles.checklistLate : undefined}>{dueText(item)}</span>
                        {" · "}{item.assignedOwner}{" · "}{item.category}
                        {item.track === "Design & Floral" && <em className={styles.checklistTag}>Design</em>}
                        {item.approval === "Yes" && <em className={styles.checklistTag}>Couple approves</em>}
                        {item.priority === "High" && <em className={styles.checklistTag}>High</em>}
                      </small>
                      {item.notes && editing !== item.id && <p className={styles.checklistNote}>{item.notes}</p>}
                    </div>
                    <button type="button" onClick={() => setEditing((current) => (current === item.id ? "" : item.id))} aria-expanded={editing === item.id}>
                      {editing === item.id ? "Close" : "Edit"}
                    </button>
                  </div>

                  {editing === item.id && (
                    <form className={styles.checklistEditor} onSubmit={(event) => void saveDetails(event, item)}>
                      <p>{item.id} · Timing: {item.timing}{item.dependency ? ` · Needs: ${item.dependency}` : ""}</p>
                      <div className={styles.uploadRow}>
                        <label>
                          <span>Owner</span>
                          <select name="owner" defaultValue={item.assignedOwner}>
                            {CHECKLIST_OWNERS.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
                          </select>
                        </label>
                        <label>
                          <span>Due{item.suggestedDue && !item.dueOn ? ` (suggested ${formatChecklistDate(item.suggestedDue)})` : ""}</span>
                          <input name="dueOn" type="date" defaultValue={item.dueOn ?? item.suggestedDue ?? ""} />
                        </label>
                      </div>
                      <label className={styles.checklistNotesField}>
                        <span>Studio notes (the couple never sees these)</span>
                        <textarea name="notes" rows={3} maxLength={2000} defaultValue={item.notes} />
                      </label>
                      <div className={styles.uploadActions}>
                        <p>{item.updatedBy ? `Last changed by ${item.updatedBy}` : "Not changed yet"}</p>
                        <button type="submit" disabled={saving === item.id}>{saving === item.id ? "Saving…" : "Save"}</button>
                      </div>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </section>
  );
}
