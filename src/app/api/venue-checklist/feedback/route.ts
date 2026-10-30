import { NextResponse } from "next/server";
import { recordChecklistComment, recordChecklistFeedback, validFeedbackToken, type ChecklistFeedback } from "@/lib/checklist-emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Saves the answer to Email 2's "Was the checklist useful?" for the feedback page
 * (/venue-checklist/feedback). A body of { comment } saves "what was missing" instead.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { id?: string; a?: string; t?: string; comment?: string };
  const { id = "", a, t = "" } = body;
  if (!id || (a !== "yes" && a !== "no") || !validFeedbackToken(id, t)) {
    return NextResponse.json({ error: "Link not recognized." }, { status: 400 });
  }
  const comment = typeof body.comment === "string" ? body.comment.trim().slice(0, 2000) : "";
  const saved = comment
    ? await recordChecklistComment(id, comment).catch(() => false)
    : await recordChecklistFeedback(id, a as ChecklistFeedback).catch(() => false);
  if (!saved) return NextResponse.json({ error: "That could not be saved." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
