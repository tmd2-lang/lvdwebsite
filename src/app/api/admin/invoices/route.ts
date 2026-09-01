import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getClientById } from "@/lib/client-data";
import { createInvoice } from "@/lib/invoice-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

/** "12,500.50" or "$12,500" from a form field, to whole cents. */
function toCents(value: unknown) {
  const cleaned = text(value).replace(/[$,\s]/g, "");
  if (!cleaned) return 0;
  const amount = Number.parseFloat(cleaned);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.round(amount * 100);
}

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });

  try {
    const body = (await request.json()) as Record<string, unknown>;

    const clientId = text(body.clientId);
    const client = clientId ? await getClientById(clientId) : null;
    if (!client) return NextResponse.json({ error: "Choose a celebration for this invoice." }, { status: 400 });

    const name = text(body.name);
    if (!name) return NextResponse.json({ error: "Give this invoice a name." }, { status: 400 });

    const rawItems = Array.isArray(body.items) ? body.items : [];
    const items = rawItems
      .map((item) => {
        const row = (item || {}) as Record<string, unknown>;
        return { name: text(row.name), detail: text(row.detail), amountCents: toCents(row.amount) };
      })
      .filter((item) => item.name && item.amountCents > 0);

    if (items.length === 0) {
      return NextResponse.json({ error: "Add at least one line item with an amount." }, { status: 400 });
    }

    const dueOn = text(body.dueOn);
    if (dueOn && !/^\d{4}-\d{2}-\d{2}$/.test(dueOn)) {
      return NextResponse.json({ error: "Enter the due date as a calendar date." }, { status: 400 });
    }

    const paymentUrl = text(body.paymentUrl);
    if (paymentUrl && !/^https:\/\/\S+$/.test(paymentUrl)) {
      return NextResponse.json({ error: "The payment link must start with https://" }, { status: 400 });
    }

    const invoice = await createInvoice({
      clientId: client.id,
      name,
      category: text(body.category),
      phase: text(body.phase),
      dueOn,
      notes: text(body.notes),
      paymentUrl,
      items,
    });

    return NextResponse.json({ invoice });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save this invoice.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
