# Portal update for Irene and Muse — October 25, 2026

This supplements the earlier notes covering Builds 1–4. Keep their unfinished items on the ledger; the original ten-part brief is not fully complete.

## New since the previous update

### Build 5 — Inquiry-to-client conversion is implemented

- Owners and planners can convert an inquiry into a client. The form carries over names, contact details, date, venue, guest count and inquiry context.
- The studio chooses the planning package and design tier; saving opens the client's Checklist with the applicable tracks.
- The original inquiry stays linked. Repeat conversion opens the existing client, and matching email/phone details trigger a possible-duplicate warning.
- Conversion deliberately does not change the inquiry to Booked, because that is a separate studio action tied to advertising tracking.
- Still missing: automatic inquiry acknowledgment email and the extra sorting/filtering by inquiry value/date described in the brief.

### Build 7 — Studio calendar and alerts are built and tested locally

- One studio-wide calendar combines wedding dates, open checklist deadlines and unpaid Budget payment dates.
- Month and agenda views; filters for client, service track, task owner, item type and search. Each item links to its source workspace.
- Alerts cover overdue tasks/payments, items due today through Sunday, and approval tasks actually waiting on the client. Undated approvals still appear.
- Existing checklist suggestions/manual dates and Budget records remain the source. There is no second calendar to maintain.
- Completed tasks, paid/waived payments and canceled budget lines are excluded. Suggested deadlines from unfinished historical client records can contribute to the overdue count.
- Studio access only. Email reminders, external calendar sync and per-person notification settings are not built. Payments come from Budget; this does not integrate Wave or issue invoices.

### Build 9 — Documents and gallery workflow are built and tested locally

- New clients receive the chosen Welcome & Onboarding Packet PDF and planning clients receive the existing website Planning Investment Guide. Existing clients have an explicit Add standard documents action; it does not duplicate documents or restore intentionally removed ones.
- Design clients get a moodboard area in Images/Design. Moodboard checklist tasks open the Design album and preset uploads to that album.
- A studio-only Photographer gallery field lives in Overview. Saving a full gallery link completes LVD-116 in the same transaction. Clearing it undoes only an unchanged automatic completion, preserving later manual task edits.
- Saving a gallery link does not fetch or publish photographs. Couple-facing moodboard approvals, approval history and revision/reapproval rules are not built.
- TJ ran the required SQL migration. The database changes are active. Temporary verification records were removed. Tanah & Kaisa now keep the two real standard documents; the unrelated old audit PDF was moved to Removed at TJ's request.

## Release status

Builds 7 and 9 are verified in the local portal. Their code has not yet been committed, pushed or deployed. The active Build 9 SQL is not a substitute for deploying its matching application code. Production build, TypeScript, targeted lint, desktop/phone checks and all 82 automated tests passed, including isolated PostgreSQL integration tests.

## What remains

1. **Release Builds 7 and 9:** review, commit, push, deploy, and check the live site.
2. **Build 6 — invoices:** waiting on Irene's Wave-versus-portal decision. The Budget can already make 40/30/30 payment schedules, but invoice/payment-link integration, paid-status syncing, automatic payment-task completion, late-fee and pause-work handling remain.
3. **Build 8 — team access:** deferred by TJ. Detailed staff roles, per-client assignments and a My tasks view remain. Basic owner/planner/inquiry-staff access already exists.
4. **Build 9 approval work:** couple-facing moodboard approval, who approved which version and when, and reapproval after changes.
5. **Couple-facing views:** Checklist, Budget, Timeline and Guests remain studio-only, pending Irene's visibility/editing decisions. Existing document/image sharing is separate from these unfinished views.
6. **Earlier-build second passes:**
   - Checklist: custom client tasks, exports, and a booking-date field for booking-relative deadlines.
   - Budget: Change & Approval Log, Vendor Comparison, print/export and invoice connections.
   - Timeline: specialty sheets, per-vendor extracts/sharing, couple distribution and remaining checklist links.
   - Guests: online RSVPs plus studio confirmation, couple access/editing, thank-you-list printing, remaining checklist links and logging unseating when a whole table is removed.
   - Shared counts: connect the locked final guest count to Budget per-guest calculations and the Timeline's locked count, as requested in the original brief.
   - Inquiries: acknowledgment email and additional value/date sorting/filtering.
7. **Build 10 — marketing:** deliberately skipped for now. Its unfinished pages remain owner-only; data integration/upload processing is still outstanding.

## Decisions needed from Irene

- Keep Wave as the invoice system of record, or move invoicing into the portal?
- Checklist: should couples see their own tasks plus approval tasks, with status/due dates and no internal notes?
- Budget: should couples see it, and which amounts/fields?
- Timeline: when should the couple receive it, and should distribution require a confirmed version?
- Guests: may couples view/edit their list, and which fields? Should online replies require studio confirmation before affecting counts?
- Moodboards: who approves, is one partner's approval sufficient, and which changes require a new approval?

The main immediate dependencies are deployment and the invoice/visibility/approval decisions. Team access can wait as TJ requested.
