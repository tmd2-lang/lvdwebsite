"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminUser } from "@/lib/admin-types";
import styles from "./portal-admin.module.css";

const portalNavigation = [
  { number: "01", label: "Overview", href: "/admin/portal", exact: true },
  { number: "02", label: "Clients", href: "/admin/portal/clients" },
  { number: "03", label: "Invoices", href: "/admin/portal/invoices" },
  { number: "04", label: "Documents", href: "/admin/portal/documents" },
  { number: "05", label: "Images", href: "/admin/portal/images" },
] as const;

function firstName(user: AdminUser) {
  const source = user.firstName || user.displayName || user.name || user.email.split("@")[0];
  return source.replace(/\s*\([^)]*\)\s*/g, " ").trim().split(/\s+/)[0] || "Admin";
}

async function signOut() {
  await fetch("/api/admin/auth/logout", { method: "POST" }).catch(() => null);
  window.location.assign("/admin/login");
}

function isCurrent(pathname: string, item: (typeof portalNavigation)[number]) {
  return "exact" in item && item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

export default function AdminPortalShell({ user, children }: { user: AdminUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const isOwner = user.role === "owner";

  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <Link className={styles.brand} href="/admin/portal" aria-label="Lady Victoria Designs portal administration">
          <span className={styles.monogram}>LVD</span>
          <span>Portal Studio</span>
        </Link>

        <nav className={styles.portalNav} aria-label="Portal administration">
          {portalNavigation.map((item) => {
            const active = isCurrent(pathname, item);
            return (
              <Link className={active ? styles.navActive : undefined} href={item.href} aria-current={active ? "page" : undefined} key={item.href}>
                <i>{item.number}</i><span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <nav className={styles.studioNav} aria-label="Studio administration">
          {isOwner && <Link href="/admin">Home</Link>}
          {isOwner && <Link href="/admin/inquiries">Inquiries</Link>}
          <Link className={pathname === "/admin/portal/profile" ? styles.studioNavActive : undefined} href="/admin/portal/profile" aria-current={pathname === "/admin/portal/profile" ? "page" : undefined}>Profile</Link>
        </nav>

        <div className={styles.account}>
          <span className={styles.avatar}>{firstName(user).slice(0, 1).toUpperCase()}</span>
          <div><strong>{user.displayName || user.name}</strong><small>{isOwner ? "Studio Owner" : "Studio Planner"}</small></div>
          <button type="button" onClick={() => void signOut()}>Sign out</button>
        </div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.mobileHeader}>
          <Link href="/admin/portal"><b>LVD</b><span>Portal Studio</span></Link>
          <button type="button" onClick={() => void signOut()}>Sign out</button>
        </header>

        <nav className={styles.mobileNav} aria-label="Mobile portal administration">
          {portalNavigation.map((item) => {
            const active = isCurrent(pathname, item);
            return <Link className={active ? styles.mobileNavActive : undefined} href={item.href} aria-current={active ? "page" : undefined} key={item.href}>{item.label}</Link>;
          })}
        </nav>

        {children}
      </section>
    </div>
  );
}
