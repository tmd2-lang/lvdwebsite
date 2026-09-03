import nodemailer from "nodemailer";

/**
 * The invitation email the studio sends a client.
 *
 * Supabase can send this itself, but it arrives from "Supabase Auth" on a
 * shared address and looks like a system notice from a company the couple has
 * never heard of. We mint the link and send it ourselves instead, through the
 * same mailbox the site already uses for lead notifications.
 */

const REPLY_TO = "hello@ladyvictoriadesigns.com";

export function inviteMailConfigured() {
  return Boolean(process.env.GMAIL_USER?.trim() && process.env.GMAIL_APP_PASSWORD?.trim());
}

function transport() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER?.trim(),
      pass: process.env.GMAIL_APP_PASSWORD?.trim(),
    },
  });
}

/** Email clients are stuck in about 2005, so this is tables and inline styles. */
export function inviteEmailHtml(input: {
  link: string;
  celebration: string;
  recipientName?: string;
}) {
  const greeting = input.recipientName ? `${escapeHtml(input.recipientName)},` : "Hello,";

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>Your planning portal</title></head>
<body style="margin:0;padding:0;background:#f2eee7;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2eee7;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdfa;border:1px solid #e4dcd0;border-radius:8px;overflow:hidden;">

        <tr><td style="padding:34px 40px 0;text-align:center;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;letter-spacing:.12em;color:#211e1a;">LVD</div>
          <div style="margin-top:6px;font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:#9a7840;">Lady Victoria Designs</div>
        </td></tr>

        <tr><td style="padding:30px 40px 0;">
          <p style="margin:0 0 18px;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#4c4439;">${greeting}</p>
          <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:normal;line-height:1.25;color:#211e1a;">Your planning portal is ready.</h1>
          <p style="margin:0 0 10px;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.65;color:#4c4439;">
            We&rsquo;ve made a private space for <strong style="color:#211e1a;">${escapeHtml(input.celebration)}</strong> &mdash; your plan, invoices, documents, and images, all in one place.
          </p>
          <p style="margin:0 0 26px;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.65;color:#4c4439;">
            Choose a password and it&rsquo;s yours. Only you will know it.
          </p>
        </td></tr>

        <tr><td style="padding:0 40px 30px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#211e1a;border-radius:4px;">
            <a href="${input.link}" style="display:inline-block;padding:15px 34px;font-family:Helvetica,Arial,sans-serif;font-size:13px;font-weight:bold;letter-spacing:.06em;color:#fffdf9;text-decoration:none;">Open your portal</a>
          </td></tr></table>
        </td></tr>

        <tr><td style="padding:0 40px 34px;">
          <p style="margin:0 0 6px;font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:1.6;color:#8b857c;">If the button doesn&rsquo;t work, paste this into your browser:</p>
          <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:1.5;word-break:break-all;"><a href="${input.link}" style="color:#71582e;">${input.link}</a></p>
        </td></tr>

        <tr><td style="border-top:1px solid #ece6dc;padding:20px 40px 26px;text-align:center;">
          <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:1.6;color:#9a938a;">
            This link is single use and expires. Reply to this email if you need a new one.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function inviteEmailText(input: { link: string; celebration: string; recipientName?: string }) {
  return [
    input.recipientName ? `${input.recipientName},` : "Hello,",
    "",
    "Your planning portal is ready.",
    "",
    `We've made a private space for ${input.celebration} — your plan, invoices, documents, and images, all in one place.`,
    "Choose a password and it's yours. Only you will know it.",
    "",
    input.link,
    "",
    "This link is single use and expires. Reply to this email if you need a new one.",
    "",
    "Lady Victoria Designs",
  ].join("\n");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendInviteEmail(input: {
  to: string;
  link: string;
  celebration: string;
  recipientName?: string;
}) {
  const gmailUser = process.env.GMAIL_USER?.trim();
  if (!inviteMailConfigured()) throw new Error("Invitation email is not configured.");

  await transport().sendMail({
    from: `Lady Victoria Designs <${gmailUser}>`,
    to: input.to,
    // Sent from the site's mailbox, but a reply should reach the studio.
    replyTo: REPLY_TO,
    subject: "Your Lady Victoria Designs planning portal",
    text: inviteEmailText(input),
    html: inviteEmailHtml(input),
  });
}
