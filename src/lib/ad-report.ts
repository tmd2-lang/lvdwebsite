/**
 * Step 6: per-ad results, from ad click to booked dollars. Groups inquiries by
 * the Meta ad they first came from and adds up what happened to them.
 */
import type { AdminLead } from "./admin-types";
import { adName, platformName } from "./ad-source";

export const HIGH_BUDGET_FROM = 20_000;

export type AdRow = {
  key: string;
  adId: string | null;
  label: string;
  inquiries: number;
  highBudget: number;
  consults: number;
  completed: number;
  goodFit: number;
  proposals: number;
  booked: number;
  bookedAmount: number;
  lost: number;
  spend: number | null;
};

/** "$20,000 – $34,000" → 20000, "$55,000+" → 55000, anything else → null. */
export function budgetFloor(investment: string | null | undefined) {
  const match = investment?.match(/\$\s?([\d,]+)/);
  return match ? Number(match[1].replace(/,/g, "")) : null;
}

function emptyRow(key: string, adId: string | null, label: string, spend: number | null): AdRow {
  return { key, adId, label, inquiries: 0, highBudget: 0, consults: 0, completed: 0, goodFit: 0, proposals: 0, booked: 0, bookedAmount: 0, lost: 0, spend };
}

export function buildAdReport(leads: AdminLead[], spendByAd: Record<string, number> = {}) {
  const rows = new Map<string, AdRow>();
  for (const lead of leads) {
    let key: string; let row: AdRow | undefined;
    if (lead.meta_ad_id) {
      key = `meta:${lead.meta_ad_id}`;
      row = rows.get(key) || emptyRow(key, lead.meta_ad_id, `${adName(lead)}`, spendByAd[lead.meta_ad_id] ?? null);
    } else if (lead.utm_source) {
      key = `other:${lead.utm_source.toLowerCase()}`;
      row = rows.get(key) || emptyRow(key, null, `${platformName(lead.utm_source)} (tagged link, not a Meta ad)`, null);
    } else {
      key = "none";
      row = rows.get(key) || emptyRow(key, null, "No ad (Instagram bio, referrals, Google, direct…)", null);
    }
    row.inquiries += 1;
    if ((budgetFloor(lead.investment) ?? 0) >= HIGH_BUDGET_FROM) row.highBudget += 1;
    const hadConsult = Boolean(lead.consult_outcome) || (lead.appointments || []).some((item) => item.status === "scheduled");
    if (hadConsult) row.consults += 1;
    if (lead.consult_outcome === "completed") row.completed += 1;
    if (lead.fit === "good_fit") row.goodFit += 1;
    if (lead.proposal_amount != null) row.proposals += 1;
    // Bookings marked with the old status dropdown count too, just without an amount.
    if (lead.sales_outcome === "booked" || (lead.status === "booked" && lead.sales_outcome !== "lost")) {
      row.booked += 1; row.bookedAmount += Number(lead.booked_amount) || 0;
    }
    if (lead.sales_outcome === "lost") row.lost += 1;
    rows.set(key, row);
  }
  // Ads with spend but no inquiries still belong in the report.
  for (const [adId, spend] of Object.entries(spendByAd)) {
    const key = `meta:${adId}`;
    if (!rows.has(key)) rows.set(key, emptyRow(key, adId, adName({ meta_ad_id: adId }) || `Ad ${adId}`, spend));
  }
  const all = [...rows.values()];
  const ads = all.filter((row) => row.adId).sort((a, b) => b.bookedAmount - a.bookedAmount || b.inquiries - a.inquiries);
  const other = all.filter((row) => !row.adId).sort((a, b) => b.inquiries - a.inquiries);
  const totals = ads.reduce((sum, row) => ({
    ...sum,
    inquiries: sum.inquiries + row.inquiries, highBudget: sum.highBudget + row.highBudget, consults: sum.consults + row.consults,
    completed: sum.completed + row.completed, goodFit: sum.goodFit + row.goodFit, proposals: sum.proposals + row.proposals,
    booked: sum.booked + row.booked, bookedAmount: sum.bookedAmount + row.bookedAmount, lost: sum.lost + row.lost,
    spend: row.spend == null ? sum.spend : (sum.spend ?? 0) + row.spend,
  }), emptyRow("total", null, "All Meta ads", null));
  return { ads, other, totals };
}

/** Spend ÷ count, or null when either side is missing. */
export function costPer(spend: number | null, count: number) {
  return spend != null && count > 0 ? spend / count : null;
}
