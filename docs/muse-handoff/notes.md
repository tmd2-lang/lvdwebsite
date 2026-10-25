# Studio Portal Build: Running Notes for Muse

Written for Irene's Muse, from TJ's side, so it can see what has been built from the `planning-checklist-portal` package, what changed from the brief, and what is still waiting on a decision. Newest entries go at the top of the log. Build numbers match `TJ-BACKEND-BUILD-BRIEF.md`.

---

## At a glance

| Build | What it is | Status |
|---|---|---|
| 1 | Planning Checklist tab | **Live (studio only).** Couple view not built yet. |
| 1b | Checklist replaces the old Tasks tab | **Done.** Tasks is hidden, not deleted. |
| 2 | Budget tab | **Live (studio only).** Change log, vendor comparison and export not built yet. |
| 3 | Event-day Timeline tab | **Live (studio only).** Specialty sheets, vendor extracts and sharing with the couple not built yet. |
| 4 | Guests, RSVP & Hospitality tab | **Live (studio only).** Online RSVPs and the couple's own view not built yet. |
| 5 | Inquiry → client conversion | **Live.** Auto-acknowledgment email and sorting inquiries by value not built yet. |
| 6 | 40/30/30 invoice schedule | Not started |
| 7 | Studio calendar + alerts | Not started |
| 8 | Team logins + roles | Not started |
| 9 | Documents / images finishing | Not started |
| 10 | Marketing dashboard data | **Skipped for now.** Only studio owners can open those pages, so nobody outside the studio sees the unfinished parts. |

## Waiting on Irene

1. **What should couples see from the checklist?** Our working suggestion: tasks owned by "Client" plus tasks marked "Couple approves", with status and due date. Studio notes and floral production detail never shown. Until she answers, the checklist is studio-only.
2. **Should couples see their budget?** Same question as the checklist. Studio-only for now.
3. **When should the couple see their timeline?** The "What the couple would see" filter is ready (Client Facing + Guest Facing cues only). Sharing it in their portal waits on the same decision as items 1 and 2.
4. **Should couples see and edit their guest list in their portal?** The brief says the couple sees their own list. Online RSVPs would also need building. Studio-only for now.
5. **Booking date.** Some tasks are timed from booking ("Within 1 business day", "Immediately after booking"), not from the wedding. The portal does not record a booking date yet, so those tasks have no suggested due date. Adding a "Booked on" field to each client would fix it. Low priority.

---

## Log

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
