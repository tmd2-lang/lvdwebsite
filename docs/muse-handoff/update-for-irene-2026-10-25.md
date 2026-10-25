# Portal update for Irene and Muse — October 25, 2026

This supplements the earlier notes covering Builds 1–4. Keep their unfinished items on the ledger; the original ten-part brief is not fully complete.

## New since the previous update

### Build 5 — Inquiry-to-client conversion is implemented

- Owners and planners can convert an inquiry into a client. The form carries over names, contact details, date, venue, guest count and inquiry context.
- The studio chooses the planning package and design tier; saving opens the client's Checklist with the applicable tracks.
- The original inquiry stays linked. Repeat conversion opens the existing client, and matching email/phone details trigger a possible-duplicate warning.
- Conversion deliberately does not change the inquiry to Booked, because that is a separate studio action tied to advertising tracking.
- Still missing: automatic inquiry acknowledgment email and the extra sorting/filtering by inquiry value/date described in the brief.

### Build 7 — Studio calendar and alerts are deployed

- One studio-wide calendar combines wedding dates, open checklist deadlines and unpaid Budget payment dates.
- Month and agenda views; filters for client, service track, task owner, item type and search. Each item links to its source workspace.
- Alerts cover overdue tasks/payments, items due today through Sunday, and approval tasks actually waiting on the client. Undated approvals still appear.
- Existing checklist suggestions/manual dates and Budget records remain the source. There is no second calendar to maintain.
- Completed tasks, paid/waived payments and canceled budget lines are excluded. Suggested deadlines from unfinished historical client records can contribute to the overdue count.
- Studio access only. Email reminders, external calendar sync and per-person notification settings are not built. Payments come from Budget; this does not integrate Wave or issue invoices.

### Build 9 — Documents and gallery workflow are deployed

- New clients receive the chosen Welcome & Onboarding Packet PDF and planning clients receive the existing website Planning Investment Guide. Existing clients have an explicit Add standard documents action; it does not duplicate documents or restore intentionally removed ones.
- Design clients get a moodboard area in Images/Design. Moodboard checklist tasks open the Design album and preset uploads to that album.
- A studio-only Photographer gallery field lives in Overview. Saving a full gallery link completes LVD-116 in the same transaction. Clearing it undoes only an unchanged automatic completion, preserving later manual task edits.
- Saving a gallery link does not fetch or publish photographs. Couple-facing moodboard approvals, approval history and revision/reapproval rules are not built.
- TJ ran the required SQL migration. The database changes are active. Temporary verification records were removed. Tanah & Kaisa now keep the two real standard documents; the unrelated old audit PDF was moved to Removed at TJ's request.

## Release status

Builds 7 and 9 are committed, pushed and deployed to the production website in release `e4b55e9`. Vercel reported success. Authenticated live checks confirmed Calendar, standard document links, gallery-field readiness and the exact welcome PDF download. The Build 9 SQL is active. Production build, TypeScript, targeted lint, desktop/phone checks and all 82 automated tests passed, including isolated PostgreSQL integration tests.

## Irene's decisions applied — couple planning release

Release `41b50ac` is deployed. TJ applied `supabase/couple-planning-schema.sql`; live checks confirm the columns and private guest-edit function. Production build, TypeScript, targeted lint and all 88 automated tests pass, including isolated PostgreSQL integration tests.

- **Booked on:** optional actual booking date in client create/edit/Overview. Booking-relative deadlines now use it; business days skip weekends. Unknown dates stay blank. Kickoff-relative deadlines remain manual.
- **Checklist:** the couple sees Client-owned tasks and approval items with status/due date. Studio notes and floral production details are excluded on the server. This is viewing, not approval capture.
- **Guests:** the couple can add/edit/remove their own guests and households, including contact/address, RSVP, meals/access and travel. Studio seating remains read-only. Changes preserve internal notes and log relevant changes after final counts are locked; stale edits are rejected. Other existing invited family/guest memberships are read-only.
- **Timeline:** shared only after Confirm & share with couple, with Client Facing and Guest Facing cues. Drafts, internal notes, production, vendors and crew stay private. Editing withdraws sharing until reconfirmed. Existing timelines were not auto-published.
- **Budget:** remains studio-only.
- **Preview:** each studio client record has Preview couple portal, with the same filtered Checklist/Guests/Timeline and editing disabled.

## What remains

1. **Build 6 — code prepared, account setup pending:** read-only OAuth, explicit invoice/event/track matching, couple invoice views, Budget/Calendar projections, cumulative 40/70/100% milestones and overdue studio flags are implemented. Installments use actual signing/event dates, not Wave’s single invoice due date. No real Wave data has been accessed. Live validation of Irene’s examples waits for developer app credentials, eligible subscription and authorization of Lady Victoria Designs LLC. Studio signature verification and confirmation of the complete event invoice set gate automatic checklist completion. Refresh is daily/manual, not a live webhook. The TEST preview saves nothing. All 101 tests pass; setup instructions are in `wave-setup.md`. TJ must run the setup SQL and handle deployment verification.
2. **Build 9 moodboard approvals now implemented:** studio submits a saved version of selected visible Design images plus palette, furniture/inventory, florals, price/scope and change summary. Either partner can explicitly approve; name/time/version are recorded. Each new version requires approval. Production-only notes stay private and do not affect approval. Version history is retained; Design images can be removed but not permanently purged. Publishing/approval updates LVD-101 (not custom-rendering task LVD-102). No existing images are auto-submitted, no approval is inferred, and no automatic approval-request email is sent. TJ applied the SQL; deployment verification is in progress. Production build and all 91 tests passed.
3. **Build 8 — team access:** deferred by TJ. Detailed roles, per-client assignments and My tasks remain.
4. **Earlier-build second passes:** checklist custom tasks/exports; Budget Change & Approval Log, comparison/export and remaining overdue handling; timeline specialty sheets/vendor extracts/checklist links; public online RSVPs with studio confirmation, thank-you printing and remaining guest checklist links; shared locked guest counts across Budget/Timeline; inquiry acknowledgment email and value/date sorting. Calendar email reminders/external sync remain later.
5. **Build 10 — marketing:** skipped for now; unfinished pages remain owner-only.

No further Irene decision is needed for the rules above; her two emails supplied by TJ are authoritative. The full ledger is in `notes.md`.
