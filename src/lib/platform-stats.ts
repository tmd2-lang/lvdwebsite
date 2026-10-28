/**
 * Ad delivery numbers imported from a platform's CSV export (Reddit first),
 * lined up with the inquiries our own links captured. The join key is the
 * utm_content tag on each ad's link, e.g. "ad7_vision_brought_to_life".
 */
import type { AdminLead } from "./admin-types";
import { leadOutcomes } from "./ad-report";

export type PlatformId = "reddit";

export type PlatformStatRow = {
  platform: PlatformId;
  campaign: string;
  ad_group: string;
  ad_name: string;
  period_start: string;
  period_end: string;
  spend: number;
  impressions: number;
  clicks: number;
  utm_content: string | null;
  imported_at: string;
};

/** The numbers a CSV carries; the period comes from the file name or the person importing. */
export type ParsedAdRow = Pick<PlatformStatRow, "campaign" | "ad_group" | "ad_name" | "spend" | "impressions" | "clicks">;

export type PlatformReportRow = PlatformStatRow & {
  ctr: number | null;
  cpc: number | null;
  /** The tag used to match inquiries: the saved one, else the guess from the ad name. */
  tag: string | null;
  tagGuessed: boolean;
  inquiries: number;
  highBudget: number;
  consults: number;
  booked: number;
  bookedAmount: number;
  costPerInquiry: number | null;
};

export type PlatformReport = {
  rows: PlatformReportRow[];
  /** Inquiries from this platform in the period whose tag matched no ad. */
  unmatched: { inquiries: number; tags: string[] };
  totals: { spend: number; impressions: number; clicks: number; inquiries: number; costPerInquiry: number | null };
  period: { start: string; end: string } | null;
  importedAt: string | null;
};

/** Reads CSV text, including quoted commas, doubled quotes and a leading byte-order mark. */
export function parseCsv(text: string) {
  const rows: string[][] = [];
  let field = ""; let row: string[] = []; let quoted = false;
  const source = text.replace(/^﻿/, "");
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"' && source[index + 1] === '"') { field += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(field); field = ""; }
    else if (char === "\n" || char === "\r") {
      if (char === "\r" && source[index + 1] === "\n") index += 1;
      row.push(field); field = "";
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
    } else field += char;
  }
  row.push(field);
  if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  return rows;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && DATE_PATTERN.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

/** "2026_custom_2026-09-01_2026-10-28 (2).csv" → { start: "2026-09-01", end: "2026-10-28" } */
export function periodFromFilename(name: string) {
  const match = name.match(/(\d{4}-\d{2}-\d{2})_(\d{4}-\d{2}-\d{2})/);
  return match && isIsoDate(match[1]) && isIsoDate(match[2]) ? { start: match[1], end: match[2] } : null;
}

/** Reddit's per-ad export. Campaign-level and ad-group-level exports have no "Ad Name" column and are refused. */
export function parseRedditAdCsv(text: string): { rows: ParsedAdRow[]; error: string | null } {
  const table = parseCsv(text);
  if (table.length < 2) return { rows: [], error: "That file has no rows in it." };
  const header = table[0].map((cell) => cell.trim().toLowerCase());
  const column = (name: string) => header.indexOf(name.toLowerCase());
  const at = {
    campaign: column("Campaign Name"), adGroup: column("Ad Group Name"), ad: column("Ad Name"),
    impressions: column("Impressions"), clicks: column("Clicks"), spend: column("Amount Spent (USD)"),
  };
  if (at.ad < 0) return { rows: [], error: "This export is not broken out by ad. In Reddit, export the report that has an Ad Name column." };
  if (at.campaign < 0 || at.impressions < 0 || at.clicks < 0 || at.spend < 0) {
    return { rows: [], error: "That does not look like a Reddit ads export. It needs Campaign Name, Impressions, Clicks and Amount Spent (USD)." };
  }
  const rows: ParsedAdRow[] = [];
  for (const cells of table.slice(1)) {
    const spend = Number(cells[at.spend]);
    const impressions = Number(cells[at.impressions]);
    const clicks = Number(cells[at.clicks]);
    const adName = (cells[at.ad] || "").trim();
    if (!adName) continue;
    if (![spend, impressions, clicks].every((value) => Number.isFinite(value) && value >= 0)) {
      return { rows: [], error: `The numbers for "${adName}" could not be read.` };
    }
    rows.push({
      campaign: (cells[at.campaign] || "").trim(), ad_group: at.adGroup >= 0 ? (cells[at.adGroup] || "").trim() : "",
      ad_name: adName, spend: Math.round(spend * 100) / 100, impressions: Math.round(impressions), clicks: Math.round(clicks),
    });
  }
  return rows.length ? { rows, error: null } : { rows: [], error: "No ads were found in that file." };
}

const adNumberToken = /^ad\d+$/;

function tokens(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(" ").filter(Boolean);
}

/**
 * Guess whether a link tag belongs to an ad from its name:
 * "ad7_vision_brought_to_life" ↔ "Your Vision, Brought to Life" (every tag word is in the name),
 * "ad2_one_vision" ↔ "Ad 2" (same ad number).
 */
export function tagMatchesAdName(tag: string, adName: string) {
  const tagTokens = tokens(tag);
  const nameTokens = tokens(adName);
  const words = tagTokens.filter((token) => !adNumberToken.test(token));
  if (words.length && words.every((word) => nameTokens.includes(word))) return true;
  const number = tagTokens.find((token) => adNumberToken.test(token));
  return Boolean(number) && nameTokens.length === 2 && nameTokens[0] === "ad" && `ad${nameTokens[1]}` === number;
}

/** The tag an inquiry arrived with: the first click's utm_content. */
export function leadTag(lead: AdminLead) {
  return (lead.attribution?.first?.params?.utm_content || lead.attribution?.last?.params?.utm_content || "").trim() || null;
}

function dayOf(iso: string) {
  return iso.slice(0, 10);
}

/** Joins imported ad numbers with the inquiries from that platform, one inquiry to exactly one ad. */
export function buildPlatformReport(platform: PlatformId, stats: PlatformStatRow[], leads: AdminLead[]): PlatformReport {
  if (!stats.length) {
    return { rows: [], unmatched: { inquiries: 0, tags: [] }, totals: { spend: 0, impressions: 0, clicks: 0, inquiries: 0, costPerInquiry: null }, period: null, importedAt: null };
  }
  const start = stats.reduce((min, row) => (row.period_start < min ? row.period_start : min), stats[0].period_start);
  const end = stats.reduce((max, row) => (row.period_end > max ? row.period_end : max), stats[0].period_end);
  const importedAt = stats.reduce((max, row) => (row.imported_at > max ? row.imported_at : max), stats[0].imported_at);

  const rows: PlatformReportRow[] = stats.map((stat) => ({
    ...stat,
    ctr: stat.impressions > 0 ? stat.clicks / stat.impressions : null,
    cpc: stat.clicks > 0 ? stat.spend / stat.clicks : null,
    tag: stat.utm_content || null, tagGuessed: false,
    inquiries: 0, highBudget: 0, consults: 0, booked: 0, bookedAmount: 0, costPerInquiry: null,
  }));

  const unmatchedTags = new Set<string>();
  let unmatched = 0;
  for (const lead of leads) {
    if ((lead.utm_source || "").toLowerCase() !== platform) continue;
    const day = dayOf(lead.created_at);
    if (day < start || day > end) continue;
    const tag = leadTag(lead);
    const sameTag = (row: PlatformReportRow) => Boolean(tag && row.utm_content && tokens(row.utm_content).join(" ") === tokens(tag).join(" "));
    // A saved tag always wins over a guess.
    const row = rows.find(sameTag) || rows.find((item) => Boolean(tag) && !item.utm_content && tagMatchesAdName(tag as string, item.ad_name));
    if (!row) { unmatched += 1; if (tag) unmatchedTags.add(tag); continue; }
    if (!row.utm_content) { row.tag = tag; row.tagGuessed = true; }
    const outcome = leadOutcomes(lead);
    row.inquiries += 1;
    if (outcome.highBudget) row.highBudget += 1;
    if (outcome.consult) row.consults += 1;
    if (outcome.booked) { row.booked += 1; row.bookedAmount += outcome.bookedAmount; }
  }
  for (const row of rows) row.costPerInquiry = row.inquiries > 0 ? row.spend / row.inquiries : null;
  rows.sort((a, b) => b.spend - a.spend);

  const spend = rows.reduce((sum, row) => sum + row.spend, 0);
  const inquiries = rows.reduce((sum, row) => sum + row.inquiries, 0) + unmatched;
  return {
    rows,
    unmatched: { inquiries: unmatched, tags: [...unmatchedTags] },
    totals: {
      spend, impressions: rows.reduce((sum, row) => sum + row.impressions, 0), clicks: rows.reduce((sum, row) => sum + row.clicks, 0),
      inquiries, costPerInquiry: inquiries > 0 ? spend / inquiries : null,
    },
    period: { start, end }, importedAt,
  };
}
