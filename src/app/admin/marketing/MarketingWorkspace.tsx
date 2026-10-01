"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  MARKETING_CHANNELS,
  type MarketingChannel,
  type MarketingNote,
  type MarketingStat,
  type MarketingTodo,
} from "@/lib/marketing-data";
import styles from "./marketing.module.css";

const CHANNEL_CHOICES: { id: MarketingChannel; label: string }[] = [
  ...MARKETING_CHANNELS.map((channel) => ({ id: channel.id as MarketingChannel, label: channel.label })),
  { id: "general", label: "General" },
];

function channelLabel(id: MarketingChannel) {
  return CHANNEL_CHOICES.find((choice) => choice.id === id)?.label ?? "General";
}

async function api(method: string, body: Record<string, unknown>) {
  const response = await fetch("/api/admin/marketing", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Something went wrong.");
  return payload;
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York",
  }).format(new Date(value));
}

function longDay(day: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long", month: "long", day: "numeric", timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00Z`));
}

export default function MarketingWorkspace({
  todos: initialTodos, notes: initialNotes, stats: initialStats, today, setupError,
}: {
  todos: MarketingTodo[];
  notes: MarketingNote[];
  stats: MarketingStat[];
  today: string;
  setupError: string | null;
}) {
  const [todos, setTodos] = useState(initialTodos);
  const [notes, setNotes] = useState(initialNotes);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<MarketingChannel | "all">("all");

  const [todoTitle, setTodoTitle] = useState("");
  const [todoChannel, setTodoChannel] = useState<MarketingChannel>("general");
  const [noteBody, setNoteBody] = useState("");
  const [noteChannel, setNoteChannel] = useState<MarketingChannel>("general");

  const [day, setDay] = useState(today);
  const [statsLoading, setStatsLoading] = useState(false);
  const dayRequest = useRef(0);
  const [statText, setStatText] = useState<Record<string, string>>(
    Object.fromEntries(initialStats.map((stat) => [stat.channel, stat.body])),
  );
  const [statState, setStatState] = useState<Record<string, "saving" | "saved" | "error">>({});
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const visible = <T extends { channel: MarketingChannel }>(rows: T[]) =>
    filter === "all" ? rows : rows.filter((row) => row.channel === filter);
  const openTodos = visible(todos).filter((todo) => !todo.completed_at);
  const doneTodos = visible(todos).filter((todo) => todo.completed_at);

  async function run(action: () => Promise<void>) {
    setError(null);
    try {
      await action();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    }
  }

  function addTodo(event: React.FormEvent) {
    event.preventDefault();
    const title = todoTitle.trim();
    if (!title) return;
    void run(async () => {
      const { todo } = await api("POST", { kind: "todo", title, channel: todoChannel });
      setTodos((current) => [todo, ...current]);
      setTodoTitle("");
    });
  }

  function toggleTodo(todo: MarketingTodo) {
    const done = !todo.completed_at;
    const completed_at = done ? new Date().toISOString() : null;
    setTodos((current) => current.map((item) => (item.id === todo.id ? { ...item, completed_at } : item)));
    void run(async () => {
      try {
        await api("PATCH", { id: todo.id, done });
      } catch (caught) {
        setTodos((current) => current.map((item) => (item.id === todo.id ? todo : item)));
        throw caught;
      }
    });
  }

  function removeTodo(id: string) {
    void run(async () => {
      await api("DELETE", { kind: "todo", id });
      setTodos((current) => current.filter((todo) => todo.id !== id));
    });
  }

  function addNote(event: React.FormEvent) {
    event.preventDefault();
    const body = noteBody.trim();
    if (!body) return;
    void run(async () => {
      const { note } = await api("POST", { kind: "note", body, channel: noteChannel });
      setNotes((current) => [note, ...current]);
      setNoteBody("");
    });
  }

  function removeNote(id: string) {
    if (!window.confirm("Delete this note?")) return;
    void run(async () => {
      await api("DELETE", { kind: "note", id });
      setNotes((current) => current.filter((note) => note.id !== id));
    });
  }

  function shiftDay(days: number) {
    const date = new Date(`${day}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    void openDay(date.toISOString().slice(0, 10));
  }

  async function openDay(next: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(next) || next === day) return;
    const request = ++dayRequest.current;
    setDay(next);
    setStatsLoading(true);
    setStatState({});
    setError(null);
    try {
      const response = await fetch(`/api/admin/marketing?day=${next}`);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Could not load that day.");
      if (request !== dayRequest.current) return;
      setStatText(Object.fromEntries((payload.stats as MarketingStat[]).map((stat) => [stat.channel, stat.body])));
    } catch (caught) {
      if (request !== dayRequest.current) return;
      // Never show an empty box that looks like a blank day when the load failed.
      setStatText({});
      setError(caught instanceof Error ? caught.message : "Could not load that day.");
    } finally {
      if (request === dayRequest.current) setStatsLoading(false);
    }
  }

  // Stats save on their own a moment after you stop typing.
  function changeStat(channel: MarketingChannel, value: string) {
    const savingDay = day;
    setStatText((current) => ({ ...current, [channel]: value }));
    setStatState((current) => ({ ...current, [channel]: "saving" }));
    const timerKey = `${savingDay}:${channel}`;
    clearTimeout(saveTimers.current[timerKey]);
    saveTimers.current[timerKey] = setTimeout(async () => {
      try {
        await api("POST", { kind: "stat", day: savingDay, channel, body: value });
        setStatState((current) => ({ ...current, [channel]: "saved" }));
      } catch {
        setStatState((current) => ({ ...current, [channel]: "error" }));
      }
    }, 800);
  }

  const statusText = { saving: "Saving…", saved: "Saved", error: "Not saved — check your connection" };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Marketing</p>
          <h1>{longDay(today)}</h1>
        </div>
        <Link href="/admin" className={styles.back}>← Studio home</Link>
      </header>

      {setupError && <p className={styles.error} role="alert">{setupError}</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}

      <nav className={styles.filters} aria-label="Filter by channel">
        {[{ id: "all" as const, label: "Everything" }, ...CHANNEL_CHOICES].map((choice) => (
          <button
            key={choice.id}
            type="button"
            className={filter === choice.id ? styles.filterActive : undefined}
            aria-pressed={filter === choice.id}
            onClick={() => setFilter(choice.id)}
          >
            {choice.label}
          </button>
        ))}
      </nav>

      <div className={styles.grid}>
        <section className={styles.card} aria-labelledby="todos-heading">
          <h2 id="todos-heading">To-dos <span>{openTodos.length} open</span></h2>
          <form className={styles.addRow} onSubmit={addTodo}>
            <input
              value={todoTitle}
              onChange={(event) => setTodoTitle(event.target.value)}
              placeholder="Add a to-do"
              aria-label="New to-do"
              maxLength={300}
            />
            <select value={todoChannel} onChange={(event) => setTodoChannel(event.target.value as MarketingChannel)} aria-label="Channel">
              {CHANNEL_CHOICES.map((choice) => <option key={choice.id} value={choice.id}>{choice.label}</option>)}
            </select>
            <button type="submit" disabled={!todoTitle.trim()}>Add</button>
          </form>
          <ul className={styles.list}>
            {openTodos.map((todo) => (
              <li key={todo.id}>
                <label>
                  <input type="checkbox" checked={false} onChange={() => toggleTodo(todo)} />
                  <span>{todo.title}</span>
                </label>
                <em>{channelLabel(todo.channel)}</em>
                <button type="button" className={styles.remove} onClick={() => removeTodo(todo.id)} aria-label={`Delete ${todo.title}`}>×</button>
              </li>
            ))}
            {openTodos.length === 0 && <li className={styles.empty}>Nothing open. Nice.</li>}
          </ul>
          {doneTodos.length > 0 && (
            <details className={styles.done}>
              <summary>Done ({doneTodos.length})</summary>
              <ul className={styles.list}>
                {doneTodos.map((todo) => (
                  <li key={todo.id} className={styles.checked}>
                    <label>
                      <input type="checkbox" checked onChange={() => toggleTodo(todo)} />
                      <span>{todo.title}</span>
                    </label>
                    <em>{channelLabel(todo.channel)}</em>
                    <button type="button" className={styles.remove} onClick={() => removeTodo(todo.id)} aria-label={`Delete ${todo.title}`}>×</button>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>

        <section className={styles.card} aria-labelledby="stats-heading">
          <h2 id="stats-heading">{day === today ? "Today\u2019s stats" : "Stats"} <span>saves as you type</span></h2>
          <div className={styles.dayPicker}>
            <button type="button" onClick={() => shiftDay(-1)} aria-label="Previous day">←</button>
            <input
              type="date"
              value={day}
              max={today}
              onChange={(event) => void openDay(event.target.value)}
              aria-label="Stats day"
            />
            <button type="button" onClick={() => shiftDay(1)} disabled={day >= today} aria-label="Next day">→</button>
            {day !== today && <button type="button" onClick={() => void openDay(today)}>Today</button>}
          </div>
          {day !== today && <p className={styles.dayNote}>{longDay(day)}</p>}
          {MARKETING_CHANNELS.filter((channel) => filter === "all" || filter === channel.id).map((channel) => (
            <div className={styles.stat} key={channel.id}>
              <label htmlFor={`stat-${channel.id}`}>{channel.label}</label>
              <textarea
                id={`stat-${channel.id}`}
                rows={3}
                value={statText[channel.id] ?? ""}
                disabled={statsLoading}
                onChange={(event) => changeStat(channel.id, event.target.value)}
                placeholder="Spend, clicks, leads, anything…"
                maxLength={10000}
              />
              <small className={statState[channel.id] === "error" ? styles.errorText : undefined}>
                {statState[channel.id] ? statusText[statState[channel.id]] : ""}
              </small>
            </div>
          ))}
          {filter === "general" && <p className={styles.empty}>Stats are kept per ad channel.</p>}
        </section>

        <section className={`${styles.card} ${styles.wide}`} aria-labelledby="notes-heading">
          <h2 id="notes-heading">Notes</h2>
          <form className={styles.noteForm} onSubmit={addNote}>
            <textarea
              value={noteBody}
              onChange={(event) => setNoteBody(event.target.value)}
              placeholder="Throw a thought in here"
              aria-label="New note"
              rows={3}
              maxLength={10000}
            />
            <div>
              <select value={noteChannel} onChange={(event) => setNoteChannel(event.target.value as MarketingChannel)} aria-label="Channel">
                {CHANNEL_CHOICES.map((choice) => <option key={choice.id} value={choice.id}>{choice.label}</option>)}
              </select>
              <button type="submit" disabled={!noteBody.trim()}>Save note</button>
            </div>
          </form>
          <ul className={styles.notes}>
            {visible(notes).map((note) => (
              <li key={note.id}>
                <p>{note.body}</p>
                <footer>
                  <span>{channelLabel(note.channel)} · {shortDate(note.created_at)}</span>
                  <button type="button" onClick={() => removeNote(note.id)}>Delete</button>
                </footer>
              </li>
            ))}
            {visible(notes).length === 0 && <li className={styles.empty}>No notes yet.</li>}
          </ul>
        </section>
      </div>
    </main>
  );
}
