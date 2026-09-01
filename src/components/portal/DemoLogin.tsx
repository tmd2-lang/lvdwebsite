"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import styles from "@/app/portal/portal.module.css";
import StudioSupport from "@/components/portal/StudioSupport";

export default function DemoLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form className={styles.loginForm} onSubmit={(event) => { event.preventDefault(); router.push("/portal"); }}>
      <div className={styles.prototypeNote}><span>UI prototype</span><p>Use any email and password to preview the client experience.</p></div>
      <label>Email address<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
      <label>Password<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /></label>
      <div className={styles.loginOptions}><label><input type="checkbox" /> Remember me</label><button type="button">Forgot password?</button></div>
      <button className={styles.loginSubmit} type="submit">Enter your portal <span aria-hidden="true">→</span></button>
      <StudioSupport />
      <Link className={styles.adminLoginLink} href="/portal/demo/admin">Preview Irene’s admin portal <span aria-hidden="true">↗</span></Link>
    </form>
  );
}
