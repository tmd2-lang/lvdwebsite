import { createHmac, timingSafeEqual } from "node:crypto";
import nodemailer from "nodemailer";
import { CONSULTATION_URL } from "./consultation-booking";

/**
 * The venue checklist follow-up sequence: Email 1 right away, Email 2 on day 3,
 * Email 3 on day 7. Copy lives in docs/venue-checklist/emails.md. Each signup
 * gets the lines for their edition (standard / multicultural) and venue status
 * (still looking / already booked). Sent through the site's Gmail account;
 * what was sent is recorded in the lead's payload.emails.
 */

const SITE = "https://www.ladyvictoriadesigns.com";
const PDF = {
  standard: `${SITE}/venue-checklist/before-you-book-the-venue.pdf`,
  multicultural: `${SITE}/venue-checklist/before-you-book-the-venue-multicultural.pdf`,
};
// Where Email 2's "See how we plan" button goes. Waiting on Irene: /planning or /inquire.
const PLANNING_URL = `${SITE}/planning`;
const DAY = 86_400_000;

export type ChecklistStep = 1 | 2 | 3;
export type ChecklistLead = {
  id: string;
  name: string | null;
  email: string;
  created_at: string;
  payload: Record<string, unknown> | null;
};

type Copy = { subject: string; preview: string; blocks: Block[] };
type Block = { p: string } | { list: [bold: string, rest: string][] } | { button: [label: string, href: string] };

function readLead(lead: ChecklistLead) {
  const payload = lead.payload || {};
  return {
    firstName: (lead.name || "").trim().split(/\s+/)[0] || "there",
    multicultural: payload.edition === "multicultural",
    booked: payload.venueStatus === "booked",
  };
}

function trackedUrl(href: string, step: ChecklistStep) {
  const url = new URL(href);
  url.searchParams.set("utm_source", "email");
  url.searchParams.set("utm_medium", "email");
  url.searchParams.set("utm_campaign", `venue_checklist_${step}`);
  return url.toString();
}

function bookingUrl(lead: ChecklistLead) {
  // utm_content lets the Calendly webhook match the booking back to this lead.
  const url = new URL(CONSULTATION_URL);
  url.searchParams.set("utm_content", `lvd_lead_${lead.id}`);
  if (lead.name) url.searchParams.set("name", lead.name);
  url.searchParams.set("email", lead.email);
  return url.toString();
}

function copyFor(step: ChecklistStep, lead: ChecklistLead): Copy {
  const { firstName, multicultural, booked } = readLead(lead);
  if (step === 1) return {
    subject: multicultural ? "Your multicultural venue checklist is here" : "Your venue checklist is here",
    preview: booked ? "Use it before the details are final." : "Bring it to your next tour.",
    blocks: [
      { p: `Hi ${firstName},` },
      { p: "Your venue checklist is ready!" },
      { button: ["Download your checklist", PDF[multicultural ? "multicultural" : "standard"]] },
      { p: `${booked ? "One tip as you work through the details with your venue" : "One tip before your next tour"}: you don’t need to ask every question.` },
      { p: "Cross out what doesn’t apply, and get the answers that matter most confirmed in writing." },
      { p: "If you remember only one thing: “We’re flexible” is not a yes." },
      { p: booked
        ? "I’d love to hear about the venue you chose."
        : "I’d love to know: are you just starting your venue search, or have you already found somewhere you love?" },
      { p: "Just hit reply." },
    ],
  };
  if (step === 2) return {
    subject: "The three questions couples forget to ask",
    preview: "Most of them happen before your guests arrive.",
    blocks: [
      { p: `Hi ${firstName},` },
      { p: "Most couples ask about capacity and catering. Far fewer ask about the hours before guests arrive, and that’s where beautiful plans quietly fall apart." },
      { p: booked ? "Three to confirm with your venue before the details are final:" : "Three to add to your next tour:" },
      { list: [
        ["How many hours do we get to set up?", "If the answer is two, the design you’re picturing may not fit."],
        ["Will our décor fit through the doors and freight elevator?", "Ask for the measurements, not “it should be fine.”"],
        ["What’s the true total?", "Service charges, tax, security, and overtime are rarely in the first quote."],
        ...(multicultural ? [["Can we have exactly what our traditions need?", "Name it: “sacred fire, indoors, for forty minutes” gets a real answer."] as [string, string]] : []),
      ] },
      { p: "These are the questions our planning team asks on every tour. If you’d rather we handled them for you:" },
      { button: ["See how we plan", trackedUrl(PLANNING_URL, 2)] },
    ],
  };
  return {
    subject: multicultural ? "Bringing two traditions into one celebration" : "Want a second set of eyes on your venue?",
    preview: "A 20-minute call about your venue and your plans.",
    blocks: [
      { p: `Hi ${firstName},` },
      { p: booked
        ? "Now that you’ve chosen your venue, the next step is making sure it can hold the celebration you’re imagining."
        : "By now you may have toured a venue or two, and maybe one is starting to feel right." },
      { p: "If you’d like a second set of eyes, book a 20-minute consultation with me. Bring your checklist and what the venue has told you, and we’ll go through it together: what’s confirmed, what’s still only a promise, and what to ask before anything is final." },
      ...(multicultural ? [{ p: "If you’re bringing more than one culture or ceremony together, we’ll also talk through how the day can flow so every tradition has its moment." }] : []),
      { button: ["Book your consultation", bookingUrl(lead)] },
    ],
  };
}

const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

/** Email-safe HTML (tables and inline styles) in the site's ivory, ink, and gold. */
function render(copy: Copy, unsubscribeUrl: string) {
  const serif = "'Bodoni 72', 'Didot', Georgia, 'Times New Roman', serif";
  const sans = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const body = copy.blocks.map((block) => {
    if ("p" in block) return `<p style="margin:0 0 18px;font:16px/1.65 ${sans};color:#3a3631">${escapeHtml(block.p)}</p>`;
    if ("list" in block) return `<ol style="margin:0 0 18px;padding-left:22px;font:16px/1.65 ${sans};color:#3a3631">${block.list
      .map(([bold, rest]) => `<li style="margin:0 0 10px"><strong style="color:#14120F">${escapeHtml(bold)}</strong> ${escapeHtml(rest)}</li>`).join("")}</ol>`;
    const [label, href] = block.button;
    return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 26px"><tr><td style="border-radius:999px;background:#14120F"><a href="${escapeHtml(href)}" style="display:inline-block;padding:15px 34px;font:600 12px/1 ${sans};letter-spacing:2.4px;text-transform:uppercase;color:#F7F4EE;text-decoration:none">${escapeHtml(label)}</a></td></tr></table>`;
  }).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(copy.subject)}</title></head>
<body style="margin:0;padding:0;background:#F7F4EE">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(copy.preview)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F4EE"><tr><td align="center" style="padding:36px 18px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td style="padding:0 4px 26px;font:italic 22px/1 ${serif};color:#14120F">Lady Victoria Designs</td></tr>
<tr><td style="background:#ffffff;border:1px solid #E4DED3;border-radius:14px;padding:36px 34px 14px">
${body}
<p style="margin:8px 0 2px;font:16px/1.5 ${sans};color:#3a3631">Warmly,</p>
<p style="margin:0 0 22px;font:italic 26px/1.2 ${serif};color:#14120F">Irene</p>
<p style="margin:0 0 20px;font:11px/1.5 ${sans};letter-spacing:1.6px;text-transform:uppercase;color:#A8894E">Irene Ntiako · Founder &amp; Creative Director</p>
</td></tr>
<tr><td style="padding:22px 4px 0;font:12px/1.6 ${sans};color:#8a847a">
You’re receiving this because you downloaded the venue checklist at ladyvictoriadesigns.com.
<a href="${escapeHtml(unsubscribeUrl)}" style="color:#8a847a">Unsubscribe</a>.
</td></tr>
</table></td></tr></table></body></html>`;
  const text = [
    ...copy.blocks.map((block) => "p" in block ? block.p
      : "list" in block ? block.list.map(([bold, rest], i) => `${i + 1}. ${bold} ${rest}`).join("\n")
      : `${block.button[0]}: ${block.button[1]}`),
    "Warmly,\nIrene\nIrene Ntiako, Founder & Creative Director, Lady Victoria Designs",
    `Unsubscribe: ${unsubscribeUrl}`,
  ].join("\n\n");
  return { html, text };
}

function unsubscribeSecret() {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("Unsubscribe links need SUPABASE_SERVICE_ROLE_KEY.");
  return secret;
}

export function unsubscribeToken(leadId: string) {
  return createHmac("sha256", unsubscribeSecret()).update(`checklist-unsubscribe:${leadId}`).digest("hex").slice(0, 32);
}

export function validUnsubscribeToken(leadId: string, token: string) {
  const expected = Buffer.from(unsubscribeToken(leadId));
  const given = Buffer.from(token);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export function unsubscribeUrl(leadId: string) {
  return `${SITE}/api/venue-checklist/unsubscribe?id=${encodeURIComponent(leadId)}&t=${unsubscribeToken(leadId)}`;
}

/** The email for one step, for sending or for previewing. */
export function buildChecklistEmail(step: ChecklistStep, lead: ChecklistLead) {
  const copy = copyFor(step, lead);
  return { subject: copy.subject, ...render(copy, unsubscribeUrl(lead.id)) };
}

function gmail() {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  if (!user || !pass) return null;
  return {
    user,
    transporter: nodemailer.createTransport({
      host: "smtp.gmail.com", port: 465, secure: true,
      connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 8000,
      auth: { user, pass },
    }),
  };
}

function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Lead storage is not configured.");
  return { url, headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" } };
}

/** Reads the lead fresh so other payload fields saved since are kept, then records the send. */
async function recordSent(leadId: string, step: ChecklistStep) {
  const db = supabase();
  const response = await fetch(`${db.url}/rest/v1/leads?id=eq.${encodeURIComponent(leadId)}&select=payload`, { headers: db.headers, cache: "no-store" });
  const [row] = await response.json() as { payload: Record<string, unknown> | null }[];
  const payload = row?.payload || {};
  const emails = { ...(payload.emails as Record<string, string> | undefined), [`email${step}`]: new Date().toISOString() };
  const saved = await fetch(`${db.url}/rest/v1/leads?id=eq.${encodeURIComponent(leadId)}`, {
    method: "PATCH", headers: db.headers, body: JSON.stringify({ payload: { ...payload, emails } }), cache: "no-store",
  });
  if (!saved.ok) console.error("Could not record checklist email.", { leadId, step });
}

/** Sends one step. Returns false when email is not configured or the send fails. */
export async function sendChecklistEmail(step: ChecklistStep, lead: ChecklistLead, to = lead.email) {
  const mail = gmail();
  if (!mail) return false;
  const email = buildChecklistEmail(step, lead);
  const unsubscribe = unsubscribeUrl(lead.id);
  try {
    await mail.transporter.sendMail({
      from: `Irene at Lady Victoria Designs <${mail.user}>`,
      replyTo: process.env.CHECKLIST_REPLY_TO?.trim() || mail.user,
      to,
      subject: email.subject,
      html: email.html,
      text: email.text,
      headers: { "List-Unsubscribe": `<${unsubscribe}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    });
  } catch (error) {
    console.error("Checklist email failed.", { leadId: lead.id, step, error: error instanceof Error ? error.message : error });
    return false;
  }
  if (to === lead.email) await recordSent(lead.id, step);
  return true;
}

/** Daily: Email 2 from day 3 and Email 3 from day 7, one email per lead per run. */
export async function runChecklistSequence(now = new Date()) {
  const db = supabase();
  const since = new Date(now.getTime() - 21 * DAY).toISOString();
  const response = await fetch(`${db.url}/rest/v1/leads?source=eq.venue_checklist&status=neq.spam&created_at=gte.${since}&select=id,name,email,created_at,payload`, { headers: db.headers, cache: "no-store" });
  if (!response.ok) throw new Error(`Could not load checklist leads (${response.status}).`);
  const leads = await response.json() as ChecklistLead[];
  const sent = { email2: 0, email3: 0, skipped: 0 };
  for (const lead of leads) {
    const payload = lead.payload || {};
    const emails = (payload.emails || {}) as Record<string, string>;
    const age = now.getTime() - Date.parse(lead.created_at);
    if (payload.unsubscribed) { sent.skipped++; continue; }
    if (!emails.email2 && age >= 3 * DAY) { if (await sendChecklistEmail(2, lead)) sent.email2++; }
    else if (emails.email2 && !emails.email3 && age >= 7 * DAY) { if (await sendChecklistEmail(3, lead)) sent.email3++; }
  }
  return { leads: leads.length, ...sent };
}

export async function unsubscribeLead(leadId: string) {
  const db = supabase();
  const response = await fetch(`${db.url}/rest/v1/leads?id=eq.${encodeURIComponent(leadId)}&source=eq.venue_checklist&select=payload`, { headers: db.headers, cache: "no-store" });
  const [row] = await response.json() as { payload: Record<string, unknown> | null }[];
  if (!row) return false;
  const saved = await fetch(`${db.url}/rest/v1/leads?id=eq.${encodeURIComponent(leadId)}`, {
    method: "PATCH", headers: db.headers, body: JSON.stringify({ payload: { ...(row.payload || {}), unsubscribed: new Date().toISOString() } }), cache: "no-store",
  });
  return saved.ok;
}
