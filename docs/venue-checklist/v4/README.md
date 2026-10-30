# Venue checklist v4 (live since Oct 30, 2026)

The printable PDF guide, in two editions. Same design as v3; questions rewritten from the Reddit research and Irene's picks. The full old-vs-new list is in `../v4-question-list.md`.

- 42 questions (56 in the multicultural edition), 10 starred dealbreakers with a one-line "why" under each
- "10 questions to never leave a tour without" page, red flags on the rule page, Before You Sign under the Chase List
- 13 pages standard, 15 multicultural

## Changing a question

The questions live in `src/lib/venue-checklist-questions.ts`, which the phone checklist (`/venue-checklist/tour`) also reads. Edit that file, then from the repo root:

```
npx tsx docs/venue-checklist/v4/dump-questions.ts > /tmp/questions.json
python3 docs/venue-checklist/v4/build.py /tmp/questions.json
```

`build.py` rewrites the question pages in `index.html`. `tests/venue-checklist.test.cjs` fails if the PDF and the phone version disagree.

## Exporting the PDFs

```
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer --virtual-time-budget=10000 --print-to-pdf="$PWD/before-you-book-the-venue.pdf" "file://$PWD/index.html"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer --virtual-time-budget=10000 --print-to-pdf="$PWD/before-you-book-the-venue-multicultural.pdf" "file://$PWD/index.html?edition=multicultural"
```

Then copy both into `public/venue-checklist/`. Fonts are bundled in `fonts/`, so no network is needed.
