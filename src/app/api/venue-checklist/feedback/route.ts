import { recordChecklistFeedback, validFeedbackToken, type ChecklistFeedback } from "@/lib/checklist-emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const THANKS: Record<ChecklistFeedback, [title: string, body: string]> = {
  yes: ["Thank you!", "We’re so glad it helped. If you’d like a second set of eyes on your venue, just reply to any of our emails."],
  no: ["Thank you for telling us", "What was missing? Reply to any of our emails and let us know. Irene reads every one."],
};

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
  const answer = url.searchParams.get("a");
  const valid = Boolean(id && token) && (answer === "yes" || answer === "no") && validFeedbackToken(id, token);
  return { id, answer: answer as ChecklistFeedback, valid };
}

const notRecognized = () => page("Link not recognized", `<p style="color:#5F5A52;line-height:1.6">Reply to any of our emails and let us know what you thought.</p>`, 400);

// Email scanners open links automatically, so a plain click only shows the thank-you;
// the page's script (or the button, without scripts) saves the answer with a POST.
export async function GET(request: Request) {
  const { answer, valid } = readParams(request);
  if (!valid) return notRecognized();
  const [title, body] = THANKS[answer];
  return page(title, `<p style="color:#5F5A52;line-height:1.6">${body}</p>
<script>fetch(location.href, { method: "POST" });</script>
<noscript><form method="post" style="margin-top:28px"><button type="submit" style="background:#14120F;color:#F7F4EE;border:0;border-radius:999px;padding:15px 34px;font:600 12px Arial,sans-serif;letter-spacing:2.4px;text-transform:uppercase;cursor:pointer">Send my answer</button></form></noscript>`);
}

export async function POST(request: Request) {
  const { id, answer, valid } = readParams(request);
  if (!valid) return notRecognized();
  const saved = await recordChecklistFeedback(id, answer).catch(() => false);
  if (!saved) return page("Something went wrong", `<p style="color:#5F5A52;line-height:1.6">Reply to any of our emails and let us know what you thought.</p>`, 502);
  const [title, body] = THANKS[answer];
  return page(title, `<p style="color:#5F5A52;line-height:1.6">${body}</p>`);
}
