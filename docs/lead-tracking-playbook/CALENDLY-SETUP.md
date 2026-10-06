# Step 3: Design Consultation → inquiry

Live October 6, 2026 on the confirmed production project: `https://vercel.com/tjdozier98-1658s-projects/lvdwebsite` (project `prj_Fg3L7PV0HMdAVHLTZkvd4Sl2xxLx`). Production deployment: `dpl_9mk8pG6WbNC2tAWuE5YxMbAUG3gL`, commit 8091394.

The Supabase migration is applied. The replacement Calendly token has webhook access, and the organization-scope subscription for invitee.created / invitee.canceled is registered at `https://www.ladyvictoriadesigns.com/api/webhooks/calendly`. Only the configured Design Consultation event type is persisted.

Live readiness checks pass: unsigned request rejected with 401; signed connection check acknowledged with 200 / ignored; appointment refresh endpoint rejects unauthenticated access with 401. Connection checks create no appointments or notifications. A real booking → reschedule → cancellation test has not yet been performed.

Earlier environment updates targeted a duplicate project at `lady-victoria-designs/lvdwebsite`. The correct live project was subsequently confirmed by its verified www domain, and its existing database settings were retained. No DNS changes were required or made. Use the confirmed production project above for future updates.

Valentina submits an inquiry, then books at https://calendly.com/ladyvictoriadesigns/design-consultation. Her inquiry card and detail panel show the consultation time in Eastern time, including EST/EDT. Rescheduling replaces the displayed appointment; cancellation marks it canceled. Calendly writes an activity entry. Nothing automatically marks a lead contacted, qualified, booked, completed or no-show.

## Activation

1. Run `supabase/lead-appointments-schema.sql` in the Supabase SQL editor. Prerequisites are the existing leads and lead activity migrations. The migration is transactional and can be rerun.
2. The Calendly organization owner/admin creates a personal access token with access to event types, scheduled events, users and webhook subscription management. Put it in `CALENDLY_API_TOKEN` in the local environment and Vercel's production environment. Do not paste tokens in chat or commit them.
3. Generate a random signing key of at least 32 characters (a password manager can generate it). Set `CALENDLY_WEBHOOK_SIGNING_KEY` locally and in Vercel. This must be the exact same value used to create the subscription.
4. Run read-only discovery: `node --env-file=.env.local scripts/setup-calendly.mjs`. It locates the exact Design Consultation scheduling URL in the token's organization and prints its API event type URI. Set that value as `CALENDLY_DESIGN_CONSULTATION_EVENT_TYPE_URI` locally and in Vercel. This is an API URI, **not** the public booking URL. Missing configuration returns 503 rather than accepting unrelated bookings.
5. Deploy this change with those production environment variables present.
6. Locally set `CALENDLY_WEBHOOK_URL=https://www.ladyvictoriadesigns.com/api/webhooks/calendly`. Run `node --env-file=.env.local scripts/setup-calendly.mjs --subscribe`. This explicitly creates one organization-scope subscription for `invitee.created` and `invitee.canceled`. The application filters deliveries to the exact Design Consultation event type. Existing subscriptions at that callback are inspected instead of duplicated; an existing signing key must be confirmed manually.
7. Verify with an explicitly approved test inquiry and test consultation: book, reschedule and cancel. Check the portal and `lead_appointments`; verify other event types are ignored. A live inquiry submission emails the studio, so coordinate this test first. No production submissions were made during implementation.

## Data flow and matching

- A successful `/api/leads` response supplies the inquiry UUID. `submitLead()` stores it with name/email in browser **sessionStorage** for at most 24 hours. Storage denial never prevents submission. Contact information is passed as Calendly prefill; only the opaque UUID is added to `utm_content=lvd_lead_UUID` in the embed and full-screen fallback link.
- Calendly sends its signed webhook, independent of whether the visitor keeps the website open. The server verifies HMAC SHA-256 against the exact body and rejects timestamps outside a three-minute window. Actual streamed body size is capped at 1 MiB.
- The payload's scheduled event supplies the event type and times. If those details are absent, the server fetches the event using the token, restricted to canonical `api.calendly.com/scheduled_events/...` resources.
- SQL first preserves an existing link. Otherwise it matches the tagged inquiry UUID **and email**, then the prior rescheduled invitee with the same email, then the latest inquiry with that email created before the delivery's occurrence time. Multiple inquiries sharing an email therefore use the latest eligible one when there is no ID tag. Changed email and cross-device bookings can remain unmatched.
- `sync_calendly_appointment` atomically stores the delivery receipt/raw payload, upserts the appointment and adds the activity. Duplicate deliveries have no duplicate activity. Canceled invitee URIs cannot be resurrected by late created events. Reschedule deliveries work in either order; a replacement can inherit the prior link later.
- Invitee URI is unique, event URI is not: multiple invitees can share a group event. Old canceled appointments remain stored; the portal prioritizes a scheduled appointment, then a non-rescheduled cancellation. If a replacement has not arrived yet it shows “awaiting replacement.”
- Cards and details refresh consultation data every 60 seconds while the portal is visible. Reload shows it immediately after processing. Activity history reloads with the page. Existing status controls, notes, personal read state and marketing-only attribution stay intact.

## Tables and access

`lead_appointments`: nullable `lead_id`, unique `invitee_uri`, `event_uri`, `event_type_uri`, `invitee_email`, `starts_at`, `ends_at`, `status`, `rescheduled`, `old_invitee_uri`, `new_invitee_uri`, nullable `outcome`, `match_method`, source/created/updated timestamps. `outcome` is reserved for completed/no_show in step 4; no outcome controls are added here.

`calendly_webhook_events`: unique delivery digest, receipt time and full raw payload. Raw payloads can contain contact details and cancellation/reschedule URLs. Both new tables have RLS and are accessible only with the service role. The authenticated portal endpoint returns only safe appointment display fields, never raw payloads, invitee emails or cancellation links. Lead deletion detaches appointments rather than erasing their history; consider these tables in any future retention/deletion process.

`lead_activity`: adds appointment_scheduled, appointment_canceled and appointment_rescheduled kinds, actor “Calendly,” and consultation start time as detail. The existing staff mutation RPC still rejects these kinds.

## Operations and limits

- Before activation, the portal reports consultation data unavailable if the table is absent. The rest of inquiry management remains usable.
- API lookup/database errors return 503 and never acknowledge persistence. Calendly retries failed deliveries within its own retry policy; inspect webhook subscription state and host logs if synchronization stops. If retry delivery is exhausted, recover the event from Calendly and resend through the trusted server normalization + RPC path; no public unsigned replay endpoint exists.
- Unmatched bookings are retained. Inspect them in the SQL editor with `select id, invitee_email, starts_at, status from public.lead_appointments where lead_id is null order by created_at desc;`. There is no planner UI for manual linking in step 3. An administrator can verify identity and update `lead_id` in Supabase; do not infer identity from names alone.
- No historical Calendly import is performed. No-show, completed call, fit, proposal amounts, revenue and lost reasons remain later steps. A past scheduled time is not evidence that a call happened.
- Booking after 24 hours, another device, private browsing or cleared storage uses email fallback. Booking with a different email may require manual linking. Unmatched appointments are not shown on an arbitrary lead.

## Validation

Validation passed: TypeScript, targeted ESLint, 41 tests (including isolated PostgreSQL migration checks), and a production build with `npm run build -- --webpack`. The default sandboxed Turbopack build stalled and was stopped; the webpack production build completed. PostgreSQL tests use a temporary PGlite install outside the repository and never connect to live Supabase. They exercise repeat migration, duplicate deliveries, cancellation-before-create, reschedule links in both orders, email fallback, unmatched preservation, transaction rollback, permissions and unchanged sales status.

Run regular tests: `node --test tests/*.test.cjs`. The SQL test is skipped unless `LVD_PGLITE_MODULE` points to an installed `@electric-sql/pglite` module; run it with that environment variable to exercise the database transaction.

## Official references

- [Calendly embed prefill and UTM parameters](https://developer.calendly.com/api-docs/overview/embedding/recipes)
- [Webhook signature verification](https://developer.calendly.com/api-docs/overview/webhooks/webhook-signatures)
- [Create webhook subscription](https://developer.calendly.com/api-docs/calendly-api/webhooks/create-webhook-subscription)
- [Reschedule delivery behavior](https://developer.calendly.com/docs/api-guides/see-how-webhook-payloads-change-when-invitees-reschedule-events)
