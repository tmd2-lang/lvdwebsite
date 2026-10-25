# Studio Portal Build: Running Notes for Muse

Written for Irene's Muse, from TJ's side, so it can see what has been built from the `planning-checklist-portal` package, what changed from the brief, and what is still waiting on a decision. Newest entries go at the top of the log. Build numbers match `TJ-BACKEND-BUILD-BRIEF.md`.

---

## At a glance

| Build | What it is | Status |
|---|---|---|
| 1 | Planning Checklist tab | **Live (studio only).** Couple view not built yet. |
| 1b | Checklist replaces the old Tasks tab | **Done.** Tasks is hidden, not deleted. |
| 2 | Budget tab | **Live (studio only).** Change log, vendor comparison and export not built yet. |
| 3 | Event-day Timeline tab | Not started |
| 4 | Guests, RSVP & Hospitality tab | Not started |
| 5 | Inquiry → client conversion | Not started |
| 6 | 40/30/30 invoice schedule | Not started |
| 7 | Studio calendar + alerts | Not started |
| 8 | Team logins + roles | Not started |
| 9 | Documents / images finishing | Not started |
| 10 | Marketing dashboard data | Not started |

## Waiting on Irene

1. **What should couples see from the checklist?** Our working suggestion: tasks owned by "Client" plus tasks marked "Couple approves", with status and due date. Studio notes and floral production detail never shown. Until she answers, the checklist is studio-only.
2. **Should couples see their budget?** Same question as the checklist. Studio-only for now.
3. **Booking date.** Some tasks are timed from booking ("Within 1 business day", "Immediately after booking"), not from the wedding. The portal does not record a booking date yet, so those tasks have no suggested due date. Adding a "Booked on" field to each client would fix it. Low priority.

---

## Log

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
