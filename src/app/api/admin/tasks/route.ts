import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getClientById } from "@/lib/client-data";
import { createTask, deleteTask, setTaskDone, updateTask } from "@/lib/task-data";
import { isTaskOwner } from "@/lib/task-view";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Owners and planners both run client portals. Tanah writes the task lists,
// so this deliberately does not check for owner.
export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });

  try {
    const body = (await request.json()) as {
      clientId?: unknown; title?: unknown; note?: unknown; dueOn?: unknown; owner?: unknown;
    };

    const clientId = typeof body.clientId === "string" ? body.clientId : "";
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) return NextResponse.json({ error: "Give the task a name." }, { status: 400 });
    if (title.length > 200) return NextResponse.json({ error: "Keep the task name under 200 characters." }, { status: 400 });

    const client = await getClientById(clientId);
    if (!client) return NextResponse.json({ error: "That celebration no longer exists." }, { status: 404 });

    const owner = isTaskOwner(body.owner) ? body.owner : "client";
    const dueOn = typeof body.dueOn === "string" && DATE_PATTERN.test(body.dueOn) ? body.dueOn : null;

    const task = await createTask({
      clientId: client.id,
      title,
      note: typeof body.note === "string" ? body.note : "",
      dueOn,
      owner,
      createdBy: user.email,
    });

    return NextResponse.json({ task });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not add that task.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });

  try {
    const body = (await request.json()) as {
      id?: unknown; done?: unknown; title?: unknown; note?: unknown; dueOn?: unknown; owner?: unknown;
    };
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) return NextResponse.json({ error: "Which task?" }, { status: 400 });

    if (typeof body.done === "boolean") {
      await setTaskDone(id, body.done, user.email);
      return NextResponse.json({ ok: true });
    }

    const title = typeof body.title === "string" ? body.title.trim() : undefined;
    if (title !== undefined && !title) {
      return NextResponse.json({ error: "Give the task a name." }, { status: 400 });
    }

    await updateTask(id, {
      title,
      note: typeof body.note === "string" ? body.note : undefined,
      dueOn: typeof body.dueOn === "string"
        ? (DATE_PATTERN.test(body.dueOn) ? body.dueOn : null)
        : body.dueOn === null ? null : undefined,
      owner: isTaskOwner(body.owner) ? body.owner : undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update that task.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id") || "";
    if (!id) return NextResponse.json({ error: "Which task?" }, { status: 400 });

    await deleteTask(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not remove that task.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
