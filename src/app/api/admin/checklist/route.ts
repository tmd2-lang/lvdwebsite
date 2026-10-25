import { NextResponse } from "next/server";
import { canManageClientPortal, getAdminUser } from "@/lib/admin-auth";
import { getClientById } from "@/lib/client-data";
import { saveChecklistItem } from "@/lib/checklist-data";
import { isChecklistOwner, isChecklistStatus, isChecklistTaskId } from "@/lib/checklist-view";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Owners and planners both run the checklist, same as the task list.
export async function PATCH(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });
  if (!canManageClientPortal(user)) return NextResponse.json({ error: "Your account does not have client-portal access." }, { status: 403 });

  try {
    const body = (await request.json()) as {
      clientId?: unknown; taskId?: unknown; status?: unknown; owner?: unknown; dueOn?: unknown; notes?: unknown;
    };

    if (!isChecklistTaskId(body.taskId)) return NextResponse.json({ error: "Which task?" }, { status: 400 });
    if (body.status !== undefined && !isChecklistStatus(body.status)) {
      return NextResponse.json({ error: "That status is not on the list." }, { status: 400 });
    }
    if (body.owner !== undefined && body.owner !== null && !isChecklistOwner(body.owner)) {
      return NextResponse.json({ error: "That owner is not on the list." }, { status: 400 });
    }
    if (typeof body.notes === "string" && body.notes.length > 2000) {
      return NextResponse.json({ error: "Keep notes under 2,000 characters." }, { status: 400 });
    }

    const client = await getClientById(typeof body.clientId === "string" ? body.clientId : "");
    if (!client) return NextResponse.json({ error: "That celebration no longer exists." }, { status: 404 });

    const item = await saveChecklistItem({
      clientId: client.id,
      taskId: body.taskId,
      status: body.status,
      owner: body.owner === undefined ? undefined : (body.owner as string | null),
      dueOn: body.dueOn === undefined
        ? undefined
        : typeof body.dueOn === "string" && DATE_PATTERN.test(body.dueOn) ? body.dueOn : null,
      notes: typeof body.notes === "string" ? body.notes : body.notes === null ? null : undefined,
      by: user.email,
    });

    return NextResponse.json({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save that task.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
