# Before You Book the Venue, v2 (draft for Irene)

A rebuilt client checklist with a real introduction and a clear way to use it. The first redesign in `../lead-magnet` is left untouched.

There's one source and two editions:
- **Standard** (`before-you-book-the-venue.pdf`, 13 pages): the 64 questions that apply to every wedding.
- **Multicultural** (`before-you-book-the-venue-multicultural.pdf`, 15 pages): the same pages, plus the multicultural chapter, a line in Irene's letter, and a different cover subtitle and closing invite. It has all 75 questions.

Each question has two boxes: **Asked** and **Confirmed**.

## New copy that needs Irene's approval
Irene's questions are word for word, and both PDFs were checked against her v2.2. Everything below is new:
- Page 3, the letter from Irene: "The venue comes first"
- Page 4, "The one rule": the "We're flexible" example (written as an illustration, not a real client story)
- Page 5, the four steps, the Asked / Confirmed legend, and "What to bring to the tour"
- The one-line "why this matters" under each section heading
- The intro line on the multicultural chapter
- The client Red Flags list (adapted from the Team Edition's red flags)
- The standard edition's cover subtitle ("The Essential Wedding Venue Checklist") and closing invite

## Rebuilding
Run these from this folder:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer --virtual-time-budget=15000 --print-to-pdf="$PWD/before-you-book-the-venue.pdf" "file://$PWD/index.html"
```

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer --virtual-time-budget=15000 --print-to-pdf="$PWD/before-you-book-the-venue-multicultural.pdf" "file://$PWD/index.html?edition=multicultural"
```
