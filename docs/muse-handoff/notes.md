# Studio Portal Build: Running Notes for Muse

Written for Irene's Muse, from TJ's side, so it can see what has been built from the `planning-checklist-portal` package, what changed from the brief, and what is still waiting on a decision. Newest entries go at the top of the log. Build numbers match `TJ-BACKEND-BUILD-BRIEF.md`.

---

## At a glance

| Build | What it is | Status |
|---|---|---|
| 1 | Planning Checklist tab | **Live, including couple view.** Studio checklist remains the source. |
| 1b | Checklist replaces the old Tasks tab | **Done.** Tasks is hidden, not deleted. |
| 2 | Budget tab | **Live (studio only).** Change log, vendor comparison and export not built yet. |
| 3 | Event-day Timeline tab | **Live, including confirmed couple sharing.** Specialty sheets and vendor extracts remain. |
| 4 | Guests, RSVP & Hospitality tab | **Live, including couple view/edit.** Public online RSVPs remain later. |
| 5 | Inquiry → client conversion | **Live.** Auto-acknowledgment email and sorting inquiries by value not built yet. |
| 6 | 40/30/30 invoice schedule | **Decision settled: Wave remains the invoice system.** Wave sync is next; integration is not built. |
| 7 | Studio calendar + alerts | **Deployed and verified.** Month/agenda, filters, in-portal alerts. Email reminders not built. |
| 8 | Team logins + roles | **Deferred by TJ.** Detailed team roles, per-client assignments and My tasks are not built. Existing owner/planner/inquiry-staff access remains. |
| 9 | Documents / images finishing | **Deployed and verified; SQL active.** Default documents, Design album links, photographer gallery + checklist sync. Versioned couple approval flow implemented; deployment in progress. |
| 10 | Marketing dashboard data | **Skipped for now.** Only studio owners can open those pages, so nobody outside the studio sees the unfinished parts. |

## Irene's confirmed decisions (emails supplied by TJ, Oct 25)

- Couples see Client-owned checklist tasks and approval items, with status/due date; no studio notes or floral production details.
- Working budget remains studio-only. Couple amounts owed will come from the Wave invoice schedule.
- Only explicitly Confirmed timelines are shared, with Client Facing and Guest Facing cues. Drafts stay private.
- Couples can view/edit their own guest list. Public guest RSVP intake and studio confirmation are a later pass.
- Record actual Booked on dates; never infer them from account creation.
- Wave is the sole home for money: issue invoices there; future portal sync links Budget lines to Wave invoices, reads payment status, sends payment links to Wave, completes payment tasks, and flags overdue from Wave due dates.
- Either partner's explicit moodboard approval suffices, with who/when recorded. Reapproval for palette, furniture/inventory, florals or price; production details inside the approved design do not require it.

## Still to build

Wave invoice integration (Build 6); team roles/assignments/My tasks (Build 8, deferred by TJ). Public guest RSVPs remain later. Earlier second-pass items (budget change log/comparison/export, timeline specialty sheets/vendor extracts/checklist links, calendar email reminders, inquiry auto-acknowledgment) are not included in the current release. Build 10 remains skipped.

---

## Log

### Oct 25, 2026: Build 9 moodboard approvals

**Irene’s rule implemented:** either Client or Partner membership may explicitly approve; one is sufficient. Family/Guest members cannot approve. The checkbox and approval action identify the exact version; API derives client/user/name from the portal session and SQL rechecks membership and latest version. Viewing, messages and silence never count. Name/time/version are retained, with previous versions and their approvals available in history.

**Studio workflow:** Images → Manage moodboard approvals. Upload/select visible Design images, enter palette, furniture/inventory, florals, price/scope and a couple-facing change summary, then Share version for approval. Each submission is a new saved snapshot. Design changes must go through a new version, requiring reapproval; image library uploads/removals do not silently change previously submitted snapshots. Studio-only production notes are separate and do not require approval or change the version. No automatic email is sent.

**Checklist:** LVD-101 is the moodboard task. Publishing sets it Waiting on client; explicit approval completes it atomically while preserving owner/date/notes. LVD-102 is custom renderings and is untouched. The initial SQL handoff mistakenly named 102; corrected before any board was submitted and TJ was asked to rerun the corrected repeatable migration.

**History/files:** snapshot image paths and captions are retained and signed privately. Design images can be soft-removed/restored but permanent purge is refused, preventing loss of signed-off images. Approval data is server-projected without storage paths, user IDs, studio actors or production notes. No existing gallery images are auto-submitted or approved. Studio has a read-only Moodboard couple preview.

**Migration:** `supabase/moodboard-schema.sql`, manual execution by TJ; contains private RLS tables, service-only publishing/approval functions, and retained-image guard. Existing client images/checklist schemas are prerequisites.

**Checks:** production build and targeted lint passed; all 91 tests passed, including isolated PostgreSQL integration tests for repeatable migration, no inferred approval, either-partner approval, idempotence, cross-client and stale-version rejection, checklist sync, retained history, production-note isolation and role restrictions. Browser verified the studio editor on desktop/phone, empty moodboard state and missing-setup handling. TJ applied the migration and then the short `moodboard-checklist-fix.sql` after a full-script retry reported a syntax error. Live checks verify all three tables and both functions are installed. Deployment verification is in progress. No real client board/approval was created for testing.


### Oct 25, 2026: Irene's approved couple planning views and Booked on

**Implementation:** client creation/edit and Overview now include an optional Booked on date. Booking-relative checklist suggestions use that date (business days skip weekends); saved manual due dates win. Kickoff-relative deadlines remain manual because no kickoff date is recorded. No historical booking dates were invented.

Couple Checklist replaces the legacy Tasks page, showing only Client-owned tasks or approval items. Explicit Design & Floral decision items are allowed; recipes, rigging and production plans stay private even if a source approval flag is present. Server projections send only title, phase, status and dates; never notes, dependencies or actors. The working Budget remains studio-only. This is a viewing release, not a new approval-capture workflow.

Couple Guests supports their own guests/households, contact/address, RSVP, meals/allergies/access and travel, with search/filter. Client and partner memberships can edit; other existing invited memberships are read-only. Seating assignments are visible but edited by the studio. Studio notes, response provenance, internal settings and locked-count exception logs are not sent. API derives client and actor from session; database merges patches without replacing private fields, rejects stale edits, validates own household references, and atomically logs final-count changes. This is couple-entered RSVP, not a public guest response form.

Timeline requires a separate **Confirm & share with couple** action. Only Client Facing + Guest Facing cues appear; vendors, crew, production, internal notes and canceled cues stay out. Any subsequent save withdraws sharing pending confirmation again. The database fingerprints the confirmed content so old application writes also invalidate sharing. Existing timelines are not silently published.

Studio records have **Preview couple portal** with read-only Checklist/Guests/Timeline, using the same server projections. Tanah & Kaisa has no guest rows currently, so its preview correctly starts empty.

**Migration:** `supabase/couple-planning-schema.sql`, applied by TJ (reported “ran it”). Adds optional booking date, timeline confirmation metadata/guard and service-only guest mutation RPC. Repeatable; no existing clients/timelines backfilled or published.

**Validation:** production build, TypeScript, targeted lint; all 88 automated tests pass including real PostgreSQL/WASM migration twice, privacy projections, session scoping/actor, membership restrictions, guest merge/conflict/locked-count audit, timeline withdrawal and date arithmetic. The existing resource test's simulated clock now advances monotonically to avoid same-millisecond WASM timestamps hiding a manual edit. Browser verified Tanah & Kaisa’s filtered checklist, empty guest list and unpublished timeline state. Live migration checks passed (booking/confirmation columns and installed guest RPC, without writing client data). Release `41b50ac` pushed to main; Vercel reported success. Authenticated production preview verified the filtered checklist, empty guest state and withheld unpublished timeline. Actual couple-session guest writes were verified by route and isolated SQL tests, not by adding records to a real couple’s production list. Automated guest writes use an isolated database; no real guest records were added.


### Oct 25, 2026: Builds 7 and 9 deployed to production

At TJ's request, committed all Build 7/9 code, tests, the bundled welcome PDF, migration and handoff notes in `e4b55e9069945152a315c62ceaf963aa3025d5bf` and pushed `main`. Vercel reported deployment success: `https://vercel.com/tjdozier98-1658s-projects/lvdwebsite/4BKiciLMGBSdGPDAZzp4Rrq6cG2K`. Final production build and all 82 tests passed before the push. Unrelated pre-existing untracked workspace files were not included.

TJ signed in on the production domain for authenticated verification. Confirmed the live Calendar route and navigation, the two retained standard documents on Tanah & Kaisa, the audit's absence from active documents, the enabled gallery field without a setup error, and the Planning Investment Guide link opening its intended page. Downloaded the welcome PDF through the live authenticated route and checked its SHA-256 against the bundled asset: exact match. No production test data was added during these release checks.

**Muse follow-up received:** Muse says Irene already answered couple visibility and timeline sharing in an email; the contents of that email are not yet available in this chat. Muse recommends Wave as the sole invoice system of record, with the portal showing synced status, and explicit approval by either partner with reapproval for palette, furniture/inventory, floral or price changes. These were presented as recommendations awaiting Irene's acceptance; do not silently treat them as confirmed implementation decisions. Build 8 remains deferred by TJ.

### Oct 25, 2026: Audit PDF removed at TJ's request

Moved Tanah & Kaisa's pre-existing `Sep 2 LVD Audit.pdf` to Removed through the normal document controls. This is a recoverable soft removal, not a storage purge. The Welcome & Onboarding Packet and Planning Investment Guide remain attached for ongoing use.

### Oct 25, 2026: Standard documents retained on Tanah & Kaisa

After the verification cleanup, the walkthrough showed only Tanah & Kaisa's pre-existing `Sep 2 LVD Audit.pdf`, which confused TJ. Used the real **Add standard documents** action to attach the Welcome & Onboarding Packet and Planning Investment Guide to this existing client for ongoing use, verified both in the interface, and left them in place. These are now real client resources, not disposable test records. The audit PDF was already present before Build 9 and remains untouched; its original purpose/uploader was not investigated.

### Oct 25, 2026: Build 9, Client documents and post-event resources (local implementation)

**Defaults confirmed by TJ:** use the existing welcome PDF from `docs/onboarding-packet/lady-victoria-client-welcome-packet.pdf` and the website's current `/planning-guide`. The PDF is copied unchanged into `src/assets/client-documents/welcome-packet.pdf` so it ships with the app; both authenticated document routes include it in their production file traces. The source PDF remains unchanged.

**Standard documents:** `supabase/client-resources-schema.sql` adds a source key to the existing Documents records, preserves the four document categories, and installs a new-client trigger. New clients receive a Welcome & Onboarding Packet reference and planning clients receive a Planning Investment Guide reference in their Documents list. Every current client has a planning package. Existing clients are not silently backfilled; **Add standard documents** in their Documents tab explicitly fills missing defaults. The unique client/source key prevents duplicates and repeat calls respect soft-removal. Removing/restoring standards uses the existing document controls. Standards do not have private storage objects, so purging one never deletes the shared PDF. The welcome PDF still requires a scoped document record and an authenticated studio or client session; the guide opens the existing shared-by-link page. Uploaded documents keep their existing signed-storage download path.

**Photographer gallery:** a studio-only field in the client's Overview stores the full HTTPS gallery address for later portfolio/website work. It is intentionally in a separate, RLS-protected `client_post_event` table because client-portal sessions read the `clients` row with `select=*`. The couple is never sent this gallery record. Saving a link and completing checklist task LVD-116 happen in one database function/transaction; existing owner, due date and notes are preserved. Clearing a link undoes only an unchanged automatic completion: it restores the earlier task status or removes an override created by this feature. A task already complete, or manually edited after the automatic completion, is left intact. Saving does not fetch gallery contents or publish photographs.

**Design/moodboard organization:** design clients open Images on Design and get a moodboard area linked to that album. Moodboard checklist tasks LVD-101 and LVD-102 open Design and preset the upload album. LVD-116 opens Overview, where the gallery field lives. Client-facing approval, revision history and automatic moodboard completion are deferred pending Irene's decision.

**Files:** `client-resources-view.ts` contains shared types and gallery validation; `client-resources-data.ts` makes server-only reads/RPC calls; `/api/admin/client-resources` validates owner/planner access, client existence and input, and takes the actor only from the session. `PostEventPanel.tsx` renders the gallery field. The existing Documents/Images/Checklist panels and document download routes are extended in place.

**Verified so far:** production build, TypeScript and targeted lint; welcome PDF byte-for-byte match and presence in both deployment traces; 82 automated tests passed with the temporary PostgreSQL/WASM test runtime (including both SQL integration suites). The new integration test applies the migration twice, exercises automatic/deduplicated defaults and soft removal, verifies source constraints, tests gallery completion/clear/manual-edit preservation and rollback on invalid links, and verifies private role restrictions. Route tests check authorization before reads/writes, client-scoped document lookup, fixed default destinations and session-derived actor identity. Browser verified the existing client workspace, default-document action, moodboard-to-Design navigation/upload preset, and migration-not-installed handling.

**SQL activated and end-to-end verification complete:** TJ ran `supabase/client-resources-schema.sql` in Supabase SQL editor and Codex confirmed the new table/functions were active. On Tanah & Kaisa, snapshotted the existing records, attached the two defaults through the real Documents button, repeated the action and confirmed exactly one of each, then saved `https://example.com/TEST-build-9-gallery` through Overview. Confirmed the stored link and LVD-116 Complete in both the database and Checklist UI. Cleared it through the same form and verified the automatically created task override was removed, restoring the original task state. The welcome route returned HTTP 200, `application/pdf`, and `private, no-store` (the embedded browser's PDF preview itself remained blank); the guide opened the existing Planning Investment Guide page. A disposable TEST client received both documents automatically on insertion, and repeated attachment did not duplicate them. The new Overview/Documents controls were checked at 390px with no horizontal overflow.

**Cleanup:** removed only the document references added during verification, the newly created empty post-event test record, and the disposable TEST client (with its two references). Checked that Tanah & Kaisa's original document IDs and gallery-request task state matched the snapshot. No original files, client details, or images were changed, and no emails or gallery photographs were sent/published. Existing clients still need an explicit Add standard documents action when the studio wants those defaults kept. Code remains local: nothing in this entry has been committed, pushed or deployed by Codex.

### Oct 25, 2026: Build 7, Studio calendar and deadline alerts (local implementation)

**What the studio can open locally now.** A **Calendar** entry in the portal sidebar and mobile navigation, at `/admin/portal/calendar`. It brings together every non-archived client's wedding date, open checklist deadlines, and unpaid Budget payments. Owners and planners can open it. Inquiry-only staff are redirected before any calendar records are fetched; couples have no access to this studio page.

- **Month view:** Monday-first calendar, previous/next month, month picker and Today. On larger screens each day previews up to three items with a more button. On a phone it shows counts and type indicators; tapping a day opens that day's list below. The selected day also works in Agenda.
- **Agenda:** dated items for the chosen month, with client, task title or payment, track, task owner, status and suggested-date label. Each item opens the client's Overview, Checklist or Budget tab. Lists over 40 items have a Show more button.
- **Filters:** client, track (Planning Core / Design & Floral / Shared & Other), task owner, item type and search. Wedding dates and payments have no task owner; payer is not treated as an assigned team member. Filters apply to the calendar, agenda, undated list and alert counts together.
- **Three clickable alerts:** overdue tasks and payments, due this week (today through Sunday), and waiting on couple approval. Alerts span all dates, independent of the month selected. An approval alert requires both the template's approval flag and the task's Waiting on client status; merely requiring an eventual approval does not trigger it. Undated approvals are included.
- **One source for dates:** checklist dates reuse `buildChecklist` and `effectiveDue`, including wedding-relative suggestions and manual overrides. Nothing is written into a separate calendar. Open tasks with no date are listed in a collapsible section, with links to set their dates in the source workspace.
- **Payments:** read from the existing Budget schedule, with the outstanding balance shown. Fully paid, waived, orphaned payments and payments on canceled lines are excluded. Disputed payments remain visible in the schedule but do not trigger automatic overdue/due-this-week alerts. Past wedding dates remain available as history and never count as overdue.
- **Date boundaries:** studio Today and alert boundaries explicitly use `America/New_York`, independent of the host timezone. Dates render as calendar days rather than shifting through UTC. The day updates every minute while open.
- **Refresh:** Refresh schedule fetches current source records. Editing still happens in the client workspace; refresh the calendar after edits. No email, invoice issuance, late-fee charging, reminders sent to clients, or Wave integration was added.

**Implementation:** `src/lib/calendar-data.ts` reads minimal fields from the existing clients/checklist/budget tables, with pagination past database row caps. Studio notes and guest details are not fetched. `src/lib/calendar-view.ts` holds the shared aggregation, date and filter logic. `src/app/admin/portal/calendar/` contains the authenticated page, interactive panel and styles. There is **no new SQL migration and no save route** because this build only reads existing records. Partial read failures show an explicit incomplete-schedule warning; a failed checklist load never manufactures a fresh list of unfinished template tasks.

**Tested:** production build, TypeScript, targeted lint, and 11 automated calendar tests (plus the existing suite: 75 passed, 1 existing SQL integration test skipped). Tests cover source merging, suggested versus manual dates, archived/complete/N/A exclusions, partial and waived/canceled/disputed payments, approval gating, intersecting filters, date/week/year/DST boundaries, pagination, incomplete loads, and unauthenticated/inquiry-staff access denial before reads. Browser checked at desktop (1280px), phone (390px), and the normal narrow browser panel: month/agenda, day selection, wedding dates, owner/track/type/client/search filters, correct source-tab navigation, no phone horizontal overflow, and no console errors.

**Tanah & Kaisa TEST verification:** inserted two new checklist overrides (only tasks with no existing saved row) and a clearly labeled TEST budget line/payment. Verified an overdue task, an approval due today, a $1,000 payment with $250 recorded paid showing $750 remaining, then used the real Budget Mark paid action and Checklist Complete action and verified both dropped out of their calendar alerts. Removed the exact test override rows and budget line/payment afterwards, confirmed their removal, and left all pre-existing client records unchanged.

**Still separate:** Build 6 waits on Irene's Wave-versus-portal decision. Email reminders, per-person notification preferences, external calendar sync, and future per-client team assignments are not part of this first calendar version. The existing records include past weddings with unfinished template tasks, so suggested historical deadlines contribute to the overdue count until the studio completes or marks those tasks not applicable. This entry records a local implementation; it has not been committed, pushed or deployed by Codex.

### Oct 25, 2026: Build 5, Convert an inquiry to a client

**What the studio sees now.** On any inquiry, owners and planners get a **Convert to client** button next to Email and Call. (Inquiry staff do not, since they cannot create clients.)

- It opens the New Client form **already filled in from the inquiry**: names (a name like "Valentina & Marco" is split into the two partners), email, phone, wedding date (left empty if their date was undecided), venue and guest count. The notes are pre-filled with what they asked about, their budget range and their vision, so that context travels with the client.
- The studio checks the details, **chooses the planning package and design tier**, and saves. The inquiry form only asks about design services and a budget range, which do not map reliably to a package, so the person converting chooses.
- Saving goes **straight to the new client's Checklist**, with the right tracks already on (a design tier switches on the Design & Floral track).
- **The client stays linked to the inquiry.** Pressing Convert on an inquiry that is already a client just opens that client; it can never be converted twice.
- **Duplicate check:** if an existing client already has the same email (ignoring capitals) or the same phone number, the form shows "Possible duplicate" with a link to that client before anything is saved.

**Deliberately not done:** converting does **not** change the inquiry's status. Moving an inquiry to "Booked" sends a booking signal to Meta for ad tracking, so that stays a deliberate click by the studio.

**Not built yet (from the brief):** the automatic "we got your inquiry" email to new leads, and extra sortable fields on the inquiry list (by value and date).

**On Build 10 (marketing):** the unfinished marketing pages are owner-only. Couples, planners and inquiry staff cannot open them, so we are leaving them as they are.

**Tested:** the button on a test inquiry, every pre-filled field, saving with a design tier, landing on the Checklist with both tracks, pressing Convert a second time (opens the existing client), a second save refused, the duplicate warning, and the plain New Client form unchanged. The test inquiries and test client were removed afterwards.

### Oct 25, 2026: Build 4, Guests, RSVP & Hospitality tab is live (studio only)

**What the studio sees now.** Every client record has a **Guests** tab, after Timeline, built from `guests-tracker.html`, `guests-data.json` and `GUESTS-INTEGRATION.md`.

**One record per guest, as the package asked.** Every workbook sheet is now a filtered view of the same records, so counts cannot drift:

- **Guests:** the full list, searchable.
- **RSVP follow-up:** Awaiting Response, plus anyone marked Follow-Up Needed or Contacted, with source, last outreach and method.
- **Meals & access:** attending guests only: meal, dietary, allergen, accessibility, highchair, table.
- **Events:** a tick-box grid of guests against the events this celebration has (chosen under Setup & events from the package's 8 events), with a total per event.
- **Travel & hotels:** guests with a hotel status, a shuttle or VIP vehicle, or an arrival date.
- **Seating:** tables with type, zone and capacity; seated and open counts are worked out from the guests, never typed. A table over capacity shows in red. Removing a table unseats its guests.
- **Households:** formal name, primary contact, full mailing address, invitation status, and the guests in each.
- **Caterer handoff:** attending guests only, with meal, dietary, severe allergy, allergen, accessibility, highchair and table. Nothing else (no phones, emails or addresses). It downloads as a CSV or prints, and it is labeled "Final count (locked)" once counts are locked. The CSV is protected so a spreadsheet will not run anything typed into a cell.

**The guest record** has every field from the package: identity and household, side, type, VIP, relationship, contact; invitation, RSVP, RSVP date, Response Source, plus-one; meal, dietary, severe allergy, allergen, accessibility, mobility, sensory, service animal, highchair; table; per-event attendance; arrival, flight, departure, hotel, property, room, transport, route, welcome gift and delivery; follow-up status, last outreach, method; gift received, thank-you sent; notes.

**Top numbers (the exception-led dashboard):** guests, attending, awaiting response, declined, children attending, severe allergies, attending with no meal, attending with no seat, hotel pending, needs shuttle, follow-ups open, highchairs. Problems show in red.

**Counts Locked:** a Lock counts button. While locked, changes still save, but any change to an **attending** guest's RSVP, meal, seat, severe allergy, allergen, dietary or highchair (or adding or removing an attending guest) is written to a "changes since counts were locked" log with who, when, and from → to. Tested: changing a locked guest's meal was logged; editing a phone number on a guest who is not attending was not.

**Setup & events:** RSVP deadline, invitation capacity, venue capacity, lead planner, caterer final count due, and which events this celebration has. Couple, date and venue come from the client record.

**Not built yet:** online RSVPs from the couple's guests (and the "studio confirms an online reply before it counts" step), the couple seeing their own list in their portal, printing the thank-you list, and linking checklist tasks (LVD-010, 048, 058, 059, 060, 070, 073) to this tab. One small gap: unseating guests by removing a whole table is not written to the locked-counts log.

**Tested:** adding a household, a table and four guests, every count, every view, ticking an event, a table over capacity, locking and the change log, the handoff contents, removing a table, reload, and every view at phone width. All test data was removed afterwards.

### Oct 25, 2026: Build 3, Event-Day Timeline tab is live (studio only)

**What the studio sees now.** Every client record has a **Timeline** tab, after Budget, built from `timeline-tracker.html`, `timeline-data.json` and `TIMELINE-INTEGRATION.md`. It has six views:

- **Run of show:** the 27 seeded cues, in time order. The day runs past midnight, so 12:45 AM sorts after the evening, not first. Each cue shows its time, activity, phase, location, owner, a Critical tag, who sees it, its track, and its status. Every field from the package can be edited; cues can be added and removed. Filters: studio view (everything), "What the couple would see" (Client Facing + Guest Facing only: 11 of the 27 seeded cues), vendor-facing cues, and by track.
- **On the wedding day itself,** the current cue is marked **Now** and the next one **Next**, from the phone's clock, refreshed every minute.
- **Production:** the 8 seeded blocks with crew, count, equipment, ready-by and the quality check (Pending / Passed / Corrected).
- **Vendors:** the call sheet (company, type from the 16 vendor types, on-site lead, mobile, email, arrival, ready by, departure/strike, loading/parking, setup location, power, meals). Phone numbers tap to call.
- **Crew:** LVD's own team (name, role, call time, out time, meal, mobile).
- **Overview:** the command facts from `overview_fields`, pre-filled from the client record where we have it (couple, wedding date, venue). Version is not typed by hand; the portal keeps it.
- **Print brief:** generated from the overview, the Critical cues, the vendor contacts and the crew, with the version number on top. The Print button prints only the brief.

**The version rule, as written in the package:** "Confirm all" marks every Draft, Pending Confirmation and Changed cue and block as Confirmed. Confirming does not change the version. After that, editing a Confirmed cue or block flips it to **Changed** and bumps the version by one (removing a confirmed one bumps it too). Tested: one edit after confirming moved Version 1 to Version 2 and flipped only that cue.

**Two people at once:** if someone saves after you opened the timeline, your save is refused with "Someone else changed this timeline since you opened it. Reload…", so nobody's work is quietly overwritten.

**Storage:** one timeline per client. A client nobody has touched shows the starter template; the first save stores it. "Start over" (two taps) puts a client back to the template.

**Not built yet:** the specialty sheets (Beauty & Preparation, Transportation, Ceremony Cues, Reception Run of Show, VIP & Property, Incident & Change Log), per-vendor extracts sent to vendors, sharing the client view in the couple's portal, and linking checklist tasks (LVD-061, 068, 076, 077, 085, 089, 090, 091) to the timeline. Overview times are free text for now.

**Also fixed along the way:** on the Checklist and Timeline tabs, switching to another tab and back could show the screen from before your last save. It now always shows the latest.

**Tested:** first save, editing a cue, Confirm all, the version bump, adding a vendor and a crew member, saving the overview, a clash between two editors, the couple view, the print brief, switching tabs and back, and every view at phone width. All test data was removed afterwards.

### Oct 25, 2026: Build 2, Budget tab is live (studio only)

**What the studio sees now.** Every client record has a **Budget** tab, next to Checklist, built from `budget-tracker.html` and `budget-data.json`:

- **Top numbers:** approved budget and the contingency held back, forecast and what is under contract, paid and still to pay, unallocated (turns into "Over budget" in red when the forecast passes the budget after contingency), overdue and due in the next 14 days, and forecast per guest (from the guest count on the client).
- **Setup:** approved budget and contingency % (default 10%).
- **Budget lines:** vendor/expense, description, category (the 21 categories), who it is paid to (the 4 sides), status (the 6 line statuses), estimated, contracted and approved changes, studio notes. Lines can be removed (two taps; their payments go with them).
- **"Add LVD lines" button:** adds the studio's own planning line, and the design & florals line too if the client has a design tier. Same text as the package's two seed lines.
- **"Make 40/30/30 schedule"** on any LVD line: creates the retainer (40%, due the day it is made, since there is no signing date in the portal yet), the installment (30%, 90 days before the wedding) and the final balance (30%, 30 days before). Rounding goes to the last payment so the three always add up exactly. It refuses if the line already has payments, so nothing is doubled.
- **Payment schedule:** every payment with its status worked out the way the workbook does it (Paid at zero balance, Overdue past the date, Due soon within 14 days, otherwise Not due; Disputed and Waived set by hand). A **Mark paid** button fills the amount and today's date. Payments can be added to any line, edited, or removed.
- **By category:** forecast, paid, target % (typed per couple, no standard split imposed), target $, variance (red when over), and share of the budget.

**Rules kept from the brief:** forecast = max(estimated, contracted) + approved changes. Contingency is a reserve, never a category. Unallocated = approved − reserve − forecast. A canceled line forecasts $0.

**Not built yet (second pass):** the Change & Approval Log (for now, approved changes are typed straight into the line's "Approved changes" box), Vendor Comparison, print/export, late fee and work-pause flags at 7 and 14 days, and connecting these payments to the Invoices tab (that is Build 6).

**Tested:** setup, adding the LVD line, setting its amount, making the 40/30/30 schedule, marking a payment paid, adding an outside vendor, a category target going over, a bad dollar amount (clear message, nothing saved), removing a line, reload, phone width. All test data was removed afterwards.

### Oct 25, 2026: Old Tasks tab hidden

- The studio's client page no longer shows a **Tasks** tab. The Checklist replaces it, as the brief asked ("absorb the current Tasks tab, not sit beside it").
- Hidden, not deleted: it still opens if `?tab=tasks` is added to a client's address, just in case.
- The portal had not been used by real couples yet (2 test tasks in total), so nothing needed moving across.
- The couple's own portal still has its "Tasks" page. It is left in place as the spot where the couple's view of the checklist will go once item 1 above is decided.

### Oct 25, 2026: Build 1, Planning Checklist tab is live (studio only)

**What the studio sees now.** Every client record has a **Checklist** tab with all 121 tasks from `planning-checklist-tasks.json`:

- Grouped by the 11 phases, in calendar order.
- Progress at the top: overall, Planning Core, Design & Floral, plus a count of late tasks and tasks sitting with the couple.
- Each phase shows its own progress (e.g. "1/10 · 10%").
- Each task has a status dropdown (the 7 statuses from the package) that saves instantly.
- An **Edit** button on each task to change the owner (the 9 owners, Stationer included), set a due date, and write studio notes.
- Filters: both tracks / Planning Core / Design & Floral, by status (default "Still open"), and a search box.
- Works on a phone.

**How it follows the brief:**

- **Two tracks.** Planning Core is on for every client. Design & Floral is on only when the client has a design tier recorded under "What They Booked". Tasks from a track the client did not book show as **Not applicable**. Nothing is deleted, and the studio can switch any of them back on.
- **Progress leaves out Not applicable tasks**, as specified.
- **Due dates suggested from the wedding date.** Each task's timing is turned into a date: "9-7 months" becomes 7 months before the wedding (the nearer end of a range, since that is the real deadline), "60-30 days" becomes 30 days before, "Event day" becomes the wedding day, Post-Event tasks land 1–3 weeks after. These show as "(suggested)". They move automatically if the wedding date changes, until someone sets a date by hand.
- **Storage** is as the README suggested: the 121-task template stays fixed in the site's code, and each client only stores what has changed (status, owner, due date, notes, who changed it, when).
- **Studio notes** are marked studio-only in the database and will never be sent to the couple's view.

**What is different from the reference build (`planning-checklist-tracker.html`), on purpose for now:**

- Priority, dependency, category, timing and the approval flag are shown but not editable. They come from the template.
- No CSV/JSON export yet.
- The studio cannot add custom tasks to one client's checklist yet. Only the 121 template tasks.
- No couple-facing view yet (waiting on Irene, item 1 above).

**Tested:** status changes, owner, due date and notes all saved and survived a page reload. Phone layout checked. Test changes were removed afterwards.
