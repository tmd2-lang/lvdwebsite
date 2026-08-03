"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ConceptSwitcher() {
  const pathname = usePathname();

  const concepts = [
    { name: "Concept A: Architectural Frame", path: "/concept-a" },
    { name: "Concept B: Unified Cinematic", path: "/concept-b" },
    { name: "Concept C: Magazine Cover", path: "/concept-c" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-ink/90 text-ivory backdrop-blur-md px-3 py-2 rounded-full border border-gold/30 shadow-2xl flex items-center gap-1 sm:gap-2 max-w-[95vw] overflow-x-auto">
      <span className="text-[9px] uppercase tracking-widest text-gold font-semibold px-2 hidden md:inline">
        Hero Concepts:
      </span>
      {concepts.map((concept) => {
        const isActive = pathname === concept.path;
        return (
          <Link
            key={concept.path}
            href={concept.path}
            className={`px-3 py-1.5 rounded-full font-body text-[10px] md:text-xs uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
              isActive
                ? "bg-gold text-ink font-semibold shadow-sm"
                : "text-ivory/80 hover:text-ivory hover:bg-white/10"
            }`}
          >
            {concept.name}
          </Link>
        );
      })}
    </div>
  );
}
