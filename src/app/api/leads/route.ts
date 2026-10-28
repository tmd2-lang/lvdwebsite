import { createHash } from "node:crypto";
import nodemailer from "nodemailer";
import { after } from "next/server";
import { attributionColumns } from "@/lib/attribution";
import { isMarketingSolicitation, type LeadNotification } from "@/lib/lead-quality";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

const LEAD_SOURCES = new Set(["inquire", "consultation", "reserve", "style_quiz"]);
const BLOCKED_EMAILS = new Set(["emmahines23@gmail.com", "emmahines23@gamil.com"]);
const BLOCKED_PHONES = new Set(["302233290", "3022333290"]);
// Same network hash on both known inquiries; uses the existing storage hash format.
const BLOCKED_IP_HASHES = new Set([
  "90ed09a1288d18d82c9c75f25f576112ce4ef54518cf5351179be9b70748f3a6",
]);

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
  attachments?: unknown;
  payload?: unknown;
  attribution?: unknown;
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

    // Apply the sender block to every form before storing or emailing an inquiry.
    const phoneDigits = phone.replace(/\D/g, "");
    const normalizedPhone = phoneDigits.length === 11 && phoneDigits.startsWith("1")
      ? phoneDigits.slice(1)
      : phoneDigits;
    const senderIpHash = ipHash(request, serviceRoleKey);
    if (BLOCKED_EMAILS.has(email) || BLOCKED_PHONES.has(normalizedPhone)
      || (senderIpHash !== null && BLOCKED_IP_HASHES.has(senderIpHash))) {
      return Response.json({ error: "Unable to accept this inquiry." }, { status: 403 });
    }

    if (!LEAD_SOURCES.has(source)) {
      return Response.json({ error: "Choose a valid inquiry source." }, { status: 400 });
    }

    if (!name || !email || !phone) {
      return Response.json({ error: "Name, email, and phone are required." }, { status: 400 });
    }

    const gmailUser = process.env.GMAIL_USER?.trim();
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
    const notificationEmails = [...new Set((process.env.NOTIFICATION_EMAIL || "")
      .split(",").map((address) => address.trim()).filter(Boolean))];
    const notificationStatus = gmailUser && gmailAppPassword && notificationEmails.length
      ? "queued" as const : "not_configured" as const;
    const solicitation = isMarketingSolicitation(stringValue(body.vision));
    const lead = {
      source,
      status: solicitation ? "spam" : "new",
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
      payload: {
        ...plainPayload(body.payload), attachments: stringArray(body.attachments),
        notification: { status: notificationStatus, attempts: 0, updatedAt: new Date().toISOString() } as LeadNotification,
        quality: solicitation ? "marketing_solicitation" : "unreviewed",
      },
      user_agent: optionalString(request.headers.get("user-agent")),
      referrer: optionalString(request.headers.get("referer")),
      ip_hash: senderIpHash,
    };
    const tracking = attributionColumns(body.attribution, request.headers.get("referer"), new Date());

    const insertLead = (row: object) => fetch(`${supabaseUrl}/rest/v1/leads`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(row),
      cache: "no-store",
    });

    let response = await insertLead({ ...lead, ...tracking });
    let result = await response.json().catch(() => null);
    // Never lose an inquiry over tracking: if the attribution columns are not
    // installed yet (PostgREST PGRST204), save the lead without them.
    if (!response.ok && result?.code === "PGRST204") {
      console.error("Attribution columns missing; saving lead without them:", result.message);
      response = await insertLead(lead);
      result = await response.json().catch(() => null);
    }
    if (!response.ok) {
      console.error("Supabase lead insert failed:", result);
      return Response.json({ error: "Could not save your inquiry. Please try again." }, { status: 502 });
    }

    const leadId = Array.isArray(result) && result[0]?.id ? String(result[0].id) : "";

    const saveNotification = async (status: LeadNotification["status"], attempts: number) => {
      if (!leadId) return;
      const saved = await fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${encodeURIComponent(leadId)}`, {
        method: "PATCH",
        headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ payload: { ...lead.payload, notification: { status, attempts, updatedAt: new Date().toISOString() } } }),
        cache: "no-store", signal: AbortSignal.timeout(5000),
      });
      if (!saved.ok) console.error("Could not persist lead notification status.", { leadId, status });
    };

    if (!gmailUser || !gmailAppPassword || notificationEmails.length === 0) {
      console.error("Lead notification email is not configured.", {
        hasGmailUser: Boolean(gmailUser),
        hasGmailAppPassword: Boolean(gmailAppPassword),
        recipientCount: notificationEmails.length,
      });
    } else {
      after(async () => {
        try {
          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            connectionTimeout: 5000,
            greetingTimeout: 5000,
            socketTimeout: 8000,
            auth: {
              user: gmailUser,
              pass: gmailAppPassword,
            },
          });

          const attachmentsList = lead.payload.attachments.length
            ? `\nVision & Inspiration Images:\n${lead.payload.attachments.map((url: string, i: number) => `${i + 1}. ${url}`).join('\n')}`
            : "";

          const emailText = `
New Inquiry Received from ${name}

Contact Details:
Name: ${name}
Email: ${email}
Phone: ${phone}

Event Details:
Inquiry Type: ${lead.source}
Celebration Type: ${lead.celebration_type || "Not specified"}
Date: ${lead.date_undecided ? "Undecided" : lead.event_date || "Not specified"}
Venue: ${lead.venue || "Not specified"}
Guest Count: ${lead.guest_count || "Not specified"}
Services: ${lead.services.length > 0 ? lead.services.join(", ") : "Not specified"}
Investment Tier: ${lead.investment || "Not specified"}
Referral Source: ${lead.referral_source || "Not specified"}
${lead.quiz_result_tier ? `Style Quiz Result: ${lead.quiz_result_tier}` : ""}
${lead.quiz_score !== null ? `Style Quiz Score: ${lead.quiz_score}` : ""}

Vision & Notes:
${lead.vision || "No additional notes provided."}
${attachmentsList}
          `.trim();

          const message = {
            from: `Lady Victoria Designs Website <${gmailUser}>`,
            replyTo: email,
            subject: `${solicitation ? "Review: possible solicitation" : "New Website Lead"}: ${name.replace(/[\r\n]+/g, " ")}`,
            messageId: `<inquiry-${leadId}@ladyvictoriadesigns.com>`,
            text: emailText,
          };
          let pending = [...notificationEmails];
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              const sent = await transporter.sendMail({ ...message, to: pending });
              const accepted = new Set(sent.accepted.map((address) => String(address).toLowerCase()));
              pending = pending.filter((address) => !accepted.has(address.toLowerCase()));
            } catch {
              console.error("Lead notification attempt failed.", { leadId, attempt });
            }
            const status = pending.length ? "failed" : "accepted";
            try { await saveNotification(status, attempt); } catch {
              console.error("Could not persist lead notification status.", { leadId, status });
            }
            if (!pending.length) break;
          }
        } catch (emailError) {
          console.error("Failed to send Gmail lead notification:", emailError);
        }
      });
    }

    // SMTP runs later; never claim delivery before the attempt has happened.
    return Response.json({ leadId, notificationSent: false, notificationStatus, trackingEligible: !solicitation });
  } catch (error) {
    console.error("Lead submission failed:", error);
    return Response.json({ error: "Could not submit your inquiry. Please try again." }, { status: 400 });
  }
}
