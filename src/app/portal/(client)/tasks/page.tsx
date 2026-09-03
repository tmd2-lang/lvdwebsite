import { redirect } from "next/navigation";
import { getPortalSession } from "@/lib/portal-auth";
import { getTasksForClient } from "@/lib/task-data";
import TaskList from "./TaskList";
import styles from "../../portal.module.css";

export const dynamic = "force-dynamic";

export default async function PortalTasksPage() {
  const session = await getPortalSession();
  if (!session) redirect("/portal/login");

  const tasks = await getTasksForClient(session.client.id).catch(() => []);

  return (
    <div className={styles.content}>
      <header className={styles.sectionHero}>
        <div>
          <p className={styles.eyebrow}>Your list</p>
          <h1>What&rsquo;s <em>next.</em></h1>
        </div>
        <p>The things we need from you, and the things we owe you, in one place.</p>
      </header>

      <TaskList tasks={tasks} />
    </div>
  );
}
