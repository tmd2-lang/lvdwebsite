/**
 * Human-readable "where this inquiry came from" labels, e.g.
 * "Instagram · BTS Transformation". The Meta ad ID stays the permanent key;
 * names are display labels only and may be a snapshot from the click.
 */

// Ads that ran before links carried utm_ad_name. Names as of 2026-10-05.
const LEGACY_META_AD_NAMES: Record<string, string> = {
  "52664971809074": "Video Ad 4 - RT",
  "52659929440274": "Video Ad 2 – SLP",
  "52668773909274": "BTS Transformation - Sept 2026",
  "52652216796074": "Outro - Copy",
  "52659929440674": "Video Ad 2 - LLP",
  "52668773958074": "Outro Control - 9.2.26",
  "52664970330674": "Video Ad 2 - RT",
};

const PLATFORMS: Record<string, string> = {
  ig: "Instagram", instagram: "Instagram",
  fb: "Facebook", facebook: "Facebook", meta: "Meta",
  an: "Meta Audience Network", msg: "Messenger", threads: "Threads",
  google: "Google", pinterest: "Pinterest",
};

export type AdSourceFields = {
  utm_source?: string | null;
  utm_campaign?: string | null;
  meta_ad_id?: string | null;
  attribution?: { first?: { params?: Record<string, string> } } | null;
};

export function platformName(source: string | null | undefined) {
  if (!source) return null;
  return PLATFORMS[source.toLowerCase()] || source;
}

export function adName(lead: AdSourceFields) {
  const captured = lead.attribution?.first?.params?.utm_ad_name;
  if (captured) return captured;
  if (lead.meta_ad_id) return LEGACY_META_AD_NAMES[lead.meta_ad_id] || `Ad ${lead.meta_ad_id}`;
  return null;
}

/** "Instagram · BTS Transformation", "Pinterest", or null when untagged. */
export function adSourceLabel(lead: AdSourceFields) {
  const platform = platformName(lead.utm_source);
  if (!platform) return null;
  const name = adName(lead);
  return name ? `${platform} · ${name}` : platform;
}
