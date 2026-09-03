"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import styles from "@/app/portal/portal.module.css";

const navigation = [
  { number: "01", label: "Overview", href: "/portal" },
  { number: "02", label: "Tasks", href: "/portal/tasks" },
  { number: "03", label: "Invoices", href: "/portal/invoices" },
  { number: "04", label: "Payments", href: "/portal/payments" },
  { number: "05", label: "Documents", href: "/portal/documents" },
  { number: "06", label: "Images", href: "/portal/images" },
];

export default function ClientPortalShell({
  children,
  coupleName,
  eventLabel,
  venueLabel,
  initials,
  viewerName,
  viewerInitials,
}: {
  children: React.ReactNode;
  coupleName: string;
  eventLabel: string;
  venueLabel: string;
  initials: string;
  /** Who is signed in. Not the same as whose celebration this is: a parent or
   *  an attendant sees the couple's portal while being neither of them. */
  viewerName: string;
  viewerInitials: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const isActive = (href: string) =>
    href === "/portal" ? pathname === href : pathname.startsWith(href);

  async function signOut() {
    setSigningOut(true);
    await fetch("/api/portal/auth/logout", { method: "POST" }).catch(() => null);
    router.push("/portal/login");
    router.refresh();
  }

  return (
    <main className={styles.portalShell}>
      <aside className={styles.sidebar}>
        <Link className={styles.brand} href="/portal" aria-label="Lady Victoria Designs planning portal home">
          <span className={styles.monogram}>LVD</span>
          <span>Planning Atelier</span>
        </Link>

        <nav aria-label="Client portal navigation" className={styles.navigation}>
          {navigation.map((item) => (
            <Link
              className={isActive(item.href) ? styles.navActive : undefined}
              href={item.href}
              key={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              <span>{item.number}</span>{item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <p>{coupleName}</p>
          <span>{eventLabel}</span>
          {viewerName && (
            <Link className={styles.sidebarViewer} href="/portal/profile">
              Signed in as {viewerName}
            </Link>
          )}
          <button type="button" onClick={() => void signOut()} disabled={signingOut}>
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <Link className={styles.mobileBrand} href="/portal"><b>LVD</b><span>Planning Atelier</span></Link>
          <div className={styles.eventMeta}>
            <span>Your celebration</span>
            <strong>{venueLabel}</strong>
          </div>
          <Link
            className={`${styles.avatar} ${styles.avatarLink}`}
            href="/portal/profile"
            aria-label={viewerName ? `${viewerName} — your account` : "Your account"}
            title={viewerName || "Your account"}
          >
            {viewerInitials || initials}
          </Link>
        </header>

        {children}

        <nav className={styles.mobileNavigation} aria-label="Mobile client portal navigation">
          {navigation.map((item) => (
            <Link
              className={isActive(item.href) ? styles.mobileNavActive : undefined}
              href={item.href}
              key={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              <span>{item.number}</span>{item.label}
            </Link>
          ))}
        </nav>
      </section>
    </main>
  );
}
