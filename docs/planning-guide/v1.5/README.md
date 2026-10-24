# V1.5: V1.4 plus the planner's content and full package scope

Built from V1.4, which is left unchanged.

- Guest-count pricing from the planner's guide (`planner-content-source.html`): base prices cover up to 150 guests, and each additional 50 guests adds +$500 (Coordination), +$600 (Partial), or +$750 (Full).
- Service area widened to DC, MD, VA, NJ, NY, PA.
- Every package chapter has a "See the full scope" list, generated from `src/data/packages.ts` on the live site (6, 24, 7, and 55 items).
- New "Then, we design the room" section between à la carte and the closing. It tees up décor with the three design tiers and their starting prices from `src/data/investments.ts`, and links to /services. The photo is the site's `full-production-grand.jpg`, resized.
- The preview badge and version endnote are removed so the guide can go to Irene.
- Cleanup pass: page-number footers, the "THE PLANNING COLLECTION — 01" chapter rows, corner photo captions, the "Scroll to explore" cue, the boxed side tracker and the boxed Find-your-fit buttons are gone. The rounded booking card stays (TJ likes it). Each package's tagline now sits above its name. The nav uses the website's LADY VICTORIA / *designs* logo lockup (Irene circled it).
- New styles are in `v1-5.css`. `chapter-journey.js` moves the scope list into each chapter.

Preview: http://127.0.0.1:4387/v1.5/
