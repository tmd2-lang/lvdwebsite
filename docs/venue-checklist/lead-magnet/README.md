# Before You Book the Venue: client lead magnet

A redesign of Irene's final v2.2 (Oct 2026), in the approved planning guide's style: Cormorant Garamond and Jost, ivory/ink/gold, calm headings, and photos from the site gallery.

- `index.html` is the source: 10 letter-size pages, one `<section class="page">` each.
- `before-you-book-the-venue.pdf` is the export, the file couples download.
- `assets/` holds the photos, copied from `public/gallery/` and resized to 2200px.

Content is Irene's, word for word. All 75 questions were checked against her PDF. Changes from her version:
- The version number, "LVD Edition," and page footers are removed, as in the onboarding packet.
- The old sparkly logo is replaced with the website's LADY VICTORIA / designs lockup.
- Sections are numbered 01–11, and a contents list is added to page 2.
- Page 2's headline, "Ask before you pay the deposit," is new and needs Irene's OK.

To rebuild the PDF after editing `index.html`, run this from this folder:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer --virtual-time-budget=15000 --print-to-pdf="$PWD/before-you-book-the-venue.pdf" "file://$PWD/index.html"
```
