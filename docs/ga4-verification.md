# GA4: Lady Victoria Designs

Measurement ID: `G-QS8T3YC21F`.

## Required stream setup before deployment

In GA4 Admin → Data streams → select the web stream with this measurement ID:

- This implementation sends manual initial and client-navigation `page_view` events and configures GA4 with `send_page_view: false` on each full page load.
- Leave Enhanced measurement enabled. Open its gear icon → Page views → Advanced settings and disable only **Page changes based on browser history events** to prevent duplicate pageviews. That history setting operates independently of `send_page_view: false`.
- Review **Outbound clicks** and **Site search** before enabling them. Outbound clicks can collect destination URLs; site search can collect search terms and configured query parameters. Disable either feature if it could collect URL/query data containing PII, or until its payloads have been verified safe. The manual event sanitizer does not sanitize these independently collected automatic event parameters. Scroll measurement can remain enabled after verification.
- Ensure automatic user-provided data collection is disabled. Never place customer names, emails, phone numbers or form contents in campaign tags or public URL paths.
- Do not import `generate_lead` or `book_appointment` into Google Ads as Primary conversions. This code makes no account changes or imports. Existing Ads conversion IDs and calls remain unchanged.

These account settings have not been changed or verified by this implementation.

References: [Manual pageviews and browser history](https://developers.google.com/analytics/devguides/collection/ga4/views), [Enhanced measurement parameters](https://support.google.com/analytics/answer/9216061), [User-provided data collection](https://support.google.com/analytics/answer/14077171).

## Behavior

- Reuses the existing Google tag loader without changing its Ads configuration.
- Sends explicit GA4-only `page_view` events on initial public page load and pathname/query navigation, including back/forward. React effect replay is deduplicated.
- Excludes `/admin` and `/portal` routes.
- Sends `generate_lead` with only `form_id: welcome` or `inquire` after the leads API succeeds. Visiting or refreshing `/thank-you` does not emit a GA4 lead.
- Sends `book_appointment` only for `calendly.event_scheduled` from an embedded Calendly iframe. Booking URI is used locally for deduplication; no Calendly payload is transmitted to GA4.
- Stores GCLID and all `utm_*` parameters in sessionStorage under `lvd_marketing_attribution`; they survive navigation and refresh in the tab. Blocked storage falls back to memory until reload. Later supplied parameters replace their stored values. No parameters are appended to internal links.
- GA4 receives a sanitized page URL (path plus a syntactically valid GCLID), a path-based title, and sanitized referrer. Standard campaign slug values map to GA4 campaign fields; other raw UTM values stay local. This intentionally excludes arbitrary URL queries, hashes, and form data. Campaign slugs must themselves be non-PII.

## Verify after deployment

1. Connect Google Tag Assistant to the deployed site, enable debugging, and open GA4 → Admin → DebugView (or Reports → Realtime). Disable browser ad blockers for this test.
2. Visit `/welcome?utm_source=qa&utm_medium=test&utm_campaign=ga4_reconnect&gclid=qa_test_123`. In DevTools → Network, filter `collect`. Confirm requests with `tid=G-QS8T3YC21F` and `en=page_view` receive a successful response. Test click IDs are only for checking persistence, not valid Ads attribution.
3. Navigate using site links, then browser Back/Forward. Expect exactly one GA4 pageview per navigation. Check `dl` for the correct sanitized URL and `dr` for the prior public URL. Duplicate events indicate automatic history measurement or another GA4 installation is still active.
4. In DevTools → Application → Session Storage, inspect `lvd_marketing_attribution`. Confirm the campaign/GCLID survives navigation to `/inquire` and refresh.
5. Using approved test details, successfully submit each form. Expect one `generate_lead`, with the matching form ID. A validation failure or failed API request must emit none. Refresh `/thank-you`: no additional GA4 lead.
6. Complete a test appointment in the Calendly embed. Expect one `book_appointment`. Opening the scheduler or selecting a time alone must emit none. Cancel the test booking afterward if needed.
7. Inspect GA4 collect payloads and DebugView parameters: no name, email, phone, form answers, or Calendly invitee information. Test `/welcome?email=qa%40example.com` to verify arbitrary query parameters do not appear in GA4 page locations.
8. Confirm Tag Assistant still shows `AW-11134478295` and the existing form conversion destination `AW-11134478295/LOpLCJ-l-ckcENfPqr0p` and booking destination `AW-11134478295/yhlaCPiwzeMcENfPqr0p` on their existing triggers. Check Ads conversion settings separately to ensure no GA4 events are Primary imports.

Realtime/DebugView receipt is the final end-to-end check; local tests cannot confirm receipt by the GA4 property. Standard reports may take 24–48 hours.

## Local checks

- `node --test tests/ga4.test.cjs`
- `npx tsc --noEmit`
- `npx eslint src/lib/ga4.ts src/lib/lead-submit.ts src/components/GA4Tracking.tsx src/components/MarketingScripts.tsx`
- `npm run build`

## Production build verification — 2026-09-09

`npm run build` completed successfully with Next.js 16.2.10 / Turbopack: compilation, TypeScript, page-data collection, all 36 static pages, and final optimization passed with exit code 0 and no build warnings.

The restricted execution environment could not resolve `fonts.googleapis.com`, while the root layout uses `next/font/google`. The restricted build remained at compilation. Running the same unmodified production build with network access completed successfully (compilation: 2.9 seconds). No source-code or bundler change was required. Build environments need access to the Google Fonts stylesheet/font hosts for the existing font setup.

All four GA4 regression tests passed. Targeted ESLint reported no errors and only the two existing tracking-pixel `<img>` warnings in MarketingScripts.tsx. No deployment or GA4 account-setting changes were performed.
