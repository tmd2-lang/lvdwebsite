# Venue checklist Meta campaign, round 1: setup for Muse (Oct 30, 2026)

Everything needed to build the first Meta campaign for the free venue checklist: the campaign, the audience, and three ads with their copy. Build it **paused**, then turn it on once Irene has OK'd the photos.

## Short version

- **Goal:** checklist signups on `ladyvictoriadesigns.com/venue-checklist`.
- **One campaign, one ad set, three ads:** two images and one 14-second video.
- **Audience:** women 24–42 within 50 miles of Washington, DC, with wedding and engagement interests as suggestions.
- **Budget:** $35 a day for 7 days, then review.
- **Judge on:** cost per signup, then how many signups book the complimentary consultation.

## Step 1: Conversion

Optimize for the standard **Lead** event on the LVD pixel (dataset `1263840655319183`). No custom conversion is needed for this campaign: every ad goes to the checklist page, so almost every Lead it gets is a checklist signup.

**Later, for the inquiry campaigns (not needed for this launch):** the website sends the same Lead event for checklist signups and real inquiries, so an inquiry campaign optimizing for Lead also counts checklist downloads. When convenient, make a custom conversion called `Inquiry` (event Lead, rule: URL does **not** contain `venue-checklist`) and switch the inquiry campaigns to it.

## Step 2: Campaign

| Setting | Value |
|---|---|
| Campaign name | `LVD · Venue Checklist · Leads · R1 · Nov 2026` |
| Objective | Leads |
| Budget | Ad set budget (not Advantage campaign budget) |
| Special ad category | None |
| A/B test | Off |

## Step 3: Ad set

| Setting | Value |
|---|---|
| Ad set name | `VC R1 · DC 50mi · W 24–42 · Adv+ audience` |
| Conversion location | Website |
| Performance goal | Maximize number of conversions |
| Conversion event | **Lead** |
| Budget | **$35 per day**, no end date (review after 7 days) |
| Attribution | 7-day click, 1-day view |
| Location | Washington, DC + **50 miles**, people living in this location (covers DC, Montgomery, Prince George's, Northern Virginia, and most of Baltimore) |
| Age | 24–42 |
| Gender | Women |
| Audience | **Advantage+ audience ON**, with these as suggestions: |
| ↳ Life events | Newly engaged (6 months), Newly engaged (1 year), Engaged |
| ↳ Interests | Wedding planning, Weddings, Bridal shower, Wedding dress, The Knot, WeddingWire, Zola, Brides (magazine), Martha Stewart Weddings |
| Exclude | Past clients, if there's an uploaded customer list |
| Placements | Advantage+ placements, but **turn off Audience Network** (it brings low-quality signups) |
| Language | English |

Some of those life events or interests may not exist in Meta anymore. Skip any that don't, and keep Advantage+ audience on so Meta can widen past them.

## Step 4: Ads

**Every ad:**
- **Website URL:** `https://www.ladyvictoriadesigns.com/venue-checklist`
- **Display link:** `ladyvictoriadesigns.com`
- **URL parameters:** `utm_source={{site_source_name}}&utm_medium=paid&utm_id={{campaign.id}}&utm_campaign={{campaign.id}}&utm_term={{adset.id}}&utm_content={{ad.id}}`. This is the same template as all LVD ads, so signups show up per ad in the studio's Inquiries reports.
- **Button:** Download
- **Description:** Free wedding venue checklist
- **Use the 9:16 (vertical) file for every placement.** Upload just the 9:16 file. In Feeds, Meta shows it cropped to 4:5 (it trims the top and bottom); the designs keep all text inside that area, so nothing important is cut. Check the Feed preview anyway.
- **Turn off** Advantage+ creative enhancements that change the image (text overlays, cropping, "visual touch-ups") so the design stays as made. Keep "Add music" off for the video (it's designed to be silent).

All files are in the repo under `docs/venue-checklist/ads/`.

### Ad 1: `VC R1 · 01 · Fall in love · Photo`

**File:** `exports-v1/love-photo-story.png` (9:16)

**Primary text:**
> Before you fall in love with a wedding venue, ask these questions.
>
> It's easy to picture your wedding the moment you walk into a beautiful room. But can you actually have the wedding you're imagining there?
>
> Are your dream decorations allowed? What happens if it rains? Will the room still fit your guests once the dance floor and tables are in?
>
> A beautiful venue isn't always the right venue. Our free checklist helps you know what to ask before you book.

**Headline:** Before you book the venue

### Ad 2: `VC R1 · 02 · First-time bride · Checklist preview`

**File:** `exports/doc-preview-story.png` (9:16)

**Primary text:**
> You've probably never booked a wedding venue before. How are you supposed to know what to ask?
>
> Most couples know to ask about price, dates, and how many guests fit. But what about the questions you wouldn't think to ask? Whether your guest count can go down after you sign. What happens if it rains. What's actually included in the quote.
>
> We put together a free venue checklist with the questions our planning team asks on every tour. Bring it to your next one.

**Headline:** The questions you didn't know to ask

### Ad 3: `VC R1 · 03 · Wish they'd asked · Video 14s`

**File:** `exports/video-story.mp4` (9:16). Use this one, **not** `exports-v1/`: the old video says 45 questions, and the checklist now has 43.

**Primary text:**
> What brides wish they'd asked their venue.
>
> The candles that turned out not to be allowed. The music that had to stop at 10. The fees that weren't in the first quote. They seem like small details on a tour. They're not small once you're planning the actual day.
>
> Our free venue checklist covers what to ask, the red flags, and what to get in writing before you sign anything.

**Headline:** Don't find out after you book

## Step 5: Before turning it on

1. **Irene OKs the photos.** Ad 1 and the checklist cover show real weddings from the site gallery.
2. **Test the conversion.** Sign up once on `/venue-checklist` with a test email and check that Events Manager shows a new Lead event. That test signup also gets the 3 emails, so use your own address.
3. **Preview every placement** (Feed, Stories, Reels). In Feed the vertical ads are trimmed at the top and bottom; make sure the headline and button still show.

## Step 6: How to judge it

- **For the first 3–4 days, don't change anything.** Edits restart Meta's learning period.
- **After 7 days, for each ad:** look at spend, signups, and cost per signup.
- **Pause** any ad that has spent about twice the average cost per signup with no signups.
- **Then check the quality:** the signups for each ad, by `utm_content` in Inquiries. Look at budget, wedding date, and whether they book the consultation.
- **Round 2:** more ads for the winning format and text, and a video of Irene talking to camera for the winning angle.

## What we need from Muse and Irene

1. Irene: OK the photos in Ad 1 and the checklist cover.
2. Muse: build steps 1–4 with the campaign **paused**, and send a screenshot of the ad set and the three ad previews.
3. Later: make the "Inquiry" custom conversion for the inquiry campaigns (see step 1).
4. Muse: turn it on after the test signup in step 5 works.
