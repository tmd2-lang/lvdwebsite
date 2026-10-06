# Admin leads change log

## September 30, 2026 — Release 1 (source ready; production deployment not verified)

### Changes

- Combine status, studio view history, and notes filters. Status includes New / Reviewing (not contacted), Contacted, Booked, Archived, and the other existing stages.
- Sort by received date (newest or oldest), event date, or latest activity. Undecided event dates sort last.
- Search names, email addresses, phone numbers, venues, event types, ISO dates, and private note text. Show matching and total inquiry counts, plus Clear filters.
- Display status, note count, view history, received time, and latest activity in each lead row.
- Show status near the top of the lead detail, with all stages selectable, including restoring archived inquiries and correcting accidental status changes.
- Show event date, celebration, guests, venue, and budget as labeled fields.
- Clear the detail pane when search or filters change; an empty result no longer displays the previous lead. Clear bulk selections on filter changes so hidden leads are not inadvertently deleted.
- Keep an explicitly opened lead visible if recording its view or changing its status makes it stop matching the current filters. Explain why it is no longer in the list.
- Keep note drafts tied to the opened inquiry rather than carrying them into another person's record.
- Use New inquiries and Recent submissions on the studio home page; remove the incorrect claim that client portals are not set up.

### Activity tracking

- Shared across the studio, with the actual signed-in staff identity. Client-supplied identity fields are ignored.
- Track one explicit open per inquiry per page session, including a direct inquiry link. Merely displaying the list does not mark leads viewed.
- Record views, status changes, and note creation. Display the latest 30 recorded events in the inquiry.
- Status/note writes and their activity events use one database transaction.
- Existing leads without a tracked view are labeled Earlier history unknown. Only leads received after tracking starts can be labeled Not viewed yet.
- Gmail opens and calls do not automatically mark a lead contacted. Contacted remains a manual workflow status; this release does not sync sent emails or replies.
- Timestamps are displayed in America/New_York.
- Read activity in pages to avoid PostgREST's 1,000-row response cap.

### Release prerequisites

1. Apply `supabase/lead-activity-schema.sql` in the correct Supabase project using SQL Editor or a database migration connection. This workspace has a REST service key, but no SQL/migration connection or Supabase management integration.
2. Verify the settings row, the activity table's RLS, and the service-role-only RPC. On an approved disposable inquiry, open it, save a note, and change its status; confirm the activity records persist across reloads and another staff account.
3. Deploy the reviewed source changes. Preserve the separate, pre-existing marketing work in this checkout.
4. Confirm both `/admin/inquiries` and `/admin/portal/inquiries` in production. Update this entry's deployment status and date.
5. Send the release note in `TANAH-UPDATE.md` after launch. It has not been sent.

Before the migration is applied, tracking is clearly marked Awaiting setup and the view filter is disabled. Status/notes/search continue working; legacy status/note writes do not create activity history until the migration is installed. Historical activity is never fabricated.

### Verification

- TypeScript and ESLint checks for the changed code.
- Automated tests cover combined filters, old/new view semantics, sorting, activity dates, paging, authenticated actor identity, denied access, invalid input, and database error handling.
- Local browser checks with existing inquiries: combined Contacted + Has notes filters, lead details, empty search, sorting, and mobile open/close layout. No live inquiry status or notes were modified during these checks.
- Database SQL execution and production persistence are pending the migration connection above.
- Build result and screenshot references are recorded below after final verification.

### Deferred

Messaging, ownership/assignments, follow-up reminders, and new bulk actions are separate release work.

### Final verification result

- **Passed:** 11 automated tests (`node --test tests/inquiry-views.test.cjs`).
- **Passed:** TypeScript (`npx tsc --noEmit`) and ESLint on changed TypeScript/React files.
- **Passed:** production build (`npm run build -- --webpack`) in the isolated preview copy. The first sandboxed attempt could not resolve Google Fonts; the network-enabled build passed.
- **Passed:** browser checks at desktop, 820px tablet (no horizontal overflow), and 390px phone widths. Combined Contacted + Has notes returned two existing inquiries; empty search showed zero results and removed stale details.
- Preview screenshots are retained locally and are not included in the source commit because they show existing inquiry records.
- **Pending:** migration execution, database persistence/transaction checks, and production deployment verification. No release note was sent to Tanah.

## October 1, 2026 — Scrolling and keyboard fixes

- Desktop inquiry details stay visible as the long lead list scrolls; their content scrolls independently inside a viewport-height panel.
- Opening a different inquiry resets its content to the top. Reopening the same inquiry on mobile also resets the scroll position.
- The mobile detail panel uses dialog semantics, moves focus to Close, keeps Tab/Shift+Tab inside, closes on Escape, restores the previous focus, and makes background navigation/list controls inert while open.
- Background page scrolling is paused during a mobile inquiry and restored on close, resize to desktop, or unmount.
- Validation: TypeScript and ESLint passed. All 14 tests passed, including new regressions for scroll reset, dialog semantics, background isolation, focus wrapping/restoration, Escape and desktop resize.
- Browser regression checks could not run: the browser URL policy rejected access to the local preview. These specific fixes still need a visual regression check.
- Supabase tracking migration remains unapplied; view tracking stays disabled with the setup notice until it is installed.

- October 1 production build passed (`npm run build -- --webpack` in the isolated copy). Source is included in the requested commit/push; production deployment has not been verified.

## October 5, 2026 — Personal inbox and overview

- Add four clickable overview cards: Total inquiries, Unread for the signed-in user, Contacted, and Booked. Cards reset other filters and show the corresponding list. Counts cover the full studio inbox.
- Opening an inquiry immediately clears that user's unread dot and bold name and updates their unread count. A failed save restores unread state and shows an error. Status stays independent.
- Personal filters: Unread for me / Read by me. Keep Seen by anyone in studio as a shared filter and show the latest opener on rows and details.
- Mark unread for me persists across reloads without deleting shared view history or resetting another user's inbox.
- Existing inquiries with no recorded view by this user start unread. Previously recorded personal views count as read.
- Uses the installed activity schema. A viewed-kind event with detail `unread` is a personal reset marker; view display helpers exclude these markers from shared opener history. No new SQL migration is required.
- Validation: 19 automated tests passed, including personal separation, server-owned actor identity, card counts, and the actual open/mark-unread component flow under the unread filter. TypeScript and ESLint passed.
- October 6: user verified the localhost preview works and approved production release. All 19 tests, TypeScript and ESLint passed again before committing.
