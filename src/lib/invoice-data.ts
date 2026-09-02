import type { Invoice, InvoiceStatus } from "@/lib/invoice-types";

function databaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Invoice storage is not configured.");
  return { url, serviceRoleKey };
}

function databaseHeaders(prefer?: string) {
  const { serviceRoleKey } = databaseConfig();
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

async function responseJson<T>(response: Response, failure: string): Promise<T> {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    console.error("Invoice request failed:", payload);
    throw new Error(failure);
  }
  return payload as T;
}

const SELECT = "*,invoice_items(*)";

function sortItems(invoices: Invoice[]) {
  for (const invoice of invoices) {
    invoice.invoice_items.sort((a, b) => a.position - b.position);
  }
  return invoices;
}

/** Every studio invoice, newest issue date first. */
export async function getInvoices(): Promise<Invoice[]> {
  const { url } = databaseConfig();
  const response = await fetch(
    `${url}/rest/v1/invoices?select=${SELECT}&order=issued_on.desc,created_at.desc`,
    { headers: databaseHeaders(), cache: "no-store" },
  );
  return sortItems(await responseJson<Invoice[]>(response, "Could not load invoices."));
}

/** Every invoice for one celebration, newest issue date first. */
export async function getInvoicesForClient(clientId: string): Promise<Invoice[]> {
  const { url } = databaseConfig();
  const response = await fetch(
    `${url}/rest/v1/invoices?select=${SELECT}&client_id=eq.${encodeURIComponent(clientId)}&order=issued_on.desc`,
    { headers: databaseHeaders(), cache: "no-store" },
  );
  return sortItems(await responseJson<Invoice[]>(response, "Could not load invoices."));
}

/**
 * One invoice, but only if it belongs to the celebration given.
 *
 * The client id is part of the query rather than checked afterwards, so a
 * client cannot open someone else's invoice by guessing its address.
 */
export async function getInvoiceForClient(invoiceId: string, clientId: string): Promise<Invoice | null> {
  const { url } = databaseConfig();
  const response = await fetch(
    `${url}/rest/v1/invoices?select=${SELECT}&id=eq.${encodeURIComponent(invoiceId)}&client_id=eq.${encodeURIComponent(clientId)}&limit=1`,
    { headers: databaseHeaders(), cache: "no-store" },
  );
  const rows = sortItems(await responseJson<Invoice[]>(response, "Could not load that invoice."));
  return rows[0] || null;
}

export type NewInvoiceInput = {
  clientId: string;
  name: string;
  category?: string;
  phase?: string;
  issuedOn?: string;
  dueOn?: string;
  status?: InvoiceStatus;
  notes?: string;
  paymentUrl?: string;
  items: { name: string; detail?: string; amountCents: number }[];
};

/** LVD-1001, then LVD-1002, and so on. */
async function nextReference() {
  const { url } = databaseConfig();
  const response = await fetch(
    `${url}/rest/v1/invoices?select=reference&order=reference.desc&limit=1`,
    { headers: databaseHeaders(), cache: "no-store" },
  );
  const rows = await responseJson<{ reference: string }[]>(response, "Could not generate an invoice number.");
  const last = rows[0]?.reference || "";
  const digits = Number.parseInt(last.replace(/^\D+/, ""), 10);
  return `LVD-${Number.isFinite(digits) ? digits + 1 : 1001}`;
}

export async function createInvoice(input: NewInvoiceInput): Promise<Invoice> {
  const { url } = databaseConfig();

  const items = input.items.filter((item) => item.name.trim() && item.amountCents > 0);
  if (items.length === 0) throw new Error("Add at least one line item with an amount.");

  const reference = await nextReference();
  const invoiceResponse = await fetch(`${url}/rest/v1/invoices`, {
    method: "POST",
    headers: databaseHeaders("return=representation"),
    body: JSON.stringify({
      client_id: input.clientId,
      reference,
      name: input.name.trim(),
      category: input.category?.trim() || null,
      phase: input.phase?.trim() || null,
      issued_on: input.issuedOn || new Date().toISOString().slice(0, 10),
      due_on: input.dueOn || null,
      status: input.status || "sent",
      notes: input.notes?.trim() || null,
      payment_url: input.paymentUrl?.trim() || null,
    }),
    cache: "no-store",
  });

  const created = await responseJson<Invoice[]>(invoiceResponse, "Could not save this invoice.");
  const invoice = created[0];
  if (!invoice) throw new Error("Could not save this invoice.");

  const itemsResponse = await fetch(`${url}/rest/v1/invoice_items`, {
    method: "POST",
    headers: databaseHeaders("return=representation"),
    body: JSON.stringify(items.map((item, index) => ({
      invoice_id: invoice.id,
      name: item.name.trim(),
      detail: item.detail?.trim() || null,
      amount_cents: item.amountCents,
      position: index,
    }))),
    cache: "no-store",
  });

  invoice.invoice_items = await responseJson(itemsResponse, "The invoice saved, but its line items did not.");
  return invoice;
}
