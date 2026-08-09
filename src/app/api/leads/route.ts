import { createHash } from "node:crypto";
import nodemailer from "nodemailer";
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

    const gmailUser = process.env.GMAIL_USER?.trim();
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
    const notificationEmails = (process.env.NOTIFICATION_EMAIL || "")
      .split(",")
      .map((emailAddress) => emailAddress.trim())
      .filter(Boolean);
    let notificationSent = false;

    if (!gmailUser || !gmailAppPassword || notificationEmails.length === 0) {
      console.error("Lead notification email is not configured.", {
        hasGmailUser: Boolean(gmailUser),
        hasGmailAppPassword: Boolean(gmailAppPassword),
        recipientCount: notificationEmails.length,
      });
    } else {
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: gmailUser,
            pass: gmailAppPassword,
          },
        });

        const emailText = `
Hey, you have a new lead.

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
        `.trim();

        const emailResult = await transporter.sendMail({
          from: `Lady Victoria Designs Website <${gmailUser}>`,
          to: notificationEmails,
          replyTo: email,
          subject: `New Website Lead: ${name.replace(/[\r\n]+/g, " ")}`,
          text: emailText,
        });

        const acceptedCount = emailResult.accepted.length;
        notificationSent = acceptedCount === notificationEmails.length;

        if (!notificationSent) {
          console.error("Gmail did not accept every lead notification recipient.", {
            acceptedCount,
            rejectedCount: emailResult.rejected.length,
          });
        } else {
          console.log("Lead notification email accepted by Gmail.", {
            messageId: emailResult.messageId,
            recipientCount: acceptedCount,
          });
        }
      } catch (emailError) {
        console.error("Failed to send Gmail lead notification:", emailError);
      }
    }

    // The lead remains successfully submitted even if notification delivery fails.
    // Exposing this boolean makes direct API tests and production logs unambiguous.
    return Response.json({ leadId, notificationSent });
  } catch (error) {
    console.error("Lead submission failed:", error);
    return Response.json({ error: "Could not submit your inquiry. Please try again." }, { status: 400 });
  }
}
