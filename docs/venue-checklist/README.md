# Venue checklist: start here

The free "Before You Book the Venue" checklist is LVD's lead magnet. Couples sign up on `/venue-checklist`, download the PDF, get three follow-up emails, and are offered a complimentary consultation. This page maps everything in this folder and what's still open. Status as of **Oct 30, 2026**.

## What's live

- **Checklist v4** (`v4/`): 43 questions, 57 in the multicultural edition. The questions live in `src/lib/venue-checklist-questions.ts`, which the PDF build and the phone checklist (`/venue-checklist/tour`) both read. Old-vs-new list: `v4-question-list.md`.
- **Landing page:** `src/app/venue-checklist/` (signup form, PDF download, preview images in `public/venue-checklist/`). The confirmation screen tells couples to check Promotions or spam for the email.
- **Emails** (`emails.md`, code in `src/lib/checklist-emails.ts`): Email 1 right away, Email 2 on day 3, Email 3 on day 7, sent from **hello@ladyvictoriadesigns.com**. Vercel needs `CHECKLIST_GMAIL_USER` and `CHECKLIST_GMAIL_APP_PASSWORD` (a Google App Password for hello@). Both are set, and a test send arrived. SPF, DKIM and DMARC all pass. Email 1 is a plain personal note from Irene so Gmail is more likely to file it in Primary rather than Promotions.

## Folders

| Folder | What it is |
|---|---|
| `v4/` | **Live** PDF checklist (standard + multicultural). |
| `v3/`, `v2/`, `lead-magnet/` | Earlier versions, kept for reference. |
| `team-edition/` | Internal venue vetting checklist for the team. Never sent to clients. |
| `ads/` | Meta ads for the checklist: 8 statics, a magazine cover and a 14-second video, in feed and story sizes. Copy, setup and how to re-render are in `ads/README.md`. |
| `emails.md` | Copy for the 3-email sequence. |

Related notes for Irene and her assistant Muse are in `../muse-handoff/`. The most relevant ones are `venue-checklist-update-2026-10-30.md` and `venue-research-2026-10-30.md` (what brides say about venue searching, from 10 Reddit threads, with ad angles).

## Open items

1. **Irene to OK the ad photos.** They're real couples and rooms from the site gallery.
2. **Meta tracking:** checklist signups fire the same standard `Lead` event as real inquiries (`src/lib/meta-pixel.ts`, `content_name: venue_checklist`). Give checklist signups their own event, or make a custom conversion, before running inquiry-optimized campaigns. Otherwise Meta will chase cheap downloads.
3. **Ads, round 1** (`ads/README.md`): one ad set with the 3 general angles × 2 images, about $30–50/day for 7–10 days. Judge by cost per download per angle, then by consultations booked.
4. **Still to make:** the multicultural ad set ("'Yes, we host multicultural weddings' isn't enough" and "More than one ceremony?"), and a round 2 video of Irene talking to camera for the winning angle.
5. **Keep the ads in sync with the checklist.** They quote "43 questions" and specific questions. If the checklist changes, update the ads (see `ads/README.md`).

## How each piece works (code map)

| Piece | Where | Notes |
|---|---|---|
| Landing page | `/venue-checklist`: `src/app/venue-checklist/page.tsx`, `ChecklistForm.tsx` | Main site fonts, no menu. The form asks name, email, wedding month, full budget, venue status, and multicultural yes/no. After signup: "Open it on your phone", "Download the PDF", and an optional "Want a quick text from Irene?" phone box. |
| Signup saving | `src/app/api/leads/route.ts` (source `venue_checklist`) | Saved in the leads table and shown in admin Inquiries as "Venue checklist". The studio gets a "Venue Checklist Download" email. Returns the couple's private phone-checklist link (`tourPath`). |
| "Text me" | `src/app/api/venue-checklist/phone/route.ts` | Adds a phone number to the signup, only once and only within 2 hours. Emails the studio "Wants a text: [name]". |
| PDF guide (v4, current) | `docs/venue-checklist/v4/` → copied to `public/venue-checklist/*.pdf` | Two editions: standard (13 pages, 43 questions) and multicultural (15 pages, 57). See `v4/README.md` for how to rebuild and export. |
| **Question list (single source)** | `src/lib/venue-checklist-questions.ts` | Used by both the phone checklist and the PDF (`v4/build.py` generates the PDF's question pages from it). `tests/venue-checklist.test.cjs` fails if they disagree. **Never reuse or renumber a question id**, because couples' saved answers use them. |
| Phone checklist | `/venue-checklist/tour?id=…&t=…`: `src/app/venue-checklist/tour/` | Tap a box to cycle not asked → told yes → in writing. Skip, answers for ★ dealbreakers, verdict per section, up to 6 venues (rename with the pencil, delete with the × on the tab or "Remove venue"), an automatic Chase List with "Email the venue", Compare view, and a "Just the 10 dealbreakers" switch. Styled as a clean app: no italics apart from the logo. |
| Phone checklist saving | `src/app/api/venue-checklist/tour/route.ts`, `src/lib/venue-checklist-tour.ts` | Saved on the lead in `payload.tour` through the private link (HMAC token, purpose `tour`). A copy is kept on the phone so it works with no signal, and it syncs when back online. `cleanTour()` drops anything unknown and caps the size. |
| Emails | `src/lib/checklist-emails.ts`; copy in `docs/venue-checklist/emails.md` | Email 1 right away (PDF link and phone-checklist link), Email 2 on day 3 (tips, plus "Was the checklist useful?"), Email 3 on day 7 (complimentary consultation). Four versions each (edition × still looking/booked). Sent from **hello@ladyvictoriadesigns.com** (Vercel vars `CHECKLIST_GMAIL_USER`, `CHECKLIST_GMAIL_APP_PASSWORD`). Daily cron: `/api/cron/venue-checklist-emails` (`vercel.json`, needs `CRON_SECRET`). Being made to look like plain personal email to avoid Gmail's Promotions tab (done in another session). |
| Feedback page | `/venue-checklist/feedback`: `src/app/venue-checklist/feedback/` + `src/app/api/venue-checklist/feedback/route.ts` | From Email 2's Yes / Not really buttons. Yes offers the consultation. Not really asks "What was missing?". Answers save as notes on the lead. |
| Unsubscribe | `src/app/api/venue-checklist/unsubscribe/route.ts` | A click shows a confirm button, so email scanners can't unsubscribe anyone. One-click header supported. |

## Decisions already made (don't re-ask)

- **From Irene (Oct 30):** the consultation is complimentary, replies go to hello@, and "See how we plan" links to `/planning`.
- **v4 questions:** Irene's 7 swap-ins are in:
  - food and drink minimum
  - guest count going down after signing
  - admin and credit card fees
  - restrooms
  - getting-ready space and hair and makeup on site
  - other events the same day
  - the same contact on the day
- **More from Irene on v4:** technical items are "For your planner" notes, it should teach (a "why" under each star and "listen for" tips on 8 questions), and Start Here asks how far the couple and their guests will travel.
- **The PDF keeps the editorial look** (Cormorant, white paper, black text, gold accents). The phone version is plain and app-like.
- **Multicultural** content lives only in the multicultural chapter. The standard edition is fully general.
- **Ad angles Irene likes:**
  - the guest count trap ("Sign for 200. 150 come. You pay for 200.")
  - what's not included
  - the rain plan
  - the regret list
  - the planner angle, for retargeting and Email 3

## Phone checklist: still open

- The phone checklist hasn't been tested on a real phone by the studio yet.
- Later: let Irene see a couple's venues and dealbreakers before the consultation (it's already saved on the lead; we'd need to show it in Inquiries, and the app tells couples their answers are saved with LVD).
