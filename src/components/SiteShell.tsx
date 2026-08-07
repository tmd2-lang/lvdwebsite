"use client";

import { usePathname } from "next/navigation";
import Cursor from "@/components/Cursor";
import Header from "@/components/Header";
import SmoothScroll from "@/components/SmoothScroll";
import Footer from "@/components/sections/Footer";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <>
      <Cursor />
      <Header />
      <SmoothScroll>
        {children}
        <Footer />
      </SmoothScroll>
    </>
  );
}
