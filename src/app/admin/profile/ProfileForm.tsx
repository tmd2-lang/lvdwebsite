"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { AdminUser } from "@/lib/admin-types";
import styles from "./profile.module.css";

function initials(profile: AdminUser) {
  const value = profile.displayName || profile.email;
  return value.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

async function responseJson<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    window.location.assign(`/api/admin/auth/refresh?next=${encodeURIComponent(window.location.pathname)}`);
    throw new Error("Refreshing your sign-in…");
  }
  const payload = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || "Your profile could not be saved.");
  return payload;
}

export default function ProfileForm({ initialProfile }: { initialProfile: AdminUser }) {
  const [profile, setProfile] = useState(initialProfile);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const result = await responseJson<{ profile: AdminUser }>(await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.get("firstName"),
          lastName: data.get("lastName"),
          displayName: data.get("displayName"),
          avatarUrl: data.get("avatarUrl"),
        }),
      }));
      setProfile(result.profile);
      setMessage("Profile saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Your profile could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    await fetch("/api/admin/auth/logout", { method: "POST" }).catch(() => null);
    window.location.assign("/admin/login");
  }

  return (
    <main className={styles.app}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.monogram}>LVD</p>
          <p className={styles.studioName}>Lady Victoria<br />Designs</p>
        </div>
        <nav aria-label="Studio navigation">
          <Link href="/admin">Home</Link>
          <Link href="/admin/inquiries">Inquiries</Link>
          <Link className={styles.navActive} href="/admin/profile" aria-current="page">Profile</Link>
        </nav>
        <div className={styles.account}>
          <p>{profile.name}</p>
          <button type="button" onClick={() => void signOut()}>Sign out</button>
        </div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.mobileHeader}>
          <Link href="/admin"><b>LVD</b><span>Studio</span></Link>
          <nav aria-label="Mobile studio navigation">
            <Link href="/admin">Home</Link>
            <Link href="/admin/inquiries">Inquiries</Link>
            <Link className={styles.mobileActive} href="/admin/profile" aria-current="page">Profile</Link>
          </nav>
        </header>

        <div className={styles.pageHeader}>
          <div>
            <p className={styles.eyebrow}>Your studio identity</p>
            <h1>Your <em>profile.</em></h1>
            <p>This is how your name appears across the private studio.</p>
          </div>
          <Link className={styles.backLink} href="/admin">Back to home <span aria-hidden="true">→</span></Link>
        </div>

        <section className={styles.profileCard}>
          <div className={styles.profileIntro}>
            <div className={styles.avatar}>{profile.avatarUrl ? <Image src={profile.avatarUrl} alt="" width={70} height={70} unoptimized /> : initials(profile)}</div>
            <div>
              <p className={styles.sectionKicker}>Admin profile</p>
              <h2>{profile.name}</h2>
              <p>{profile.email}</p>
            </div>
          </div>

          <form className={styles.form} onSubmit={(event) => void save(event)}>
            <div className={styles.fieldGrid}>
              <label><span>First name</span><input name="firstName" defaultValue={profile.firstName} required maxLength={80} /></label>
              <label><span>Last name</span><input name="lastName" defaultValue={profile.lastName} required maxLength={80} /></label>
            </div>
            <label><span>Display name</span><input name="displayName" defaultValue={profile.displayName} required maxLength={120} /><small>This is the name shown in greetings, notes, and the sidebar.</small></label>
            <label><span>Profile photo URL <i>Optional</i></span><input name="avatarUrl" type="url" defaultValue={profile.avatarUrl || ""} placeholder="https://…" maxLength={500} /></label>
            {(message || error) && <p className={error ? styles.error : styles.success} role="status">{error || message}</p>}
            <button className={styles.saveButton} type="submit" disabled={saving}>{saving ? "Saving profile…" : "Save profile"}</button>
          </form>
        </section>

        <footer className={styles.mobileFooter}><button type="button" onClick={() => void signOut()}>Sign out</button></footer>
      </section>
    </main>
  );
}
