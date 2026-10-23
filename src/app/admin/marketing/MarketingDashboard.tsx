"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import styles from "./dashboard.module.css";

type View = "overview" | "meta" | "google" | "reddit" | "pinterest" | "library" | "tests" | "uploads" | "journal";
type Range = "7d" | "14d" | "30d" | "month";
type Level = "Campaigns" | "Ad sets" | "Ads";

const channels: { id: View; name: string; initial: string }[] = [
  { id: "meta", name: "Meta Ads", initial: "M" },
  { id: "google", name: "Google Ads", initial: "G" },
  { id: "reddit", name: "Reddit Ads", initial: "R" },
  { id: "pinterest", name: "Pinterest Ads", initial: "P" },
];

const ranges: { id: Range; label: string }[] = [
  { id: "7d", label: "7 days" },
  { id: "14d", label: "14 days" },
  { id: "30d", label: "30 days" },
  { id: "month", label: "This month" },
];

const statColumns = ["Name", "Leads", "CPL", "Spent", "Reach", "Impressions", "Frequency", "CPC (link)", "CTR (link)", "CPM", "Link clicks"];

const headings: Record<View, { eyebrow: string; title: string; description: string }> = {
  overview: { eyebrow: "Marketing intelligence", title: "Overview", description: "The full picture, from ad spend to booked celebrations." },
  meta: { eyebrow: "Channel performance", title: "Meta Ads", description: "Campaigns, ad sets, and ads in one place." },
  google: { eyebrow: "Channel performance", title: "Google Ads", description: "Campaigns, ad sets, and ads in one place." },
  reddit: { eyebrow: "Channel performance", title: "Reddit Ads", description: "Campaigns, ad sets, and ads in one place." },
  pinterest: { eyebrow: "Channel performance", title: "Pinterest Ads", description: "Campaigns, ad sets, and ads in one place." },
  library: { eyebrow: "Creative intelligence", title: "Ads Library", description: "The creative, the copy, and the performance behind every ad." },
  tests: { eyebrow: "Experiment log", title: "Tests", description: "Track what changed and what happened next." },
  uploads: { eyebrow: "Data sources", title: "Uploads", description: "A home for reports and daily performance snapshots." },
  journal: { eyebrow: "Studio notes", title: "Journal", description: "Your to-dos, daily notes, and existing stats." },
};

function EmptyChart({ title, caption }: { title: string; caption: string }) {
  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeading}><div><p className={styles.micro}>Daily trend</p><h3>{title}</h3></div><span className={styles.pendingTag}>Awaiting data</span></div>
      <div className={styles.chartEmpty}>
        <div className={styles.chartGrid} aria-hidden="true"><span /><span /><span /><span /></div>
        <p>{caption}</p>
      </div>
    </div>
  );
}

function RangePicker({ range, setRange }: { range: Range; setRange: (range: Range) => void }) {
  return <div className={styles.rangePicker} aria-label="Date range">{ranges.map((item) => (
    <button key={item.id} type="button" aria-pressed={range === item.id} className={range === item.id ? styles.rangeActive : ""} onClick={() => setRange(item.id)}>{item.label}</button>
  ))}</div>;
}

export default function MarketingDashboard({ journal, openTodos, notesCount, canViewAdReport, setupError }: { journal: ReactNode; openTodos: number; notesCount: number; canViewAdReport: boolean; setupError: string | null }) {
  const [view, setView] = useState<View>("overview");
  const [range, setRange] = useState<Range>("14d");
  const [level, setLevel] = useState<Level>("Campaigns");
  const heading = headings[view];
  const channel = channels.find((item) => item.id === view);

  function go(next: View) {
    setView(next);
    setLevel("Campaigns");
  }

  return (
    <main className={styles.app}>
      <aside className={styles.sidebar}>
        <Link href="/admin" className={styles.brand} aria-label="LVD Studio home"><span className={styles.monogram}>LVD</span><span className={styles.brandSub}>Studio / Marketing</span></Link>
        <div className={styles.sidebarBody}>
          <p className={styles.navLabel}>Workspace</p>
          <nav className={styles.nav} aria-label="Marketing dashboard">
            <button type="button" className={view === "overview" ? styles.active : ""} aria-current={view === "overview" ? "page" : undefined} onClick={() => go("overview")}><span className={styles.navIcon}>◫</span>Overview</button>
            <p className={styles.navLabel}>Channels</p>
            {channels.map((item) => <button key={item.id} type="button" className={view === item.id ? styles.active : ""} aria-current={view === item.id ? "page" : undefined} onClick={() => go(item.id)}><span className={styles.channelIcon}>{item.initial}</span>{item.name}</button>)}
            <p className={styles.navLabel}>Explore</p>
            <button type="button" className={view === "library" ? styles.active : ""} aria-current={view === "library" ? "page" : undefined} onClick={() => go("library")}><span className={styles.navIcon}>▦</span>Ads Library</button>
            <button type="button" className={view === "tests" ? styles.active : ""} aria-current={view === "tests" ? "page" : undefined} onClick={() => go("tests")}><span className={styles.navIcon}>⌁</span>Tests</button>
            <button type="button" className={view === "uploads" ? styles.active : ""} aria-current={view === "uploads" ? "page" : undefined} onClick={() => go("uploads")}><span className={styles.navIcon}>↥</span>Uploads</button>
            <button type="button" className={view === "journal" ? styles.active : ""} aria-current={view === "journal" ? "page" : undefined} onClick={() => go("journal")}><span className={styles.navIcon}>✎</span>Journal{openTodos > 0 && <span className={styles.count}>{openTodos}</span>}</button>
          </nav>
        </div>
        <div className={styles.sidebarFooter}><span className={styles.statusDot} /> Studio workspace <Link href="/admin">Back to Studio ↗</Link></div>
      </aside>

      <div className={styles.content}>
        <div className={styles.topbar}><span>Lady Victoria Designs <span className={styles.topbarSlash}>/</span> Marketing</span><Link href="/admin">Studio home ↗</Link></div>
        <div className={styles.workspace}>
          {setupError && view !== "journal" && <p className={styles.setupError} role="alert">{setupError}</p>}
          {view === "journal" ? journal : <>
            <header className={styles.header}>
              <div><p className={styles.eyebrow}>{heading.eyebrow}</p><h1>{heading.title}</h1><p className={styles.lede}>{heading.description}</p></div>
              {(view === "overview" || channel) && <RangePicker range={range} setRange={setRange} />}
            </header>

            {view === "overview" && <>
              <section className={styles.introPanel}>
                <div><p className={styles.micro}>Your command center</p><h2>See what brings the right clients closer.</h2><p>Delivery metrics will sit beside real inquiries, budgets, consults, and bookings once daily snapshots are connected.</p></div>
                <button type="button" onClick={() => go("meta")}>Explore Meta Ads <span aria-hidden="true">↗</span></button>
              </section>
              <div className={styles.sectionTitle}><div><p className={styles.micro}>At a glance</p><h2>Performance overview</h2></div><span>Selected range · {ranges.find((item) => item.id === range)?.label}</span></div>
              <div className={styles.metricGrid}>
                {[{ label: "Ad spend", note: "Across all channels" }, { label: "Platform leads", note: "Reported conversions" }, { label: "$20k+ share", note: "From portal inquiries" }, { label: "Booked revenue", note: "From portal outcomes" }].map((item) => <div className={styles.metricCard} key={item.label}><span>{item.label}</span><strong>—</strong><small>{item.note}</small></div>)}
              </div>
              <div className={styles.overviewGrid}>
                <section className={styles.panel}><div className={styles.panelHead}><div><p className={styles.micro}>Channel mix</p><h2>Where momentum is building</h2></div><span className={styles.pendingTag}>Awaiting snapshots</span></div>
                  <div className={styles.channelList}>{channels.map((item) => <button type="button" key={item.id} onClick={() => go(item.id)}><span className={styles.channelIcon}>{item.initial}</span><strong>{item.name}</strong><span className={styles.channelListStatus}>No structured data yet</span><span aria-hidden="true">↗</span></button>)}</div>
                </section>
                <section className={styles.panel}><div className={styles.panelHead}><div><p className={styles.micro}>From click to client</p><h2>Outcome funnel</h2></div></div><div className={styles.funnel}>{["Inquiries", "$20k+ inquiries", "Consults", "Bookings"].map((label, index) => <div key={label}><span className={styles.funnelNumber}>0{index + 1}</span><span>{label}</span><strong>—</strong></div>)}</div><p className={styles.panelFoot}>The portal already tracks these outcomes. The dashboard join comes with the data layer.</p></section>
              </div>
              <section className={styles.nextStep}><div><p className={styles.micro}>Already in Studio</p><h2>Your work is still here.</h2><p>{openTodos} open to-dos · {notesCount} notes in the Journal</p></div><button type="button" onClick={() => go("journal")}>Open Journal <span aria-hidden="true">→</span></button></section>
            </>}

            {channel && <>
              <div className={styles.channelBanner}><div><span className={styles.channelBadge}>{channel.initial}</span><div><p className={styles.micro}>{channel.name} / Delivery</p><h2>Performance by level</h2></div></div><span>Daily feed pending</span></div>
              <div className={styles.panel}>
                <div className={styles.tableToolbar}><div className={styles.levelTabs} aria-label="Entity level">{(["Campaigns", "Ad sets", "Ads"] as Level[]).map((item) => <button key={item} type="button" className={level === item ? styles.levelActive : ""} aria-pressed={level === item} onClick={() => setLevel(item)}>{item}</button>)}</div><span>0 {level.toLowerCase()}</span></div>
                <div className={styles.tableScroll}><table className={styles.table}><thead><tr>{statColumns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead><tbody><tr><td colSpan={statColumns.length}><div className={styles.tableEmpty}><span className={styles.emptyGlyph}>▤</span><strong>No {level.toLowerCase()} to show yet</strong><p>Daily snapshots will populate this table when the data feed is connected.</p></div></td></tr></tbody></table></div>
              </div>
              <div className={styles.trendGrid}><EmptyChart title="Cost per lead" caption="CPL trends will appear here after daily data arrives." /><EmptyChart title="Frequency" caption="Watch how often your audience sees each ad set." /></div>
              {view === "meta" && canViewAdReport && <div className={styles.existingReport}><div><p className={styles.micro}>Existing data</p><h2>Portal ad outcomes are available now.</h2><p>See attributed inquiries, budget tiers, consults, and bookings in the current ad report.</p></div><Link href="/admin/ad-report">Open ad report ↗</Link></div>}
            </>}

            {view === "library" && <section className={styles.featurePanel}><div className={styles.featureVisual}><div className={styles.creativeMock}><span>CREATIVE</span><div /></div><div className={styles.copyMock}><span>AD COPY</span><i /><i /><i /></div></div><div><p className={styles.micro}>Built around the ad</p><h2>Every winning idea, in context.</h2><p>The library will bring the creative, each copy variant, performance, and portal outcomes together on one ad record.</p><div className={styles.featureTags}><span>Creative</span><span>Copy variants</span><span>Performance</span><span>Outcomes</span></div><p className={styles.featureStatus}>The library is ready for its data layer.</p></div></section>}

            {view === "tests" && <section className={styles.featurePanel}><div className={styles.timelineMock}><span className={styles.timelineDot} /><div><small>THE TEST TIMELINE</small><strong>What changed?</strong><p>Launch · copy · targeting · budget · tracking</p></div><span className={styles.timelineDot} /><div><small>THE READOUT</small><strong>What happened next?</strong><p>See the before and after beside the change.</p></div></div><div><p className={styles.micro}>Make learning visible</p><h2>A record of every experiment.</h2><p>Tests will connect a hypothesis and a specific change to the resulting performance window. Your existing Journal remains available for everyday notes.</p><button type="button" className={styles.textAction} onClick={() => go("journal")}>Open Journal →</button></div></section>}

            {view === "uploads" && <section className={styles.featurePanel}><div className={styles.uploadMock}><span className={styles.uploadIcon}>↥</span><strong>Reports belong here</strong><p>CSV and PDF imports will appear here after the importer is built.</p><div><span>CSV</span><span>PDF</span></div></div><div><p className={styles.micro}>Bring the numbers in</p><h2>One place for every source.</h2><p>Future uploads will show a preview of parsed rows and an import history, so you can see exactly what entered the dashboard.</p><p className={styles.featureStatus}>Upload is a UI preview; file processing is not connected yet.</p></div></section>}
          </>}
        </div>
      </div>
    </main>
  );
}
