import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import {
  createNote, createTodo, deleteNote, deleteTodo, getStatsForDay, isMarketingChannel, saveStat, setTodoDone,
} from "@/lib/marketing-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// One route for the whole marketing workspace. `kind` says which list.
// Owner-only: planners and inquiry staff have no business here.
async function ownerOnly() {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });
  if (user.role !== "owner") return NextResponse.json({ error: "This workspace is for the owner only." }, { status: 403 });
  return null;
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: Request) {
  const denied = await ownerOnly();
  if (denied) return denied;

  const day = new URL(request.url).searchParams.get("day") || "";
  if (!DATE_PATTERN.test(day)) return NextResponse.json({ error: "Which day?" }, { status: 400 });
  try {
    return NextResponse.json({ stats: await getStatsForDay(day) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Something went wrong." }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const denied = await ownerOnly();
  if (denied) return denied;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const channel = isMarketingChannel(body.channel) ? body.channel : "general";

    if (body.kind === "todo") {
      const title = text(body.title);
      if (!title) return NextResponse.json({ error: "Write the to-do first." }, { status: 400 });
      if (title.length > 300) return NextResponse.json({ error: "Keep the to-do under 300 characters." }, { status: 400 });
      return NextResponse.json({ todo: await createTodo(title, channel) });
    }

    if (body.kind === "note") {
      const note = text(body.body);
      if (!note) return NextResponse.json({ error: "Write the note first." }, { status: 400 });
      if (note.length > 10000) return NextResponse.json({ error: "That note is too long." }, { status: 400 });
      return NextResponse.json({ note: await createNote(note, channel) });
    }

    if (body.kind === "stat") {
      const day = text(body.day);
      if (!DATE_PATTERN.test(day)) return NextResponse.json({ error: "Which day?" }, { status: 400 });
      if (!isMarketingChannel(body.channel)) return NextResponse.json({ error: "Which channel?" }, { status: 400 });
      const stats = typeof body.body === "string" ? body.body : "";
      if (stats.length > 10000) return NextResponse.json({ error: "That is too long." }, { status: 400 });
      await saveStat(day, body.channel, stats);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown request." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Something went wrong." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const denied = await ownerOnly();
  if (denied) return denied;

  try {
    const body = (await request.json()) as { id?: unknown; done?: unknown };
    const id = text(body.id);
    if (!id || typeof body.done !== "boolean") return NextResponse.json({ error: "Which to-do?" }, { status: 400 });
    await setTodoDone(id, body.done);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Something went wrong." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const denied = await ownerOnly();
  if (denied) return denied;

  try {
    const body = (await request.json()) as { kind?: unknown; id?: unknown };
    const id = text(body.id);
    if (!id) return NextResponse.json({ error: "Which one?" }, { status: 400 });
    if (body.kind === "todo") await deleteTodo(id);
    else if (body.kind === "note") await deleteNote(id);
    else return NextResponse.json({ error: "Unknown request." }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Something went wrong." }, { status: 400 });
  }
}
