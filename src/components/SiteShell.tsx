"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Cursor from "@/components/Cursor";
import Header from "@/components/Header";
import SmoothScroll from "@/components/SmoothScroll";
import Footer from "@/components/sections/Footer";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Dashboard-created Supabase invites use the public Site URL and place
    // their one-time token in the hash. Route those staff invites into the
    // studio welcome flow without exposing or storing the token server-side.
    if (pathname === "/" && window.location.hash.includes("type=invite")) {
      window.location.replace(`/admin/welcome${window.location.hash}`);
    }
  }, [pathname]);

  if (pathname.startsWith("/admin") || pathname.startsWith("/portal")) {
    return <>{children}</>;
  }

  const isReserveV2 = pathname === "/welcome";

  return (
    <>
      <Cursor />
      {!isReserveV2 && <Header />}
      <SmoothScroll>
        {children}
        {!isReserveV2 && <Footer />}
      </SmoothScroll>
    </>
  );
}
