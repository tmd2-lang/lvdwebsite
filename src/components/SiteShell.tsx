"use client";

import { usePathname } from "next/navigation";
import Cursor from "@/components/Cursor";
import Header from "@/components/Header";
import SmoothScroll from "@/components/SmoothScroll";
import Footer from "@/components/sections/Footer";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
