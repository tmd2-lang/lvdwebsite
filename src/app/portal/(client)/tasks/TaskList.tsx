"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { dueLabel, isDone, sortTasks, type ClientTask } from "@/lib/task-view";
import styles from "../../portal.module.css";

export default function TaskList({ tasks }: { tasks: ClientTask[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState<string>("");

  const ordered = sortTasks(tasks);
  const yours = ordered.filter((task) => task.owner === "client");
  const studio = ordered.filter((task) => task.owner === "studio");
  const left = yours.filter((task) => !isDone(task)).length;

  async function toggle(task: ClientTask) {
    setError("");
    setPending(task.id);
    try {
      const response = await fetch("/api/portal/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, done: !isDone(task) }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn’t update that.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn’t update that.");
    } finally {
      setPending("");
    }
  }

  if (tasks.length === 0) {
    return (
      <div className={styles.documentEmpty}>
        <h2>Nothing to do yet.</h2>
        <p>When we need something from you it will appear here, so nothing gets lost in email.</p>
      </div>
    );
  }

  return (
    <>
      {error && <p className={styles.loginError} role="alert">{error}</p>}

      <section className={`${styles.panel} ${styles.portalTaskPanel}`}>
        <div className={styles.panelHeading}>
          <h2>For You</h2>
          <span>{left === 0 ? "All done" : `${left} to go`}</span>
        </div>
        {yours.length === 0 ? (
          <p className={styles.panelEmpty}>Nothing on your plate right now.</p>
        ) : (
          <ul className={styles.portalTaskRows}>
            {yours.map((task) => (
              <li key={task.id} className={isDone(task) ? styles.portalTaskDone : undefined}>
                <label>
                  <input
                    type="checkbox"
                    checked={isDone(task)}
                    disabled={pending === task.id}
                    onChange={() => void toggle(task)}
                  />
                  <span>
                    <strong>{task.title}</strong>
                    <small>{dueLabel(task)}{task.note ? ` · ${task.note}` : ""}</small>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>

      {studio.length > 0 && (
        <section className={`${styles.panel} ${styles.portalTaskPanel}`}>
          <div className={styles.panelHeading}>
            <h2>With the Studio</h2>
            <span>We&rsquo;re on these</span>
          </div>
          {/* Shown so the couple can see progress, but not theirs to tick. */}
          <ul className={styles.portalTaskRows}>
            {studio.map((task) => (
              <li key={task.id} className={isDone(task) ? styles.portalTaskDone : undefined}>
                <span className={styles.portalTaskStatic}>
                  <b aria-hidden="true">{isDone(task) ? "✓" : "·"}</b>
                  <span>
                    <strong>{task.title}</strong>
                    <small>{dueLabel(task)}{task.note ? ` · ${task.note}` : ""}</small>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
