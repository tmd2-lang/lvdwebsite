export const INVOICE_STATUSES = ["draft", "sent", "paid", "void"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  void: "Void",
};

export type InvoiceItem = {
  id: string;
  invoice_id: string;
  name: string;
  detail: string | null;
  amount_cents: number;
  position: number;
  paid: boolean;
  paid_at: string | null;
};

export type Invoice = {
  id: string;
  created_at: string;
  updated_at: string;
  client_id: string;
  reference: string;
  name: string;
  category: string | null;
  phase: string | null;
  issued_on: string;
  due_on: string | null;
  status: InvoiceStatus;
  notes: string | null;
  invoice_items: InvoiceItem[];
};

/** Cents to "$12,500" or "$12,500.50" — no stray decimals on round numbers. */
export function money(cents: number) {
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(dollars) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

export function invoiceTotal(invoice: Invoice) {
  return invoice.invoice_items.reduce((sum, item) => sum + item.amount_cents, 0);
}

export function invoicePaid(invoice: Invoice) {
  return invoice.invoice_items
    .filter((item) => item.paid)
    .reduce((sum, item) => sum + item.amount_cents, 0);
}

export function invoiceOutstanding(invoice: Invoice) {
  return invoiceTotal(invoice) - invoicePaid(invoice);
}

/** Totals across every invoice for one celebration. */
export function celebrationTotals(invoices: Invoice[]) {
  const billable = invoices.filter((invoice) => invoice.status !== "draft" && invoice.status !== "void");
  const total = billable.reduce((sum, invoice) => sum + invoiceTotal(invoice), 0);
  const paid = billable.reduce((sum, invoice) => sum + invoicePaid(invoice), 0);
  return { total, paid, remaining: total - paid, count: billable.length };
}
