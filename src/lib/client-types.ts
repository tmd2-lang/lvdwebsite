export const PLANNING_PACKAGE_IDS = [
  "venue_finder",
  "coordinating",
  "partial_planning",
  "full_planning",
  "custom",
] as const;

export type PlanningPackageId = (typeof PLANNING_PACKAGE_IDS)[number];

export const DESIGN_TIER_IDS = ["essentials", "design-florals", "production"] as const;

export type DesignTierId = (typeof DESIGN_TIER_IDS)[number];

export const CLIENT_STATUSES = ["active", "booked", "complete", "archived"] as const;

export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export const PLANNING_PACKAGE_LABELS: Record<PlanningPackageId, string> = {
  venue_finder: "Venue Finder",
  coordinating: "Coordinating",
  partial_planning: "Partial Planning",
  full_planning: "Full Planning",
  custom: "Custom",
};

export const DESIGN_TIER_LABELS: Record<DesignTierId, string> = {
  essentials: "Elegant",
  "design-florals": "Design + Florals",
  production: "Full Production",
};

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  active: "Active",
  booked: "Booked",
  complete: "Complete",
  archived: "Archived",
};

export type PortalClient = {
  id: string;
  created_at: string;
  updated_at: string;
  partner_one_name: string;
  partner_two_name: string | null;
  display_name: string;
  email: string | null;
  phone: string | null;
  event_date: string | null;
  date_undecided: boolean;
  venue: string | null;
  location: string | null;
  guest_count: string | null;
  planning_package: PlanningPackageId;
  design_tier: DesignTierId | null;
  lead_id: string | null;
  status: ClientStatus;
  notes: string | null;
};

export type NewClientInput = {
  partnerOneName: string;
  partnerTwoName?: string;
  email?: string;
  phone?: string;
  eventDate?: string;
  venue?: string;
  location?: string;
  guestCount?: string;
  planningPackage: PlanningPackageId;
  designTier?: DesignTierId | null;
  notes?: string;
};

/** "Amara & Julien", or just the one name when there is only one. */
export function coupleDisplayName(partnerOne: string, partnerTwo?: string | null) {
  const one = partnerOne.trim();
  const two = (partnerTwo || "").trim();
  return two ? `${one} & ${two}` : one;
}
