import { categoryRollup, lvdPaymentPlan } from "@/lib/budget-view";
import type { ClientBudget } from "@/lib/budget-data";
import { formatCalendarDate } from "@/lib/calendar-view";
import { money } from "@/lib/invoice-types";
import styles from "./couple-planning.module.css";

/** The couple's one money view: LVD's 40/30/30 on the full contract, then their whole budget. */
export default function CoupleMoney({ budget }: { budget: ClientBudget }) {
  const plan = lvdPaymentPlan(budget.lines, budget.payments);
  const categories = categoryRollup(budget.setup, budget.lines, budget.payments).filter((row) => row.forecast > 0 || row.targetCents);
  return <>
    <section className={styles.card}>
      <h2>Your payment schedule</h2>
      <p>{money(plan.total)} with Lady Victoria Designs · {money(plan.paid)} paid · {money(plan.remaining)} remaining</p>
      {plan.total === 0 ? <p className={styles.empty}>Your schedule will appear once the studio adds your contract.</p> : <ul className={styles.list}>
        {plan.steps.filter((step) => step.amount > 0).map((step) => <li key={step.type}>
          <div><h3>{step.label} · {money(step.amount)}</h3><small>{step.due ? `Due ${formatCalendarDate(step.due)}` : "Date to be confirmed"} · {money(step.paid)} paid</small></div>
          <span className={styles.badge}>{step.balance === 0 ? "Paid" : `${money(step.balance)} due`}</span>
        </li>)}
      </ul>}
      {plan.unscheduled > 0 && <p className={styles.notice}>{money(plan.unscheduled)} of your contract is not on the schedule yet. The studio will add it.</p>}
    </section>
    {categories.length > 0 && <section className={styles.card}>
      <h2>Your wedding budget</h2>
      <p>{budget.setup.approved_cents ? `${money(budget.setup.approved_cents)} approved budget · ` : ""}Planned and paid by category, including outside vendors.</p>
      <ul className={styles.list}>{categories.map((row) => <li key={row.category}>
        <div><h3>{row.category}</h3><small>{money(row.forecast)} planned{row.targetCents ? ` · ${money(row.targetCents)} target` : ""}</small></div>
        <span className={styles.badge}>{money(row.paid)} paid</span>
      </li>)}</ul>
    </section>}
  </>;
}
