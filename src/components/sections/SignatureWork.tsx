"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SignatureWork() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const images = [
    { id: 1, src: "/gallery/Amber & Kendall Wedding/Amber&KendallTableShot.jpeg", title: "Meridian House, DC" },
    { id: 2, src: "/gallery/Jenny & Jordan Wedding/Jenny&JordanCoupleShot1.jpeg", title: "The Anderson House" },
    { id: 3, src: "/gallery/Amber & Kendall Wedding/Amber&KendallFlowerShot2.jpeg", title: "National Museum" },
    { id: 4, src: "/gallery/Jenny & Jordan Wedding/Jenny&JordanStageShot.jpeg", title: "Private Estate" },
    { id: 5, src: "/gallery/LVD Floral Images/LVDFloralCouple.jpeg", title: "Floral Design" },
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
    <section 
      ref={containerRef} 
      className="w-full h-screen bg-ivory flex flex-col justify-center relative pt-32 pb-12 rounded-t-[3rem] md:rounded-t-[5rem] -mt-[15vh] z-20 shadow-[0_-20px_60px_rgba(0,0,0,0.4)]"
    >
      <div className="w-full px-6 md:px-12 mb-8 md:mb-12 max-w-[1440px] mx-auto">
        <h2 className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-gold mb-4">GALLERY / Our Work</h2>
        <h3 className="font-display text-5xl md:text-6xl lg:text-7xl text-ink tracking-tight">
          Our <span className="italic text-gold">Work</span>
        </h3>
      </div>
      
      <div ref={trackRef} className="flex gap-12 px-6 md:px-12 w-max h-[45vh] md:h-[55vh] items-center will-change-transform">
        {images.map((item) => (
          <div key={item.id} className="w-[75vw] sm:w-[85vw] md:w-[50vw] lg:w-[40vw] h-full flex flex-col shrink-0">
            <div className="flex-1 bg-ecru border border-ink/10 relative overflow-hidden group cursor-none gallery-img-container">
              <img 
                src={item.src} 
                className="gallery-img absolute inset-0 w-full h-full object-cover scale-[1.15] transition-opacity duration-700 hover:opacity-90" 
                alt={item.title} 
                loading="lazy"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="w-full flex justify-center mt-10 md:mt-12 shrink-0">
        <button className="font-body text-xs md:text-sm uppercase tracking-[0.2em] text-ink border border-ink/20 px-8 py-4 hover:bg-ink hover:text-ivory transition-colors duration-300">
          View Full Gallery
        </button>
      </div>
    </section>
  );
}
