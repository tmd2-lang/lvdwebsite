import nodemailer from "nodemailer";
import { after } from "next/server";

export const runtime = "nodejs";

const WINDOW_MS = 2 * 60 * 60 * 1000;

type Lead = {
  id: string; name: string | null; email: string; phone: string | null; created_at: string;
  investment: string | null; event_date: string | null; date_undecided: boolean | null; payload: Record<string, unknown> | null;
};

function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Lead storage is not configured.");
  return { url, headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" } };
}

function displayPhone(digits: string) {
  const local = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  return local.length === 10 ? `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}` : digits;
}

/**
 * "Want a quick text from Irene?" on the checklist thank-you screen. Adds the phone
 * number to the signup just made. Only works once, and only within two hours of
 * signing up, since the lead id is the only key the browser holds.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { leadId?: unknown; phone?: unknown };
  const leadId = typeof body.leadId === "string" ? body.leadId : "";
  const digits = typeof body.phone === "string" ? body.phone.replace(/\D/g, "") : "";
  if (!/^[0-9a-f-]{36}$/i.test(leadId)) return Response.json({ error: "Please refresh and try again." }, { status: 400 });
  if (digits.length < 10 || digits.length > 15) return Response.json({ error: "Please enter a full phone number." }, { status: 400 });

  const db = supabase();
  const response = await fetch(`${db.url}/rest/v1/leads?id=eq.${leadId}&source=eq.venue_checklist&select=id,name,email,phone,created_at,investment,event_date,date_undecided,payload`, { headers: db.headers, cache: "no-store" });
  const [lead] = response.ok ? await response.json() as Lead[] : [];
  if (!lead || lead.phone || Date.now() - Date.parse(lead.created_at) > WINDOW_MS) {
    return Response.json({ error: "We couldn’t add that. Just reply to our email with your number." }, { status: 400 });
  }

  const phone = displayPhone(digits);
  const saved = await fetch(`${db.url}/rest/v1/leads?id=eq.${leadId}&phone=is.null`, {
    method: "PATCH", headers: db.headers, cache: "no-store",
    body: JSON.stringify({ phone, payload: { ...(lead.payload || {}), textRequested: new Date().toISOString() } }),
  });
  if (!saved.ok) return Response.json({ error: "That didn’t save. Please try again." }, { status: 502 });

  // Tell the studio right away: this is the warmest kind of checklist signup.
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  const to = [...new Set((process.env.NOTIFICATION_EMAIL || "").split(",").map((a) => a.trim()).filter(Boolean))];
  if (user && pass && to.length) {
    after(async () => {
      const payload = lead.payload || {};
      const name = (lead.name || "A checklist signup").replace(/[\r\n]+/g, " ");
      const text = [
        `${name} downloaded the venue checklist and asked for a text from Irene.`,
        "",
        `Phone: ${phone}`,
        `Email: ${lead.email}`,
        `Budget: ${lead.investment || "Not given"}`,
        `Wedding: ${lead.date_undecided ? "Date not decided" : lead.event_date?.slice(0, 7) || "Not given"}`,
        `Venue: ${payload.venueStatus === "booked" ? "Already booked" : "Still looking"}`,
        `Edition: ${payload.edition === "multicultural" ? "Multicultural" : "Standard"}`,
      ].join("\n");
      try {
        await nodemailer.createTransport({
          host: "smtp.gmail.com", port: 465, secure: true,
          connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 8000,
          auth: { user, pass },
        }).sendMail({ from: `Lady Victoria Designs Website <${user}>`, to, replyTo: lead.email, subject: `Wants a text: ${name}`, text });
      } catch {
        console.error("Checklist text-request alert failed.", { leadId });
      }
    });
  }
  return Response.json({ ok: true });
}
