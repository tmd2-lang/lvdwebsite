import {
  EMPTY_SETUP,
  type BudgetLine,
  type BudgetPayment,
  type BudgetSetup,
} from "@/lib/budget-view";

function databaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Client budgets are not configured.");
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
    const code = (payload as { code?: string } | null)?.code;
    if (code === "PGRST205") {
      throw new Error("Client budgets are not set up yet. Run supabase/budget-schema.sql in the Supabase SQL editor.");
    }
    const detail = (payload as { message?: string } | null)?.message;
    console.error("Budget request failed:", detail || JSON.stringify(payload) || response.status);
    throw new Error(detail ? `${failure} (${detail})` : failure);
  }
  return payload as T;
}

async function request<T>(path: string, init: RequestInit & { prefer?: string }, failure: string): Promise<T> {
  const { url } = databaseConfig();
  const { prefer, ...rest } = init;
  const response = await fetch(`${url}/rest/v1/${path}`, { ...rest, headers: databaseHeaders(prefer), cache: "no-store" });
  return responseJson<T>(response, failure);
}

const id = (value: string) => encodeURIComponent(value);

export type ClientBudget = { setup: BudgetSetup; lines: BudgetLine[]; payments: BudgetPayment[] };

export async function getBudget(clientId: string): Promise<ClientBudget> {
  const [setupRows, lines, payments] = await Promise.all([
    request<BudgetSetup[]>(`client_budgets?select=approved_cents,contingency_percent,category_targets&client_id=eq.${id(clientId)}`, {}, "Could not load the budget."),
    request<BudgetLine[]>(`client_budget_lines?select=*&client_id=eq.${id(clientId)}&order=position.asc,created_at.asc`, {}, "Could not load the budget lines."),
    request<BudgetPayment[]>(`client_budget_payments?select=*&client_id=eq.${id(clientId)}&order=due_on.asc.nullslast,created_at.asc`, {}, "Could not load the payment schedule."),
  ]);
  const setup = setupRows[0]
    ? { ...setupRows[0], approved_cents: Number(setupRows[0].approved_cents), contingency_percent: Number(setupRows[0].contingency_percent) }
    : EMPTY_SETUP;
  return {
    setup,
    // bigint columns can arrive as strings; the math needs numbers.
    lines: lines.map((line) => ({
      ...line,
      estimated_cents: Number(line.estimated_cents),
      contracted_cents: Number(line.contracted_cents),
      changes_cents: Number(line.changes_cents),
    })),
    payments: payments.map((payment) => ({
      ...payment,
      amount_cents: Number(payment.amount_cents),
      paid_cents: Number(payment.paid_cents),
    })),
  };
}

export async function saveSetup(clientId: string, setup: Partial<BudgetSetup>, by: string) {
  await request(`client_budgets?on_conflict=client_id`, {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=representation",
    body: JSON.stringify({ client_id: clientId, ...setup, updated_by: by }),
  }, "Could not save the budget setup.");
}

export type LineInput = Partial<Pick<BudgetLine,
  "category" | "side" | "vendor" | "description" | "status" | "estimated_cents" | "contracted_cents" | "changes_cents" | "notes">>;

export async function createLine(clientId: string, input: LineInput, by: string): Promise<BudgetLine> {
  const rows = await request<BudgetLine[]>("client_budget_lines", {
    method: "POST",
    prefer: "return=representation",
    body: JSON.stringify({ client_id: clientId, ...input, updated_by: by }),
  }, "Could not add that line.");
  if (!rows[0]) throw new Error("Could not add that line.");
  return rows[0];
}

/** Every change is scoped to the client too, so an id from another celebration does nothing. */
export async function updateLine(clientId: string, lineId: string, input: LineInput, by: string) {
  await request(`client_budget_lines?id=eq.${id(lineId)}&client_id=eq.${id(clientId)}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: JSON.stringify({ ...input, updated_by: by }),
  }, "Could not update that line.");
}

export async function deleteLine(clientId: string, lineId: string) {
  await request(`client_budget_lines?id=eq.${id(lineId)}&client_id=eq.${id(clientId)}`, {
    method: "DELETE",
    prefer: "return=minimal",
  }, "Could not remove that line.");
}

export async function getLine(clientId: string, lineId: string): Promise<BudgetLine | null> {
  const rows = await request<BudgetLine[]>(
    `client_budget_lines?select=*&id=eq.${id(lineId)}&client_id=eq.${id(clientId)}&limit=1`,
    {},
    "Could not load that line.",
  );
  return rows[0] ? { ...rows[0], estimated_cents: Number(rows[0].estimated_cents), contracted_cents: Number(rows[0].contracted_cents), changes_cents: Number(rows[0].changes_cents) } : null;
}

export async function countPaymentsForLine(clientId: string, lineId: string) {
  const rows = await request<{ id: string }[]>(
    `client_budget_payments?select=id&line_id=eq.${id(lineId)}&client_id=eq.${id(clientId)}`,
    {},
    "Could not load the payment schedule.",
  );
  return rows.length;
}

export type PaymentInput = Partial<Pick<BudgetPayment,
  "payment_type" | "payer" | "due_on" | "amount_cents" | "paid_cents" | "paid_on" | "manual_status" | "notes">>;

export async function createPayments(clientId: string, lineId: string, inputs: PaymentInput[], by: string) {
  await request("client_budget_payments", {
    method: "POST",
    prefer: "return=minimal",
    body: JSON.stringify(inputs.map((input) => ({ client_id: clientId, line_id: lineId, ...input, updated_by: by }))),
  }, "Could not add that payment.");
}

export async function updatePayment(clientId: string, paymentId: string, input: PaymentInput, by: string) {
  await request(`client_budget_payments?id=eq.${id(paymentId)}&client_id=eq.${id(clientId)}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: JSON.stringify({ ...input, updated_by: by }),
  }, "Could not update that payment.");
}

export async function deletePayment(clientId: string, paymentId: string) {
  await request(`client_budget_payments?id=eq.${id(paymentId)}&client_id=eq.${id(clientId)}`, {
    method: "DELETE",
    prefer: "return=minimal",
  }, "Could not remove that payment.");
}
