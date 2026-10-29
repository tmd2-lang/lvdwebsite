# Wave setup and release checklist

Build 6 reads Wave only. The server has no Wave invoice-creation or payment-writing operations.

## Remaining account setup

1. Confirm the Wave business "Planning & Coordination LVD" has an active Wave Pro or Wave Advisor subscription.
2. Register the portal developer app in Wave. Configure the exact callback:
   `https://www.ladyvictoriadesigns.com/api/admin/wave/callback`.
   Local development can use a separately registered `http://localhost:3000/api/admin/wave/callback`.
3. Configure server environment values (never NEXT_PUBLIC values):
   - `WAVE_CLIENT_ID`
   - `WAVE_CLIENT_SECRET`
   - `WAVE_REDIRECT_URI` — exact registered callback above
   - `WAVE_TOKEN_ENCRYPTION_KEY` — 32 random bytes encoded as base64; generate with `openssl rand -base64 32` directly into secure settings, not chat.
   - Existing `CRON_SECRET` protects the scheduled refresh endpoint.
4. Run `supabase/wave-schema.sql` in Supabase. This does not connect accounts or import data.
5. Studio owner opens `/admin/portal/wave` and connects through OAuth. Irene signs into Wave herself and authorizes the correct business. Requested scopes: business:read, customer:read, invoice:read, product:read (product names on invoice lines). No password sharing or write/send scopes.
6. The callback verifies the exact business name and pins its stable ID. Reconnecting to a different business ID is refused. Tokens are encrypted before database storage and never sent to the browser.
7. Refresh invoices. Confirm customer → event client record → Planning or Design track for each invoice. Matching email is a suggestion, never automatic matching. Each portal client record represents one event; a person invited to several records can use the event switcher. Creating/inviting those event records remains an explicit studio action.
8. Record actual signing dates and verify signed agreements. Review all invoices for the customer, then confirm the complete event invoice set to enable automatic checklist updates. A newly discovered billable invoice for that customer resets confirmation. Existing manual LVD budget lines for a track must be resolved before Wave mapping; history is not deleted automatically.
9. Validate against Irene’s examples in the live account: #528, partial/overdue #491, overdue #514, Lola’s separate events and Ritwik’s separate tracks. No real examples have been imported or treated as test records by this build.

## Environments and release

- Use a separate Supabase database for a fully separate staging environment. If localhost and production share one database, they also share the connection and must use the same encryption key and compatible Wave app settings. Prefer the production callback for the real connection; do not casually overwrite it from localhost.
- Keep the encryption key stable. Rotating it requires a controlled migration or reconnect; old ciphertext cannot be decrypted by a new key.
- Refresh is manual plus a daily Vercel cron at 12:00 UTC. Payment status is not real-time; screens show last-sync time. The cron skips when no connection exists. Initial Wave authorization and live refresh remain unverified until access is available.
- A full paginated fetch succeeds before the atomic snapshot is applied. Failures retain prior data. Concurrent jobs use a database lease. No partial import is presented as a successful refresh.
- TJ handles deployment verification; do not resume dashboard/alias checks without a new request.
- `/admin/portal/wave/demo` is an authenticated, clearly labeled TEST preview. It saves nothing and uses invented data, not Irene’s live examples.

## Financial behavior

- 40% at actual signing, 30% at event minus 90 days, remainder at minus 30 days; paid money applies cumulatively in that order. Missing dates remain unknown. Wave's single invoice due date is retained as source metadata but does not replace installment dates.
- Draft/saved/unknown-status invoices, missing invoices, and unsupported currencies stay out of couple totals. USD is the supported first release; unsupported currency rows remain visible to the studio for review, not silently converted.
- Wave amount paid and balance are authoritative. Invoice-level adjustments reconcile line totals; exact-cent allocations and overpayment credits preserve aggregate amounts. Allocated installments are not presented as individual payment receipts.
- Couple statuses: Sent / awaiting payment, Partially paid, Paid in full, Past due. Links point to the Wave invoice, where terms and payment options live.
- Budget lines/payments are read-only projections of mapped Wave invoices, not a second editable ledger. Canceled manual-line payments are excluded from active totals. Internal budget setup and outside-vendor expenses remain studio-managed.
- Milestones require every mapped billable invoice for the event to qualify. Retainer received is a displayed milestone, not an invented checklist task. LVD-001 also requires explicit studio signature verification; LVD-104 requires cumulative 70%; LVD-108 requires zero balance. Only sync-owned completions are reopened after a reversal; manually completed tasks remain intact. Notes/owners/manual dates are preserved.
- LVD-105 is flagged for overdue installments, with 7-day late-fee review and 14-day work-pause review. No fee is charged and work is not automatically paused.

## Reference docs

- https://developer.waveapps.com/hc/en-us/articles/360019493652-OAuth-Guide
- https://developer.waveapps.com/hc/en-us/articles/360032818132-OAuth-Scopes
- https://developer.waveapps.com/hc/en-us/articles/360038426192-Query-List-invoices
