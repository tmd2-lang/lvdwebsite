import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MediaAdmin from "./MediaAdmin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Media Studio",
  robots: { index: false, follow: false }
};

export default function MediaAdminPage() {
  if (process.env.VERCEL) notFound();
  return <MediaAdmin />;
}
