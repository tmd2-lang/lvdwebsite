/**
 * The parts of the task list that are safe in the browser.
 *
 * `task-data.ts` talks to the database with the service-role key and must stay
 * on the server. Client components import from here instead.
 */

export const TASK_OWNERS = ["client", "studio"] as const;
export type TaskOwner = (typeof TASK_OWNERS)[number];

export const TASK_OWNER_LABELS: Record<TaskOwner, string> = {
  client: "The couple",
  studio: "The studio",
};

export type ClientTask = {
  id: string;
  created_at: string;
  updated_at: string;
  client_id: string;
  title: string;
  note: string | null;
  due_on: string | null;
  owner: TaskOwner;
  /** Null means outstanding. Set means done. */
  completed_at: string | null;
  completed_by: string | null;
  position: number;
  created_by: string | null;
};

export function isTaskOwner(value: unknown): value is TaskOwner {
  return typeof value === "string" && (TASK_OWNERS as readonly string[]).includes(value);
}

export function isDone(task: ClientTask) {
  return task.completed_at !== null;
}

/** A date with no time attached, read as a plain calendar day. */
export function formatDueDate(due: string | null) {
  if (!due) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${due}T00:00:00Z`));
}

/** Days until a task is due. Negative means it has slipped. */
export function daysUntilDue(due: string | null) {
  if (!due) return null;
  const today = new Date();
  const midnightUtcToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const dueUtc = new Date(`${due}T00:00:00Z`).getTime();
  return Math.round((dueUtc - midnightUtcToday) / 86_400_000);
}

/** Short human label for how a task's deadline is going. */
export function dueLabel(task: ClientTask) {
  if (isDone(task)) return "Done";
  const days = daysUntilDue(task.due_on);
  if (days === null) return "No date";
  if (days < 0) return `${Math.abs(days)} ${Math.abs(days) === 1 ? "day" : "days"} late`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due ${formatDueDate(task.due_on)}`;
}

/** Outstanding first, then by date, undated last. Done items sink. */
export function sortTasks(tasks: ClientTask[]): ClientTask[] {
  return [...tasks].sort((a, b) => {
    if (isDone(a) !== isDone(b)) return isDone(a) ? 1 : -1;
    if (a.due_on && b.due_on && a.due_on !== b.due_on) return a.due_on < b.due_on ? -1 : 1;
    if (a.due_on && !b.due_on) return -1;
    if (!a.due_on && b.due_on) return 1;
    if (a.position !== b.position) return a.position - b.position;
    return a.created_at < b.created_at ? -1 : 1;
  });
}
