# Lead Tracking Playbook

How we track every lead from the ad they clicked to the money they booked.
Built first for Lady Victoria Designs (LVD). Written so it can be set up again
at another business that runs ads and sells through consultations.

## The problem it solves

Ad platforms report "leads" and "cost per lead." Neither tells you which ads
bring people who actually book, or for how much. A cheap lead who never books
is worth less than an expensive one who does. The fix is to tie each inquiry
to the exact ad it came from, then record what happens after: the call, the
proposal and the booking.

## The seven steps

| # | Step | Status |
|---|------|--------|
| 1 | Save which ad each inquiry came from | Live (Oct 6, 2026) |
| 2 | Show the ad on each inquiry in the portal (marketing viewers only) | Live (Oct 6, 2026) |
| 3 | Calendly updates the inquiry automatically | Live (Oct 6, 2026); real booking lifecycle test pending |
| 4 | One-click buttons after the call (outcome, fit, proposal, booked/lost) | Live (Oct 6, 2026) |
| 5 | "Needs attention" list for the sales team | Live (Oct 6, 2026) |
| 6 | Per-ad report: spend → inquiries → consults → bookings → $ | Live (Oct 6, 2026) |
| 7 | Meta sends spend in; we send sales results back to Meta | Built; waiting on Meta keys |

Rule for what's automatic vs. manual: anything a system knows is captured
automatically (ad, page, inquiry details, Calendly bookings, ad spend). People
only enter what only they know: did the call happen, was it a fit, proposal
amount, booked or lost, and why.

---

## Step 1: Save which ad each inquiry came from

**What it does.** When someone lands on the site from an ad, the site saves
the ad's tags in their browser. When they submit any inquiry form, on any page,
even days later on the same device, those tags are saved with the inquiry.

**What gets saved per inquiry**

| Field | Example | Notes |
|---|---|---|
| `utm_source`, `utm_medium`, `utm_campaign` | `ig`, `paid`, `52668577648474` | From the ad link |
| `meta_campaign_id`, `meta_adset_id`, `meta_ad_id` | `52668773909274` | Only for Meta traffic. `meta_ad_id` is the key for per-ad reports |
| `landing_page` | `/welcome` | First page they landed on |
| `first_touch_at` | `2026-10-05T20:14Z` | When they first clicked |
| `attribution` (JSON) | | First *and* most recent tagged visit, plus Meta's `_fbc`/`_fbp` browser IDs and the GA4 client ID (needed later for step 7) |

**Setup at a new business**

1. In Meta Ads Manager, on every ad, set URL parameters to Meta's dynamic template:
   `utm_source={{site_source_name}}&utm_medium=paid&utm_id={{campaign.id}}&utm_campaign={{campaign.id}}&utm_term={{adset.id}}&utm_content={{ad.id}}`
   Use IDs, not names. Names change; IDs never do.
2. Add the capture script to every public page (`src/lib/attribution.ts`, called on each page view).
3. Send the saved attribution with every form submission (`src/lib/lead-submit.ts`).
4. On the server, clean it and store it as columns (`attributionColumns()` in `src/lib/attribution.ts`, used by `src/app/api/leads/route.ts`).
5. Run the database change (`supabase/lead-attribution-schema.sql`). It also back-fills older leads from tags saved in their page URL.

**Design decisions**

- **First touch and last touch are both kept.** If someone first clicks a cold ad and later a retargeting ad, both get credit. Reports use first touch by default.
- **First touch expires after 90 days**, so a click from last year doesn't get credit for a new inquiry.
- **Same device only.** A click on a phone followed by a submission on a laptop can't be linked without logins. Accepted as a limit.
- **Never lose a lead over tracking.** If the database columns are missing, the inquiry still saves without the tracking fields.
- **Privacy.** Only known tag names are stored (utm_*, fbclid, gclid, epik). Other URL values, and referrer paths, are dropped, because they can contain personal details.

**Gotchas we hit at LVD**

- Some retargeting ads had a hard-coded `?fbclid=fbclid` in their link. That's a placeholder, not a real click ID. The code ignores it, but fix the link in Ads Manager.
- Before this, tags only survived if the person submitted on the page they landed on. Anyone who browsed first lost them.
- Count inquiries from your own database, not from Meta's "leads" column. Meta's number can include things that never reach the inbox.
- Two Meta pixels are installed on the LVD site (one marked temporary). Worth confirming which one the ad sets optimize on.

---

## Step 2: Show the ad on each inquiry (marketing viewers only)

**What it does.** In the inquiry portal, each inquiry that came from an ad shows
a line like **Instagram · BTS Transformation**, on the list and under the
person's name. A collapsed **Marketing details** section shows the source,
landing page, campaign / ad set / ad IDs, first-click time, and the most recent
ad if it was different.

**Who sees it.** Only the marketing person. At LVD that is one account; the
owner and planners don't see it. Reason: ads should be judged in the per-ad
report (step 6), not one lead at a time by gut feel. The list lives in
`MARKETING_VIEWER_EMAILS` (comma-separated), defaulting to the LVD marketing
account. For anyone else, the server never even loads the ad fields, so they
aren't hidden in the page's code either.

**Where the ad name comes from**

1. `utm_ad_name={{ad.name}}` in the ad's URL parameters (Meta fills it in). Best option, no upkeep.
2. A short hard-coded list of older ads' names (`src/lib/ad-source.ts`), for ads that ran before step 2.
3. Otherwise: "Instagram · Ad 52668773909274".

The ad **ID** is always the permanent key. The name is a display label, a
snapshot of what the ad was called when she clicked. Renaming an ad later
doesn't break reports.

**Setup at a new business**

1. Add `&utm_ad_name={{ad.name}}` to the URL parameters line from step 1.
2. Set `MARKETING_VIEWER_EMAILS` to whoever runs the ads.
3. Optionally fill in the legacy names list for ads that ran before.

**Gotchas**

- The new-inquiry email goes to the owner, so it does not include the ad.
- Opening an inquiry marks it read for whoever opened it. Checking the portal yourself changes the sales team's unread counts only for your own account.

## Step 3: Calendly updates the inquiry

Design Consultation bookings, reschedules and cancellations sync to linked inquiries. See [activation instructions and data flow](CALENDLY-SETUP.md). This step is live on the confirmed production project with an active Calendly webhook. A real booking, reschedule and cancellation test remains pending.

---

## Step 4: Sales buttons after the call

**As Valentina:** her consultation happens. Irene opens her inquiry and the
**Sales** box asks one question at a time:

1. *Did the consultation happen?* → **Completed** or **No-show**
2. *Was it a good fit?* → **Good fit** or **Not a fit**
3. *When the proposal goes out, enter its amount* → `$38,500` → **Proposal sent**
4. *Did they book?* → **Booked** + amount (blank = the proposal amount), or **Lost** + reason (Budget, No response, Went with someone else, Date unavailable, Wanted a different service, Other) + optional note

Every answer has an **Undo**, and every click is saved in the inquiry's
activity history with who did it and when. A summary line keeps earlier
answers visible ("Consult completed Oct 8 · Good fit · Proposal $38,500 sent Oct 9").

**What gets saved:** each fact in its own field: `consult_outcome`, `fit`,
`proposal_amount` + `proposal_sent_at`, `sales_outcome` (booked/lost),
`booked_amount`, `lost_reason`, `lost_note`, each with a timestamp. The step
shown is worked out from those fields (`src/lib/sales-stage.ts`).

**The status dropdown keeps working** and follows along, forward only:
Completed → Contacted (if still New/Reviewing) · Good fit → Good Fit ·
Not a fit → Not a Fit · Booked → Booked · Lost → Archived. Undo never moves
status back; fix it with the dropdown if needed.

**Who sees it:** everyone with inquiry access (owner, planners, inquiry staff).
Sales facts aren't marketing data.

**Setup at a new business**

1. Run `supabase/lead-sales-schema.sql` (after the activity and appointments files).
2. Adjust the lost reasons to the business (in the SQL and `LOST_REASONS`).
3. Map the automatic status changes to the business's own statuses.

**Design decisions**

- One question at a time, never a form. The goal is seconds per lead, or the team stops updating it.
- Calls without a Calendly booking (they phoned directly) still work: the buttons are always there.
- Until the database change is applied, the portal hides the Sales box instead of breaking.
- Each click is one database transaction (`apply_sales_update`): the change and its history entry are saved together or not at all.

---

## Step 5: "Needs attention"

**As Irene:** she opens the portal in the morning. The first card says
**Needs attention · 6**. One click shows only those inquiries, most urgent
first, each tagged with why:

| Tag | Means | Clears when |
|---|---|---|
| Consult today | A Calendly consult is booked for today (Eastern) | Someone clicks Completed / No-show |
| Outcome missing | The consult time has passed with no outcome | Same |
| Proposal waiting | A proposal went out over 7 days ago, no Booked/Lost | Booked or Lost is recorded |
| New, not contacted | Came in during the last 14 days, still New/Reviewing, nothing else recorded | Status moves on, a consult gets booked, or any sales answer is recorded |

Booked, lost, not-a-fit, archived and spam inquiries never show up.

**Why it matters for tracking:** this is what makes the team keep the record
current. They get a to-do list; the system gets its data as a side effect.

**Nothing new is stored.** It's worked out from data the portal already has
(`src/lib/attention.ts`), so there's no database change.

**Setup at a new business:** pick the two windows (`NEW_LEAD_WINDOW_DAYS`,
`PROPOSAL_FOLLOW_UP_DAYS`) and the business's time zone.

**Design decisions**

- Only the last 14 days of uncontacted leads count. LVD had 83 old "New" inquiries; counting them all would bury the real to-dos. Older ones stay reachable through the "Not contacted" filter.
- A consult booked for a later day replaces "not contacted": the next action is the consult itself.

---

## Step 6: The ad report

**As Valentina:** the BTS ad brought her in, she picked $20–34k, booked a
consult, was a good fit, got a $38,500 proposal and booked at $36,000. On the
**Ad report** page, her inquiry is one of the BTS ad's inquiries, one of its
"$20k+" picks, one of its consults, one of its bookings, and $36,000 of its
booked revenue.

**What it shows, per Meta ad:** spend · inquiries · cost per inquiry ·
how many picked $20k+ · consults · completed · good fit · proposals ·
booked (count and $) · cost per booking · lost. Totals at the top, including
booked dollars per $1 spent. Inquiries that didn't come from a Meta ad are
listed underneath for comparison.

**Where each number comes from**

| Number | Source |
|---|---|
| Spend | Typed in per ad on the page (step 7 will pull it from Meta) |
| Inquiries, budgets | The inbox (step 1), grouped by the first ad clicked |
| Consults | Calendly (step 3) or a recorded consult outcome |
| Completed, fit, proposals, booked, lost | The Sales buttons (step 4); old-dropdown "Booked" counts too, without an amount |

**Who sees it:** marketing viewers only (`/admin/ad-report`, linked in the
inquiry sidebar). The page and the spend endpoint both refuse everyone else.

**Setup at a new business**

1. Run `supabase/ad-spend-schema.sql`.
2. Each week, in Ads Manager set the date range to *the day tracking started → today*, and type each ad's "Amount spent".
3. Set `HIGH_BUDGET_FROM` (`src/lib/ad-report.ts`) to the business's "good budget" line.

**Gotchas**

- Use spend since tracking started, not lifetime. Inquiries before that weren't saved, so lifetime spend makes older ads look worse than they are.
- Count inquiries from the inbox, never Meta's "leads".
- With only a handful of inquiries per ad, the percentages swing a lot. Treat them as hints until each ad has a few dozen.

---

## Step 7: Meta both ways

### 7a. Spend comes in from Meta

**As Valentina:** nobody types spend anymore. Every morning at 7 AM Eastern
the site asks Meta how much each ad has spent since tracking began
(Aug 13, 2026), along with each ad's current name, and the Ad report updates
by itself. The **Refresh from Meta** button does the same thing on demand.

- Meta Marketing API, Insights endpoint, `level=ad`, `act_<ad account>/insights` (`src/lib/meta-ads.ts`), Graph API v26.0 (override with `META_GRAPH_VERSION`).
- Scheduled by Vercel Cron (`vercel.json` → `/api/cron/meta-spend`), protected by `CRON_SECRET`.
- Meta's numbers replace typed-in spend for the same ad. Once Meta is connected, the spend boxes become read-only.

### 7b. Sales results go back to Meta (Conversions API)

**As Valentina:** when Irene clicks **Completed**, **Good fit**, or
**Booked · $36,000**, the site quietly tells Meta. Meta matches it to the
person who clicked the BTS ad and learns that this kind of person books, not
just fills out forms.

| Click in the Sales box | Event sent to Meta |
|---|---|
| Completed | `ConsultCompleted` (custom) |
| Good fit | `QualifiedLead` (custom) |
| Booked | `Purchase` with the booked amount in USD |

- Sent server-to-server to the pixel's `/events` endpoint, `action_source: system_generated`.
- Match keys: SHA-256 hashed email and phone (normalized as Meta requires), hashed lead ID, plus the `_fbc` / `_fbp` browser IDs saved in step 1. No readable personal data is sent.
- Event ID `lvd_<lead>_<step>`: if someone undoes and re-clicks, Meta drops the repeat.
- Runs after the click has already saved. A Meta outage can't slow down or block the sales team.
- Every send is logged in `meta_capi_events` (what was sent, when, and Meta's reply).
- Undo can't take an event back from Meta. That's acceptable at this volume.

**Setup at a new business**

1. Run `supabase/meta-sync-schema.sql`.
2. Business Settings → Users → System users → add one (Employee) → assign the ad account with "View performance" → generate a token with `ads_read`. Store as `META_ADS_READ_TOKEN`.
3. Events Manager → the ads' dataset (pixel) → Settings → Conversions API → Generate access token. Store as `META_CAPI_TOKEN`.
4. Set `META_AD_ACCOUNT_ID`, `META_PIXEL_ID`, and a random `CRON_SECRET` locally and in the host. Deploy.
5. Test 7b with `META_CAPI_TEST_CODE` from Events Manager → Test events, then remove it.
6. Make sure the privacy policy says site data is shared with advertising partners.

**Gotchas**

- LVD had two pixels installed; only one is used by the ad sets. Send Conversions API events to that one.
- Meta optimizes on an event only once it gets a decent volume of it each week. Bookings will be too rare for that at first; their value is in reporting and in Meta's matching.
