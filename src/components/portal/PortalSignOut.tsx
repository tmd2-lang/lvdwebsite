"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "@/app/portal/portal.module.css";

export default function PortalSignOut() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    await fetch("/api/portal/auth/logout", { method: "POST" }).catch(() => null);
    router.push("/portal/login");
    router.refresh();
  }

  return (
    <button className={styles.realSignOut} type="button" onClick={() => void signOut()} disabled={busy}>
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
