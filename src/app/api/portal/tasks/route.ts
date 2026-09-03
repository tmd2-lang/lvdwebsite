import { NextResponse } from "next/server";
import { getPortalSession } from "@/lib/portal-auth";
import { getTaskForClient, setTaskDone } from "@/lib/task-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The couple can tick a task off and untick it. That is all they can do: they
 * cannot create, edit, reword, or delete anything on their list.
 */
export async function PATCH(request: Request) {
  const session = await getPortalSession();
  if (!session) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });

  try {
    const body = (await request.json()) as { id?: unknown; done?: unknown };
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) return NextResponse.json({ error: "Which task?" }, { status: 400 });
    if (typeof body.done !== "boolean") {
      return NextResponse.json({ error: "Say whether it is done." }, { status: 400 });
    }

    // The ownership check is the query: a task id from another celebration
    // simply comes back empty.
    const task = await getTaskForClient(id, session.client.id);
    if (!task) return NextResponse.json({ error: "That task no longer exists." }, { status: 404 });

    await setTaskDone(id, body.done, session.client.display_name);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update that task.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
