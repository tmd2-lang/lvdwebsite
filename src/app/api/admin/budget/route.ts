import { getWaveInvoices } from "@/lib/wave-data";
import { NextResponse } from "next/server";
import { canManageClientPortal, getAdminUser } from "@/lib/admin-auth";
import { getClientById } from "@/lib/client-data";
import {
  countPaymentsForLine,
  createLine,
  createPayments,
  deleteLine,
  deletePayment,
  getLine,
  saveSetup,
  updateLine,
  updatePayment,
  type LineInput,
  type PaymentInput,
} from "@/lib/budget-data";
import {
  isBudgetCategory,
  isBudgetSide,
  isLineStatus,
  isLvdSide,
  isManualPaymentStatus,
  isPayer,
  isPaymentType,
  lineForecast,
  lvdSchedule,
} from "@/lib/budget-view";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_CENTS = 100_000_000_00; // $100M: anything bigger is a typo.

class InputError extends Error {}

function cents(value: unknown, label: string, { signed = false } = {}): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isInteger(value) || Math.abs(value) > MAX_CENTS || (!signed && value < 0)) {
    throw new InputError(`${label} needs to be a dollar amount.`);
  }
  return value;
}

function text(value: unknown, max = 500): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") throw new InputError("Some text was not readable.");
  if (value.length > max) throw new InputError(`Keep that under ${max} characters.`);
  return value.trim() || null;
}

function date(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) throw new InputError("That date was not readable.");
  return value;
}

function lineInput(body: Record<string, unknown>): LineInput {
  const input: LineInput = {};
  if (body.category !== undefined) {
    if (!isBudgetCategory(body.category)) throw new InputError("Pick a category from the list.");
    input.category = body.category;
  }
  if (body.side !== undefined) {
    if (!isBudgetSide(body.side)) throw new InputError("Pick who the money goes to.");
    input.side = body.side;
  }
  if (body.status !== undefined) {
    if (!isLineStatus(body.status)) throw new InputError("Pick a status from the list.");
    input.status = body.status;
  }
  if (body.vendor !== undefined) {
    const vendor = text(body.vendor, 200);
    if (!vendor) throw new InputError("Name the vendor or expense.");
    input.vendor = vendor;
  }
  if (body.description !== undefined) input.description = text(body.description) ?? null;
  if (body.notes !== undefined) input.notes = text(body.notes, 2000) ?? null;
  const estimated = cents(body.estimated_cents, "Estimated");
  const contracted = cents(body.contracted_cents, "Contracted");
  const changes = cents(body.changes_cents, "Changes", { signed: true });
  if (estimated !== undefined) input.estimated_cents = estimated;
  if (contracted !== undefined) input.contracted_cents = contracted;
  if (changes !== undefined) input.changes_cents = changes;
  return input;
}

function paymentInput(body: Record<string, unknown>): PaymentInput {
  const input: PaymentInput = {};
  if (body.payment_type !== undefined) {
    if (!isPaymentType(body.payment_type)) throw new InputError("Pick a payment type from the list.");
    input.payment_type = body.payment_type;
  }
  if (body.payer !== undefined) {
    if (!isPayer(body.payer)) throw new InputError("Pick who is paying.");
    input.payer = body.payer;
  }
  if (body.manual_status !== undefined) {
    if (body.manual_status !== null && !isManualPaymentStatus(body.manual_status)) throw new InputError("That status is not on the list.");
    input.manual_status = body.manual_status;
  }
  const due = date(body.due_on);
  const paidOn = date(body.paid_on);
  if (due !== undefined) input.due_on = due;
  if (paidOn !== undefined) input.paid_on = paidOn;
  const amount = cents(body.amount_cents, "Amount due", { signed: body.payment_type === "refund" });
  const paid = cents(body.paid_cents, "Amount paid");
  if (amount !== undefined) input.amount_cents = amount;
  if (paid !== undefined) input.paid_cents = paid;
  if (body.notes !== undefined) input.notes = text(body.notes, 2000) ?? null;
  return input;
}

function idOf(value: unknown) {
  if (typeof value !== "string" || !value) throw new InputError("Which one?");
  return value;
}

// Owners and planners both work client budgets. One route, one action per call.
export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });
  if (!canManageClientPortal(user)) return NextResponse.json({ error: "Your account does not have client-portal access." }, { status: 403 });

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const client = await getClientById(typeof body.clientId === "string" ? body.clientId : "");
    if (!client) return NextResponse.json({ error: "That celebration no longer exists." }, { status: 404 });
    const by = user.email;
    if (Object.values(body).some(value => typeof value === "string" && value.startsWith("wave:"))) throw new InputError("Wave lines and payments are read-only. Update the invoice in Wave.");
    if (["addLine", "updateLine", "lvdLines"].includes(String(body.action))) {
      const wave = await getWaveInvoices(client.id);
      if (wave.length && (body.action === "lvdLines" || body.side === "lvd_planning" || body.side === "lvd_design")) throw new InputError("This event uses Wave for LVD charges. Edit those invoice lines in Wave.");
    }

    switch (body.action) {
      case "setup": {
        const approved = cents(body.approved_cents, "Approved budget");
        const contingency = body.contingency_percent;
        if (contingency !== undefined && (typeof contingency !== "number" || contingency < 0 || contingency > 50)) {
          throw new InputError("Contingency should be between 0% and 50%.");
        }
        let targets: Record<string, number> | undefined;
        if (body.category_targets !== undefined) {
          if (!body.category_targets || typeof body.category_targets !== "object") throw new InputError("Category targets were not readable.");
          targets = {};
          for (const [category, value] of Object.entries(body.category_targets as Record<string, unknown>)) {
            if (!isBudgetCategory(category)) continue;
            if (typeof value !== "number" || value < 0 || value > 100) throw new InputError(`The target for ${category} should be 0–100%.`);
            targets[category] = value;
          }
        }
        await saveSetup(client.id, {
          ...(approved !== undefined ? { approved_cents: approved } : {}),
          ...(typeof contingency === "number" ? { contingency_percent: contingency } : {}),
          ...(targets ? { category_targets: targets } : {}),
        }, by);
        break;
      }
      case "addLine": {
        const input = lineInput(body);
        if (!input.vendor) throw new InputError("Name the vendor or expense.");
        if (!input.category) throw new InputError("Pick a category from the list.");
        await createLine(client.id, input, by);
        break;
      }
      case "updateLine":
        await updateLine(client.id, idOf(body.lineId), lineInput(body), by);
        break;
      case "deleteLine":
        await deleteLine(client.id, idOf(body.lineId));
        break;
      case "addPayment": {
        const input = paymentInput(body);
        if (input.amount_cents === undefined) throw new InputError("Enter the amount due.");
        const line = await getLine(client.id, idOf(body.lineId));
        if (!line) throw new InputError("That line no longer exists.");
        await createPayments(client.id, line.id, [input], by);
        break;
      }
      case "updatePayment":
        await updatePayment(client.id, idOf(body.paymentId), paymentInput(body), by);
        break;
      case "deletePayment":
        await deletePayment(client.id, idOf(body.paymentId));
        break;
      case "lvdSchedule": {
        const line = await getLine(client.id, idOf(body.lineId));
        if (!line) throw new InputError("That line no longer exists.");
        if (!isLvdSide(line.side)) throw new InputError("The 40/30/30 schedule is only for LVD lines.");
        const total = lineForecast(line);
        if (total <= 0) throw new InputError("Add the line's amount first, then make the schedule.");
        if (await countPaymentsForLine(client.id, line.id)) {
          throw new InputError("This line already has payments. Remove them first to make a fresh schedule.");
        }
        await createPayments(client.id, line.id, lvdSchedule(total, client.event_date).map((payment) => ({ ...payment, payer: "client" as const })), by);
        break;
      }
      default:
        throw new InputError("Unknown budget action.");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save that.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
