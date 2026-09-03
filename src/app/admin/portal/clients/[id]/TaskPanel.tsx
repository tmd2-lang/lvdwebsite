"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  TASK_OWNERS,
  TASK_OWNER_LABELS,
  dueLabel,
  isDone,
  sortTasks,
  type ClientTask,
  type TaskOwner,
} from "@/lib/task-view";
import styles from "../../portal-admin.module.css";

export default function TaskPanel({
  clientId,
  tasks,
}: {
  clientId: string;
  tasks: ClientTask[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState("");
  const [showDone, setShowDone] = useState(false);

  const ordered = sortTasks(tasks);
  const outstanding = ordered.filter((task) => !isDone(task));
  const done = ordered.filter(isDone);
  const shown = showDone ? done : outstanding;

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") || "").trim();
    if (!title) {
      setError("Give the task a name.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          title,
          note: String(data.get("note") || ""),
          dueOn: String(data.get("dueOn") || "") || null,
          owner: String(data.get("owner") || "client"),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not add that task.");
      form.reset();
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not add that task.");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(task: ClientTask) {
    setError("");
    try {
      const response = await fetch("/api/admin/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, done: !isDone(task) }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not update that task.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update that task.");
    }
  }

  async function remove(task: ClientTask) {
    if (confirming !== task.id) {
      setConfirming(task.id);
      return;
    }
    setConfirming("");
    setError("");
    try {
      const response = await fetch(`/api/admin/tasks?id=${encodeURIComponent(task.id)}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not remove that task.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not remove that task.");
    }
  }

  return (
    <section className={styles.workspaceCard}>
      <div className={`${styles.workspaceCardHeader} ${styles.imageCardHeader}`}>
        <div><p className={styles.eyebrow}>Planning list</p><h2>Tasks</h2></div>
        <div className={styles.imageFilter}>
          <button type="button" className={!showDone ? styles.imageFilterActive : undefined} onClick={() => setShowDone(false)}>
            To do ({outstanding.length})
          </button>
          <button type="button" className={showDone ? styles.imageFilterActive : undefined} onClick={() => setShowDone(true)}>
            Done ({done.length})
          </button>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className={styles.workspaceEmpty}>
          <span>＋</span>
          <h3>{showDone ? "Nothing finished yet." : "No tasks yet."}</h3>
          <p>Add what the couple needs to do, and what you owe them.</p>
        </div>
      ) : (
        <ul className={styles.taskRows}>
          {shown.map((task) => (
            <li key={task.id} className={isDone(task) ? styles.taskDone : undefined}>
              <label>
                <input type="checkbox" checked={isDone(task)} onChange={() => void toggle(task)} />
                <span>
                  <strong>{task.title}</strong>
                  <small>
                    {TASK_OWNER_LABELS[task.owner]} · {dueLabel(task)}
                    {task.note ? ` · ${task.note}` : ""}
                    {task.completed_by ? ` · ticked by ${task.completed_by}` : ""}
                  </small>
                </span>
              </label>
              <button
                type="button"
                className={confirming === task.id ? styles.imageConfirm : undefined}
                onClick={() => void remove(task)}
                onBlur={() => setConfirming((current) => (current === task.id ? "" : current))}
                aria-label={confirming === task.id ? `Confirm removing ${task.title}` : `Remove ${task.title}`}
              >
                {confirming === task.id ? "Tap again" : "Remove"}
              </button>
            </li>
          ))}
        </ul>
      )}

      <form className={styles.uploadForm} onSubmit={(event) => void add(event)}>
        <div className={styles.uploadRow}>
          <label>
            <span>Task</span>
            <input name="title" placeholder="Send your guest list" required maxLength={200} disabled={busy} />
          </label>
          <label>
            <span>Waiting on</span>
            <select name="owner" defaultValue="client" disabled={busy}>
              {TASK_OWNERS.map((owner) => (
                <option key={owner} value={owner}>{TASK_OWNER_LABELS[owner as TaskOwner]}</option>
              ))}
            </select>
          </label>
        </div>
        <div className={styles.uploadRow}>
          <label>
            <span>Note</span>
            <input name="note" placeholder="Optional" disabled={busy} />
          </label>
          <label>
            <span>Due</span>
            <input name="dueOn" type="date" disabled={busy} />
          </label>
        </div>
        <div className={styles.uploadActions}>
          <p>The couple sees this list in their portal and can tick things off.</p>
          <button type="submit" disabled={busy}>{busy ? "Adding…" : "Add task"}</button>
        </div>
        {error && <p className={styles.formError} role="alert">{error}</p>}
      </form>
    </section>
  );
}
