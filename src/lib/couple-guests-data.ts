import "server-only";
import { getGuests } from "@/lib/guests-data";
import { projectCoupleGuestRecord, type CoupleGuestKind, type CoupleGuests } from "@/lib/couple-guests-view";
import { text, type GuestData, type GuestRecord } from "@/lib/guests-view";

export async function getCoupleGuests(clientId: string): Promise<CoupleGuests> {
  const { records, settings } = await getGuests(clientId);
  return {
    records: records.map(projectCoupleGuestRecord).filter((r) => r !== null),
    tables: records.filter((r) => r.kind === "table").map((r) => ({ id: r.id, name: text(r.data, "name") })),
    events: settings.events, countsLocked: settings.counts_locked,
  };
}
export class CoupleGuestConflict extends Error {}

/** This service-only RPC is only reachable after a session-derived client scope. */
export async function mutateCoupleGuest(input: { clientId: string; recordId: string | null; kind: CoupleGuestKind; action: "save" | "delete"; patch: GuestData; expected: string | null; by: string }): Promise<GuestRecord | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Guest editing is not configured.");
  const response = await fetch(`${url}/rest/v1/rpc/mutate_couple_guest`, {
    method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, cache: "no-store",
    body: JSON.stringify({ p_client_id: input.clientId, p_record_id: input.recordId, p_kind: input.kind, p_action: input.action, p_patch: input.patch, p_expected: input.expected, p_by: input.by }),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    if (result?.code === "40001") throw new CoupleGuestConflict("This guest was updated since you opened it. Refresh the list and try again.");
    throw new Error("Your guest changes could not be saved. Refresh and try again.");
  }
  return result as GuestRecord | null;
}
