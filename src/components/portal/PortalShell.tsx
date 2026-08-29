"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { portalClient } from "@/data/portal-demo";
import styles from "@/app/portal/portal.module.css";

const navigation = [
  { number: "01", label: "Overview", href: "/portal" },
  { number: "02", label: "Invoices", href: "/portal/invoices" },
  { number: "03", label: "Payments", href: "/portal/payments" },
  { number: "04", label: "Documents", href: "/portal/documents" },
  { number: "05", label: "Planning", href: "/portal/planning" },
];

export default function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => href === "/portal" ? pathname === href : pathname.startsWith(href);

  return (
    <main className={styles.portalShell}>
      <aside className={styles.sidebar}>
        <Link className={styles.brand} href="/portal" aria-label="Lady Victoria Designs planning portal home">
          <span className={styles.monogram}>LVD</span>
          <span>Planning Atelier</span>
        </Link>

        <nav aria-label="Client portal navigation" className={styles.navigation}>
          {navigation.map((item) => (
            <Link className={isActive(item.href) ? styles.navActive : undefined} href={item.href} key={item.href} aria-current={isActive(item.href) ? "page" : undefined}>
              <span>{item.number}</span>{item.label}
            </Link>
          ))}
        </nav>

        <Link className={styles.adminPreviewLink} href="/portal/admin">View admin prototype <span aria-hidden="true">↗</span></Link>

        <div className={styles.sidebarFooter}>
          <p>{portalClient.couple}</p>
          <span>{portalClient.eventDate}</span>
          <Link href="/portal/login">Sign out</Link>
        </div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <Link className={styles.mobileBrand} href="/portal"><b>LVD</b><span>Planning Atelier</span></Link>
          <div className={styles.eventMeta}>
            <span>Your celebration</span>
            <strong>{portalClient.venue} · {portalClient.location}</strong>
          </div>
          <Link className={styles.topbarAdminLink} href="/portal/admin">Admin preview</Link>
          <button className={styles.avatar} type="button" aria-label="Open account menu">{portalClient.initials}</button>
        </header>

        {children}

        <nav className={styles.mobileNavigation} aria-label="Mobile client portal navigation">
          {navigation.map((item) => (
            <Link className={isActive(item.href) ? styles.mobileNavActive : undefined} href={item.href} key={item.href} aria-current={isActive(item.href) ? "page" : undefined}>
              <span>{item.number}</span>{item.label}
            </Link>
          ))}
        </nav>
      </section>
    </main>
  );
}
