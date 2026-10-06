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
| 1 | Save which ad each inquiry came from | Built; waiting on database change |
| 2 | Show the ad on each inquiry in the portal | Not started |
| 3 | Calendly updates the inquiry automatically | Not started |
| 4 | One-click buttons after the call (outcome, fit, proposal, booked/lost) | Not started |
| 5 | "Needs attention" list for the sales team | Not started |
| 6 | Per-ad report: spend → inquiries → consults → bookings → $ | Not started |
| 7 | Send qualified and booked results back to Meta | Not started |

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
