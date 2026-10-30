# Venue Vetting Checklist: Team Edition (internal)

A redesign of Irene's final v2.1 (Oct 2026), matching the client lead magnet in `../lead-magnet`.

- `index.html` is the source: 11 letter-size pages, one `<section class="page">` each.
- `venue-vetting-checklist-team-edition.pdf` is the export. It's for the team only and never goes to clients.
- `assets/` holds two photos from `public/gallery/`, resized to 2200px.

Content is Irene's, word for word. The 70 questions, 8 red flags, how-to text, and every form label were checked against her PDF. Changes from her version:
- Ruled note lines fill the blank space under each section, because the how-to tells the team to record answers, contacts, costs, and follow-ups.
- Red Flags and Recommendation are numbered 11 and 12, after the multicultural section (10).
- "Overall fit" has three tick boxes: Recommend, Conditional, Decline.
- A small "Internal team use" line sits at the bottom of each inside page. The version number and page footers are removed.

To rebuild the PDF after editing `index.html`, run this from this folder:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer --virtual-time-budget=15000 --print-to-pdf="$PWD/venue-vetting-checklist-team-edition.pdf" "file://$PWD/index.html"
```
