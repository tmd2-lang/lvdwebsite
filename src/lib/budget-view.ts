/**
 * The parts of the client budget that are safe in the browser: labels, and the
 * workbook's math. `budget-data.ts` talks to the database and stays on the server.
 *
 * Rules carried over from Irene's budget workbook (via the Muse package):
 * - Forecast per line = max(estimated, contracted) + approved changes.
 * - Contingency is a reserve off the approved budget, never a spend category.
 * - A payment is Paid at zero balance, Overdue past its date, Due Soon within
 *   14 days, otherwise Not Due. Disputed and Waived are set by hand.
 */

export const BUDGET_CATEGORIES = [
  "Planning & Management",
  // LVD's own design & florals contract. Outside florists stay in Floral & Decor.
  "Design + Florals",
  "Venue & Site Fees",
  "Catering & Food",
  "Beverage & Bar",
  "Floral & Decor",
  "Rentals & Tabletop",
  "Lighting, Sound & Production",
  "Photography",
  "Videography",
  "Entertainment",
  "Attire",
  "Beauty",
  "Stationery & Signage",
  "Transportation",
  "Hospitality & Accommodations",
  "Cake & Desserts",
  "Ceremony & Officiant",
  "Security, Insurance & Permits",
  "Gifts & Favors",
  "Taxes, Service Charges & Gratuities",
  "Other",
] as const;
export type BudgetCategory = (typeof BUDGET_CATEGORIES)[number];

export const BUDGET_SIDES = ["lvd_planning", "lvd_design", "external", "client_direct"] as const;
export type BudgetSide = (typeof BUDGET_SIDES)[number];
export const BUDGET_SIDE_LABELS: Record<BudgetSide, string> = {
  lvd_planning: "LVD Planning",
  lvd_design: "LVD Design & Floral",
  external: "External vendor",
  client_direct: "Client direct",
};

export const LINE_STATUSES = ["planned", "quoted", "contracted", "partially_paid", "paid", "canceled"] as const;
export type LineStatus = (typeof LINE_STATUSES)[number];
export const LINE_STATUS_LABELS: Record<LineStatus, string> = {
  planned: "Planned",
  quoted: "Quoted",
  contracted: "Contracted",
  partially_paid: "Partially paid",
  paid: "Paid",
  canceled: "Canceled",
};

export const PAYMENT_TYPES = ["retainer", "installment", "final_balance", "overtime", "refund", "other"] as const;
export type PaymentType = (typeof PAYMENT_TYPES)[number];
export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  retainer: "Retainer",
  installment: "Installment",
  final_balance: "Final balance",
  overtime: "Overtime",
  refund: "Refund / credit",
  other: "Other",
};

export const PAYERS = ["client", "lvd", "family"] as const;
export type Payer = (typeof PAYERS)[number];
export const PAYER_LABELS: Record<Payer, string> = {
  client: "Client",
  lvd: "Lady Victoria Designs",
  family: "Family / other",
};

export const MANUAL_PAYMENT_STATUSES = ["disputed", "waived"] as const;
export type ManualPaymentStatus = (typeof MANUAL_PAYMENT_STATUSES)[number];
export type PaymentStatus = "not_due" | "due_soon" | "overdue" | "paid" | ManualPaymentStatus;
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  not_due: "Not due",
  due_soon: "Due soon",
  overdue: "Overdue",
  paid: "Paid",
  disputed: "Disputed",
  waived: "Waived",
};

export type BudgetSetup = {
  approved_cents: number;
  contingency_percent: number;
  category_targets: Record<string, number>;
};

export type BudgetLine = {
  wave_url?: string | null;
  id: string;
  client_id: string;
  category: string;
  side: BudgetSide;
  vendor: string;
  description: string | null;
  status: LineStatus;
  estimated_cents: number;
  contracted_cents: number;
  changes_cents: number;
  notes: string | null;
  position: number;
  created_at: string;
};

export type BudgetPayment = {
  id: string;
  client_id: string;
  line_id: string;
  payment_type: PaymentType;
  payer: Payer;
  due_on: string | null;
  amount_cents: number;
  paid_cents: number;
  paid_on: string | null;
  manual_status: ManualPaymentStatus | null;
  notes: string | null;
  created_at: string;
};

export const EMPTY_SETUP: BudgetSetup = { approved_cents: 0, contingency_percent: 10, category_targets: {} };

function isOneOf<T extends string>(list: readonly T[], value: unknown): value is T {
  return typeof value === "string" && (list as readonly string[]).includes(value);
}
export const isBudgetCategory = (value: unknown): value is BudgetCategory => isOneOf(BUDGET_CATEGORIES, value);
export const isBudgetSide = (value: unknown): value is BudgetSide => isOneOf(BUDGET_SIDES, value);
export const isLineStatus = (value: unknown): value is LineStatus => isOneOf(LINE_STATUSES, value);
export const isPaymentType = (value: unknown): value is PaymentType => isOneOf(PAYMENT_TYPES, value);
export const isPayer = (value: unknown): value is Payer => isOneOf(PAYERS, value);
export const isManualPaymentStatus = (value: unknown): value is ManualPaymentStatus => isOneOf(MANUAL_PAYMENT_STATUSES, value);

export function isLvdSide(side: BudgetSide) {
  return side === "lvd_planning" || side === "lvd_design";
}

/** max(estimated, contracted) + changes. A canceled line forecasts nothing. */
export function lineForecast(line: BudgetLine) {
  if (line.status === "canceled") return 0;
  return Math.max(line.estimated_cents, line.contracted_cents) + line.changes_cents;
}

export function linePaid(line: BudgetLine, payments: BudgetPayment[]) {
  return payments.filter((payment) => payment.line_id === line.id).reduce((sum, payment) => sum + payment.paid_cents, 0);
}

function daysUntil(date: string) {
  const today = new Date();
  const midnightUtcToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((new Date(`${date}T00:00:00Z`).getTime() - midnightUtcToday) / 86_400_000);
}

export function paymentBalance(payment: BudgetPayment) {
  return Math.max(payment.amount_cents - payment.paid_cents, 0);
}

export function paymentStatus(payment: BudgetPayment): PaymentStatus {
  if (payment.manual_status) return payment.manual_status;
  if (paymentBalance(payment) === 0) return "paid";
  if (!payment.due_on) return "not_due";
  const days = daysUntil(payment.due_on);
  if (days < 0) return "overdue";
  if (days <= 14) return "due_soon";
  return "not_due";
}

export type BudgetTotals = {
  approved: number;
  reserve: number;
  forecast: number;
  contracted: number;
  paid: number;
  remaining: number;
  /** Approved − reserve − forecast. Negative means over budget. */
  unallocated: number;
  overdue: number;
  dueSoon: number;
  perGuest: number | null;
};

export function budgetTotals(setup: BudgetSetup, lines: BudgetLine[], payments: BudgetPayment[], guestCount: number | null): BudgetTotals {
  const live = lines.filter((line) => line.status !== "canceled");
  const forecast = live.reduce((sum, line) => sum + lineForecast(line), 0);
  const contracted = live.reduce((sum, line) => sum + line.contracted_cents, 0);
  const paid = payments.reduce((sum, payment) => sum + payment.paid_cents, 0);
  const reserve = Math.round(setup.approved_cents * (setup.contingency_percent / 100));
  const owing = (status: PaymentStatus) => payments
    .filter((payment) => paymentStatus(payment) === status)
    .reduce((sum, payment) => sum + paymentBalance(payment), 0);

  return {
    approved: setup.approved_cents,
    reserve,
    forecast,
    contracted,
    paid,
    remaining: Math.max(forecast - paid, 0),
    unallocated: setup.approved_cents - reserve - forecast,
    overdue: owing("overdue"),
    dueSoon: owing("due_soon"),
    perGuest: guestCount ? Math.round(forecast / guestCount) : null,
  };
}

export type CategoryRollup = {
  category: string;
  targetPercent: number | null;
  targetCents: number | null;
  forecast: number;
  paid: number;
  /** Target − forecast. Negative means the category is over its target. */
  variance: number | null;
  shareOfBudget: number | null;
};

/** Only categories with a line or a target, in the workbook's order. */
export function categoryRollup(setup: BudgetSetup, lines: BudgetLine[], payments: BudgetPayment[]): CategoryRollup[] {
  return BUDGET_CATEGORIES.flatMap((category) => {
    const categoryLines = lines.filter((line) => line.category === category);
    const targetPercent = setup.category_targets[category] ?? null;
    if (categoryLines.length === 0 && targetPercent === null) return [];
    const forecast = categoryLines.reduce((sum, line) => sum + lineForecast(line), 0);
    const paid = categoryLines.reduce((sum, line) => sum + linePaid(line, payments), 0);
    const targetCents = targetPercent === null ? null : Math.round(setup.approved_cents * (targetPercent / 100));
    return [{
      category,
      targetPercent,
      targetCents,
      forecast,
      paid,
      variance: targetCents === null ? null : targetCents - forecast,
      shareOfBudget: setup.approved_cents ? Math.round((forecast / setup.approved_cents) * 1000) / 10 : null,
    }];
  });
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function todayIso() {
  const today = new Date();
  return new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())).toISOString().slice(0, 10);
}

/**
 * The studio's 40/30/30 terms for an LVD line: retainer at signing (today),
 * 30% at 90 days out, 30% at 30 days out. The final payment takes any
 * rounding remainder so the three always add up to the forecast.
 */
export function lvdSchedule(totalCents: number, eventDate: string | null) {
  const retainer = Math.round(totalCents * 0.4);
  const installment = Math.round(totalCents * 0.3);
  return [
    { payment_type: "retainer" as const, amount_cents: retainer, due_on: todayIso() },
    { payment_type: "installment" as const, amount_cents: installment, due_on: eventDate ? addDays(eventDate, -90) : null },
    { payment_type: "final_balance" as const, amount_cents: totalCents - retainer - installment, due_on: eventDate ? addDays(eventDate, -30) : null },
  ];
}

const PLAN_STEPS = ["retainer", "installment", "final_balance"] as const;

/**
 * The couple's 40/30/30 across everything they owe LVD: planning and design,
 * Wave invoices and hand-entered lines together. Each contract keeps its own
 * schedule; this adds them up step by step so the couple sees one plan on
 * the full contract amount. Outside vendors are never part of it.
 */
export function lvdPaymentPlan(lines: BudgetLine[], payments: BudgetPayment[]) {
  const lvdLines = lines.filter((line) => isLvdSide(line.side) && line.status !== "canceled");
  const lvdIds = new Set(lvdLines.map((line) => line.id));
  const lvdPayments = payments.filter((payment) => lvdIds.has(payment.line_id));
  const total = lvdLines.reduce((sum, line) => sum + lineForecast(line), 0);
  const paid = lvdPayments.reduce((sum, payment) => sum + payment.paid_cents, 0);
  const steps = PLAN_STEPS.map((type) => {
    const rows = lvdPayments.filter((payment) => payment.payment_type === type);
    const amount = rows.reduce((sum, payment) => sum + payment.amount_cents, 0);
    const stepPaid = rows.reduce((sum, payment) => sum + Math.min(payment.paid_cents, payment.amount_cents), 0);
    const dates = rows.flatMap((payment) => (payment.due_on ? [payment.due_on] : [])).sort();
    return { type, label: PAYMENT_TYPE_LABELS[type], amount, paid: stepPaid, balance: amount - stepPaid, due: dates[0] ?? null };
  });
  // Lines nobody has scheduled yet still count toward the total.
  const scheduled = steps.reduce((sum, step) => sum + step.amount, 0);
  return { total, paid, remaining: Math.max(total - paid, 0), unscheduled: Math.max(total - scheduled, 0), steps };
}

/** "12,500.50" or "$12,500.50" typed by a person → cents. Null if unreadable. */
export function parseDollars(value: string): number | null {
  const cleaned = value.replace(/[$,\s]/g, "");
  if (cleaned === "") return 0;
  if (!/^-?\d+(\.\d{0,2})?$/.test(cleaned)) return null;
  return Math.round(Number(cleaned) * 100);
}

/** Cents → "12500.50" for an input box. */
export function centsToInput(cents: number) {
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
}
