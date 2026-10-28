import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { importPlatformStats, setPlatformTag } from "@/lib/marketing-data";
import { isIsoDate, type ParsedAdRow } from "@/lib/platform-stats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ROWS = 500;

// Imported ad numbers are owner-only, like the rest of the marketing workspace.
async function ownerOnly() {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });
  if (user.role !== "owner") return NextResponse.json({ error: "This workspace is for the owner only." }, { status: 403 });
  return null;
}

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function count(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 2_000_000_000 ? value : null;
}

function cleanRows(value: unknown): ParsedAdRow[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_ROWS) return null;
  const rows: ParsedAdRow[] = [];
  for (const item of value as Record<string, unknown>[]) {
    const spend = typeof item.spend === "number" && Number.isFinite(item.spend) && item.spend >= 0 && item.spend <= 10_000_000 ? Math.round(item.spend * 100) / 100 : null;
    const impressions = count(item.impressions);
    const clicks = count(item.clicks);
    const campaign = text(item.campaign, 300);
    const adName = text(item.ad_name, 300);
    if (spend === null || impressions === null || clicks === null || !campaign || !adName) return null;
    rows.push({ campaign, ad_group: text(item.ad_group, 300), ad_name: adName, spend, impressions, clicks });
  }
  return rows;
}

export async function POST(request: Request) {
  const denied = await ownerOnly();
  if (denied) return denied;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (body.platform !== "reddit") return NextResponse.json({ error: "Only Reddit imports are set up so far." }, { status: 400 });
    if (!isIsoDate(body.periodStart) || !isIsoDate(body.periodEnd) || body.periodEnd < body.periodStart) {
      return NextResponse.json({ error: "Pick the first and last day this report covers." }, { status: 400 });
    }
    const rows = cleanRows(body.rows);
    if (!rows) return NextResponse.json({ error: "Those rows could not be read. Upload the Reddit file again." }, { status: 400 });
    await importPlatformStats("reddit", { start: body.periodStart, end: body.periodEnd }, rows);
    return NextResponse.json({ ok: true, imported: rows.length });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Something went wrong." }, { status: 400 });
  }
}

// Saves (or clears) the utm_content tag that ties inquiries to one ad.
export async function PATCH(request: Request) {
  const denied = await ownerOnly();
  if (denied) return denied;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (body.platform !== "reddit") return NextResponse.json({ error: "Which platform?" }, { status: 400 });
    const campaign = text(body.campaign, 300);
    const adName = text(body.ad_name, 300);
    if (!campaign || !adName) return NextResponse.json({ error: "Which ad?" }, { status: 400 });
    const tag = text(body.utmContent, 200);
    await setPlatformTag("reddit", { campaign, ad_group: text(body.ad_group, 300), ad_name: adName }, tag || null);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Something went wrong." }, { status: 400 });
  }
}
