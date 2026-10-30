# Venue checklist ads, round 1 (general edition)

Meta ads for the free venue checklist, in the **editorial style**: the website's Bodoni Moda headlines and Inter text, upright type with no italic accent words, thin rules and square buttons. The first version (Cormorant and Jost, matching the PDF) is kept in `index-v1.html`, `video-v1.html` and `exports-v1/`.

Round 1 tests **which reason to download wins**, so all six angle ads are statics in the same style. Open `preview.html` to see everything side by side.

- **Sizes:** feed is 1080×1350 (4:5), story is 1080×1920 (9:16). Stories keep text out of the top 250px and bottom 340px, where Instagram puts the profile bar and the button.
- **Fonts:** loaded from Google Fonts, so rendering needs an internet connection.
- **Files:** `exports/` (PNG and MP4). Source: `index.html` (statics, `?ad=<name>&size=feed|story`) and `video.html` (the video, `?size=feed|story`, add `&t=3.2` for a single frame).
- **Photos:** all real LVD weddings from the site gallery. Irene should OK the couples and rooms before anything runs.
- **Promise check:** every question shown in an ad is in the live checklist (v4, 43 questions). If the question count changes again, update "43" in `index.html` and `video.html` and re-render. The document ad and video use the live landing-page previews (`cover-standard.jpg`, `v4-top10.jpg`, `v4-questions-tips.jpg`) copied into `assets/`.

## Setup

| Ad set | Ads | Budget |
|---|---|---|
| General (round 1) | 6 angle ads (3 angles × 2 images) | ~$30–50/day, 7–10 days |
| Optional control | Document preview static, video | Run separately so it doesn't muddy the angle test |

Judge by **cost per checklist download per angle**, then by which angle's leads book consultations.

## Angle 1: The first-time bride

*Recognition: she's never done this before.*

**Images:** `first-photo` (white blossom aisle), `first-notes` (phone-notes list with "…and the ones you didn't know to ask").

**Primary text:**
> You've probably never booked a wedding venue before. How are you supposed to know what to ask?
>
> Most couples know to ask about price, dates, and how many guests fit. But what about the questions you wouldn't think to ask? Whether the décor you love is allowed. What happens if it rains. Which costs aren't in your quote.
>
> We put together a free venue checklist with the questions our planning team asks on every tour. Bring it to your next one.

**Headline:** The questions you didn't know to ask
**Button:** Download

## Angle 2: Before you fall in love

*Emotion: the beauty of the room makes her forget to ask.*

**Images:** `love-photo` (floral arch framing the ballroom), `love-split` ("What you see on the tour" vs. "What's in the contract").

**Primary text:**
> Before you fall in love with a wedding venue, ask these questions.
>
> It's easy to picture your whole wedding the moment you walk into a beautiful room. But what if your décor isn't allowed? What if the rain plan looks nothing like the ceremony you imagined? What if the quote leaves out half of what you need?
>
> The right venue has to do more than look beautiful. Download our free checklist and know what to ask before you book.

**Headline:** Before you book the venue
**Button:** Download

The contract lines in `love-split` (enclosed candles, music until 10pm, tent at extra cost, vendor access from 2pm) are realistic examples, not quotes from a real venue.

## Angle 3: What brides wish they'd asked

*Social proof and regret: others learned the hard way.*

**Images:** `wish-photo` (bride on the staircase, question card), `wish-list` (checklist-style page with five empty boxes).

**Primary text:**
> What brides wish they'd asked their venue.
>
> The candles that turned out not to be allowed. The music that had to stop at 10. The rain plan nobody mentioned. They seem like small details on a tour. They're not small once you're planning the actual day.
>
> Our free venue checklist covers what to confirm, and what to get in writing, before you sign anything.

**Headline:** Don't find out after you book
**Button:** Download

The questions in the ad are written in our own words, based on common regrets. No real quotes or usernames.

## Extra: document preview (static) and video

- `doc-preview`: the checklist cover with the Start Here and question pages fanned behind it, like the landing page. Good as a control.
- `cover`: a magazine cover. "LADY VICTORIA" masthead, "The venue issue · Free", and the checklist as the lead story: "43 questions to ask on the tour", with cover lines for the red flags, what to get in writing, and what brides wish they'd asked. Photo: the bride with pampas grass (curated installations gallery).
- `video` (14 seconds, silent): the arch ballroom with "Before you fall in love with a venue, ask these first" → three questions whose boxes get marked (check, slash, check) → "'We're flexible' is not a yes." → the pages fly in and fan out, "Download free". It mixes angles, so run it outside the round 1 angle test.

**Video primary text:**
> Before you fall in love with a venue, ask these first. Our free checklist shows you what to ask, what's a red flag, and what to get in writing before you sign.

**Headline:** The free venue checklist
**Button:** Download

## Still to make

- Multicultural set: "'Yes, we host multicultural weddings' isn't enough" and "More than one ceremony?" (separate ad set, multicultural PDF).
- Round 2: the winning angle as a video of Irene talking to the camera.

## Re-rendering

The renderer drives Google Chrome with `puppeteer-core` and encodes video with macOS's built-in AVFoundation (no ffmpeg needed). Fonts come from Google Fonts, so it needs internet.

```bash
cd docs/venue-checklist/ads/tools && npm install
```

```bash
node render.js .. ../exports all
```

That renders every static in both sizes. Add a size and ad names to do just some: `node render.js .. ../exports feed cover`.

The video is rendered frame by frame (420 frames per size), then encoded:

```bash
node render-video.js .. /tmp/frames-feed feed 30 && swift encode.swift /tmp/frames-feed ../exports/video-feed.mp4 1080 1350 30
```

```bash
node render-video.js .. /tmp/frames-story story 30 && swift encode.swift /tmp/frames-story ../exports/video-story.mp4 1080 1920 30
```

Chrome is expected at `/Applications/Google Chrome.app`. Set `CHROME=/path/to/chrome` to use another install (for example on Linux in the cloud; the `swift encode.swift` step is macOS only).

## Version 1

The first version used the PDF's Cormorant and Jost with gold italic accent words. It's kept as `index-v1.html`, `video-v1.html` and `exports-v1/` (still says 45 questions, from v3).
