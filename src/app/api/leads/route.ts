import { createHash } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LEAD_SOURCES = new Set(["inquire", "consultation", "reserve", "style_quiz"]);

type LeadRequest = {
  source?: unknown;
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  celebrationType?: unknown;
  date?: unknown;
  dateUndecided?: unknown;
  venue?: unknown;
  guestCount?: unknown;
  services?: unknown;
  vision?: unknown;
  investment?: unknown;
  referralSource?: unknown;
  quizScore?: unknown;
  quizResultTier?: unknown;
  payload?: unknown;
};

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalString(value: unknown) {
  const trimmed = stringValue(value);
  return trimmed || null;
}

function optionalDate(value: unknown) {
  const trimmed = stringValue(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}

function stringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
}

function numericValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function plainPayload(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function ipHash(request: Request, secret: string) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const ip = forwardedFor || realIp;
  if (!ip) return null;
  return createHash("sha256").update(`${ip}:${secret}`).digest("hex");
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json({ error: "Lead storage is not configured yet." }, { status: 500 });
  }

  try {
    const body = (await request.json()) as LeadRequest;
    const source = stringValue(body.source);
    const name = stringValue(body.name);
    const email = stringValue(body.email).toLowerCase();
    const phone = stringValue(body.phone);

    if (!LEAD_SOURCES.has(source)) {
      return Response.json({ error: "Choose a valid inquiry source." }, { status: 400 });
    }

    if (!name || !email || !phone) {
      return Response.json({ error: "Name, email, and phone are required." }, { status: 400 });
    }

    const lead = {
      source,
      name,
      email,
      phone,
      celebration_type: optionalString(body.celebrationType),
      event_date: optionalDate(body.date),
      date_undecided: Boolean(body.dateUndecided),
      venue: optionalString(body.venue),
      guest_count: optionalString(body.guestCount),
      services: stringArray(body.services),
      vision: optionalString(body.vision),
      investment: optionalString(body.investment),
      referral_source: optionalString(body.referralSource),
      quiz_score: numericValue(body.quizScore),
      quiz_result_tier: optionalString(body.quizResultTier),
      payload: plainPayload(body.payload),
      user_agent: optionalString(request.headers.get("user-agent")),
      referrer: optionalString(request.headers.get("referer")),
      ip_hash: ipHash(request, serviceRoleKey),
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/leads`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(lead),
      cache: "no-store",
    });

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      console.error("Supabase lead insert failed:", result);
      return Response.json({ error: "Could not save your inquiry. Please try again." }, { status: 502 });
    }

    const leadId = Array.isArray(result) && result[0]?.id ? String(result[0].id) : "";
    return Response.json({ leadId });
  } catch (error) {
    console.error("Lead submission failed:", error);
    return Response.json({ error: "Could not submit your inquiry. Please try again." }, { status: 400 });
  }
}
