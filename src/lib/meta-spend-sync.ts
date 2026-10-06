import { saveMetaSpend } from "./admin-data";
import { fetchMetaSpend, TRACKING_STARTED } from "./meta-ads";

/** Step 7a: pull spend since tracking began from Meta and store it per ad. */
export async function runMetaSpendSync() {
  const rows = await fetchMetaSpend();
  const saved = await saveMetaSpend(rows, TRACKING_STARTED);
  return { ads: saved, spend: Math.round(rows.reduce((sum, row) => sum + row.spend, 0) * 100) / 100 };
}
