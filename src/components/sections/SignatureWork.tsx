"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SignatureWork() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const images = [
    { id: 1, src: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=1600", title: "Meridian House, DC", desc: "250 Guests" },
    { id: 2, src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1600", title: "The Anderson House", desc: "150 Guests" },
    { id: 3, src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=1600", title: "National Museum", desc: "300 Guests" },
    { id: 4, src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=1600", title: "Private Estate", desc: "100 Guests" },
  ];

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const track = trackRef.current;
      if (!track) return;

      const getScrollDistance = () => {
        const lastChild = track.lastElementChild as HTMLElement;
        if (!lastChild) return 0;
        // The distance we need to shift the track left is the right-most point of the last child
        // minus the width of the window, plus the right padding (48px for px-12).
        const rightEdge = lastChild.offsetLeft + lastChild.offsetWidth;
        const paddingRight = 48; // px-12 = 3rem = 48px
        return -(rightEdge + paddingRight - window.innerWidth);
      };

      const tl = gsap.to(track, {
        x: getScrollDistance,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          start: "top top",
          end: () => `+=${Math.abs(getScrollDistance())}`,
          scrub: 1,
          invalidateOnRefresh: true,
        }
      });

      // Parallax effect on images
      const imgElements = gsap.utils.toArray(".gallery-img");
      imgElements.forEach((img: any) => {
        gsap.to(img, {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: img.parentElement,
              containerAnimation: tl,
              start: "left right",
              end: "right left",
              scrub: true,
            }
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="w-full h-screen bg-ivory flex flex-col justify-center overflow-hidden relative pt-24 pb-12">
      <div className="w-full px-6 md:px-12 mb-8 md:mb-12 max-w-[1440px] mx-auto">
        <h2 className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-gold mb-4">Portfolio</h2>
        <h3 className="font-display text-5xl md:text-6xl lg:text-7xl text-ink tracking-tight">
          Signature <span className="italic text-gold">Work</span>
        </h3>
      </div>
      
      <div ref={trackRef} className="flex gap-12 px-6 md:px-12 w-max h-[50vh] md:h-[65vh] items-center will-change-transform">
        {images.map((item) => (
          <div key={item.id} className="w-[85vw] md:w-[50vw] lg:w-[40vw] h-full flex flex-col shrink-0">
            <div className="flex-1 bg-ecru border border-ink/10 relative overflow-hidden group cursor-none gallery-img-container">
              <img 
                src={item.src} 
                className="gallery-img absolute inset-0 w-full h-full object-cover scale-[1.15] transition-opacity duration-700 hover:opacity-90" 
                alt={item.title} 
                onLoad={() => ScrollTrigger.refresh()}
              />
            </div>
            <div className="mt-6 flex justify-between font-body text-[10px] md:text-xs uppercase tracking-[0.2em] text-ink/70">
              <span>{item.title}</span>
              <span>{item.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
