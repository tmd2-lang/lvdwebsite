# Handoff to Codex: lead tracking steps 3–5

Written by Claude on 2026-10-06 for Valentina (she runs LVD's Meta ads; the git
account is her dad TJ's). Read this whole file, then
`docs/lead-tracking-playbook/README.md`, before writing code. Also follow
`AGENTS.md`: this Next.js version differs from what you know, so read
`node_modules/next/dist/docs/` before touching routes.

## Where things stand

Goal: follow every lead from the ad she clicked to the money she booked. We
explain every step through **Valentina**, an example bride, e.g. "Valentina
books a Calendly call → her inquiry shows Consult Oct 8, 2 PM."

| # | Step | Status |
|---|------|--------|
| 1 | Save which ad each inquiry came from | **Live** (commit efaa854) |
| 2 | Show the ad in the portal, marketing account only | **Live** (commit abd3af1) |
| 3 | Calendly updates the inquiry automatically | **Yours** |
| 4 | One-click sales buttons after the call | **Yours** |
| 5 | "Needs attention" list | **Yours** |
| 6 | Per-ad report | Leave for Claude + Valentina |
| 7 | Send results back to Meta (CAPI) | Leave for later |

What exists now:
- `public.leads` has `utm_source, utm_medium, utm_campaign, meta_campaign_id, meta_adset_id, meta_ad_id, landing_page, first_touch_at, attribution jsonb` (`supabase/lead-attribution-schema.sql`, already applied).
- `src/lib/attribution.ts` (capture + server sanitizing), `src/lib/ad-source.ts` (labels), `src/lib/marketing-access.ts` (`canSeeMarketing`; only `MARKETING_VIEWER_EMAILS`, default tjdozier98@gmail.com).
- `getAdminLeads({ includeMarketing })` only selects attribution columns for marketing viewers.
- Lead status dropdown: new, reviewing, contacted, qualified ("Good Fit"), booked, archived, spam ("Not a Fit"). Overview cards count Contacted and Booked from `status`.
- `lead_activity` logs viewed / status_changed / note_added.

## Ground rules (agreed with Valentina)

1. **Extend, don't rewrite.** Keep the master–detail inquiry layout and the status dropdown.
2. **Store each fact in its own field.** Don't overload `status`. Keep `status` in sync where it already means something (Booked outcome → status `booked`), so existing cards and filters keep working.
3. **Automatic vs. human.** Systems fill in what they know (Calendly scheduled/rescheduled/canceled). People only enter: did the call happen, fit, proposal amount, booked or lost + amount/reason.
4. **Seconds, not forms.** Contextual buttons that reveal one or two fields at a time. No big empty forms.
5. **Sales fields are visible to everyone with inquiry access** (Irene, Tanah, inquiry staff). Ad/marketing info stays marketing-viewer only.
6. **Never lose an inquiry or a webhook.** Same spirit as the PGRST204 fallback in `src/app/api/leads/route.ts`.
7. **Database changes** go in a new `supabase/*.sql` file, safe to run twice, ending with `notify pgrst, 'reload schema';`. Valentina pastes it into the Supabase SQL Editor herself. Tell her when.
8. **Tests** in `tests/*.test.cjs` (node --test, same style as existing). Run TypeScript and ESLint on changed files.
9. **Update the playbook** (`docs/lead-tracking-playbook/README.md`) after each step: what it does, setup at a new business, design decisions, gotchas. Plain English.
10. Don't push without Valentina's OK. Codex and Claude share this working tree, so stage explicit paths.
11. The local site saves to the **real** database and emails Irene. Don't submit test inquiries without asking.

## Step 3: Calendly → inquiry

**Valentina:** submits the form → thank-you page → books "Oct 8, 2 PM" in the embedded Calendly. Her inquiry shows **Consult: Oct 8, 2:00 PM** with no one typing. If she reschedules, it updates. If she cancels, it says canceled.

- LVD is on a **paid** Calendly plan, so webhooks are available. The account owner creates a personal access token (Calendly → Integrations → API & Webhooks). Store it as an env var; never commit it. Create a webhook subscription (organization scope) for `invitee.created` and `invitee.canceled`, with a signing key, and **verify the signature** on every request.
- Webhook route, e.g. `src/app/api/calendly/webhook/route.ts`.
- **Match the booking to the lead.** Best: pass the lead ID into the embed (Calendly's embed URL accepts `utm_*` params and returns them in the webhook's `tracking` object; also prefill name/email). `submitLead()` already returns `leadId`; get it to the thank-you page without putting personal info in the URL (e.g. sessionStorage). Fallback: match by invitee email to the most recent lead with that email. If nothing matches, still store the appointment unlinked so it can be linked later.
- New table, e.g. `lead_appointments` (lead_id nullable, Calendly event + invitee URIs unique, start/end time, status scheduled/canceled, rescheduled flag, outcome null/completed/no_show, raw payload, timestamps). A reschedule arrives as a cancel (with `rescheduled: true`) plus a new create; show only the current one.
- Show the next consult on the inquiry card and at the top of the detail panel.
- Log appointment events into `lead_activity` (extend the `kind` check) so the timeline shows them.

## Step 4: sales buttons after the call

**Valentina:** her consult time passes. Irene opens her inquiry and sees **Completed | No-show**. She clicks Completed → **Good fit | Not a fit** → (good fit) **Proposal sent: $____** → later **Booked: $____** or **Lost: reason**.

- Separate fields, e.g. on `leads` or a `lead_sales` table: `consult_outcome` (completed/no_show; or on the appointment row), `fit` (good_fit/not_fit), `proposal_amount`, `proposal_sent_at`, `sales_outcome` (booked/lost), `booked_amount`, `booked_at`, `lost_reason` (budget, no_response, went_with_someone_else, date_unavailable, wrong_service, other) + optional note.
- Keep `status` in sync: booked → `booked`; Good fit → `qualified`; Not a fit → `spam` (it's labeled "Not a Fit" in the UI); contact → `contacted`. Don't move a lead backwards by accident.
- Every action writes a `lead_activity` row with who and when.
- Allow undo / edit (a mis-click must be fixable).
- If there's no Calendly appointment (they called her directly), still allow "Mark consult completed".

## Step 5: "Needs attention"

**Irene:** opens the portal and sees what to do today instead of remembering it.

Small first version, a filter/view plus a count card:
- New inquiry not contacted yet (status new/reviewing)
- Consult today
- Consult time passed, no outcome entered
- Proposal sent, no booked/lost after 7 days

Clicking one shows those inquiries. Must work for owners, planners and inquiry staff.

## When you're done

Tell Valentina in plain English what each step does, using the Valentina walkthrough. List any SQL she must run and any env vars to set on the host (Calendly token, signing key). Leave step 6 (per-ad report: spend → inquiries → budgets → consults → proposals → bookings → $, marketing viewer only) for Claude.
