import { unsubscribeLead, validUnsubscribeToken } from "@/lib/checklist-emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function page(title: string, body: string, status = 200) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} | Lady Victoria Designs</title></head>
<body style="margin:0;background:#F7F4EE;color:#14120F;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
<main style="max-width:480px;margin:0 auto;padding:80px 24px;text-align:center">
<p style="font:italic 22px Georgia,serif;margin:0 0 40px">Lady Victoria Designs</p>
<h1 style="font:400 30px/1.2 Georgia,serif;margin:0 0 16px">${title}</h1>
${body}
</main></body></html>`;
  return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

function readParams(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id") || "";
  const token = url.searchParams.get("t") || "";
  return { id, token, valid: Boolean(id && token) && validUnsubscribeToken(id, token) };
}

// A plain link click only shows a button: email scanners open links automatically,
// and that must not unsubscribe anyone.
export async function GET(request: Request) {
  const { id, token, valid } = readParams(request);
  if (!valid) return page("Link not recognized", `<p style="color:#5F5A52;line-height:1.6">This unsubscribe link is incomplete. Reply to any of our emails and we will take you off the list.</p>`, 400);
  return page("Stop these emails?", `<p style="color:#5F5A52;line-height:1.6;margin:0 0 28px">You will not receive the rest of the venue checklist emails.</p>
<form method="post" action="/api/venue-checklist/unsubscribe?id=${encodeURIComponent(id)}&t=${encodeURIComponent(token)}">
<button type="submit" style="background:#14120F;color:#F7F4EE;border:0;border-radius:999px;padding:15px 34px;font:600 12px Arial,sans-serif;letter-spacing:2.4px;text-transform:uppercase;cursor:pointer">Unsubscribe</button>
</form>`);
}

// The button above, and mail apps' one-click unsubscribe (List-Unsubscribe-Post), both POST here.
export async function POST(request: Request) {
  const { id, valid } = readParams(request);
  if (!valid) return page("Link not recognized", `<p style="color:#5F5A52">Reply to any of our emails and we will take you off the list.</p>`, 400);
  const done = await unsubscribeLead(id).catch(() => false);
  if (!done) return page("Something went wrong", `<p style="color:#5F5A52;line-height:1.6">Please try again, or reply to any of our emails and we will take you off the list.</p>`, 502);
  return page("You’re unsubscribed", `<p style="color:#5F5A52;line-height:1.6">You won’t receive any more venue checklist emails. Wishing you a beautiful celebration.</p>`);
}
