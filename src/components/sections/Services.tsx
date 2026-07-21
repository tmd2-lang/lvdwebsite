"use client";
import { useState } from "react";

const services = [
  {
    title: "The Full Production",
    desc: "Comprehensive design, custom fabrication, and white-glove execution.",
    price: "Beginning at $45,000",
    image: "/hero/6203022671217922801_edited.jpg"
  },
  {
    title: "Design + Florals",
    desc: "Bespoke floral styling and foundational aesthetic direction.",
    price: "Beginning at $20,000",
    image: "/hero/3042192127745071772.JPG"
  },
  {
    title: "The Essentials",
    desc: "Our signature floral collections for intimate gatherings.",
    price: "Beginning at $8,000",
    image: "/hero/TFR54012_websize.jpg"
  }
];

export default function Services() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="w-full bg-ivory py-32 md:py-48 px-6 md:px-12" id="services">
      <div className="max-w-[1440px] mx-auto flex flex-col">
        <h2 className="font-display text-[clamp(2.5rem,5vw,5rem)] text-ink mb-16 text-center">Investments</h2>
        
        <div className="flex flex-col md:flex-row w-full h-[70vh] gap-4 md:gap-4">
          {services.map((service, idx) => {
            const isActive = activeIndex === idx;
            
            return (
              <div 
                key={idx}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`relative flex flex-col justify-end overflow-hidden group cursor-pointer transition-[flex-grow,width] duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-sm ${
                  isActive ? "flex-[3_3_0%] md:w-[60%]" : "flex-[1_1_0%] md:w-[20%]"
                }`}
              >
                {/* Background Image */}
                <img 
                  src={service.image} 
                  className={`absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out ${
                    isActive ? "scale-100" : "scale-110"
                  }`}
                  alt={service.title}
                />
                
                {/* Dark Gradient Overlay for text readability */}
                <div className={`absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent transition-opacity duration-700 ${
                  isActive ? "opacity-100" : "opacity-40 group-hover:opacity-70"
                }`} />

                {/* Content Wrapper */}
                <div className="relative z-10 w-full h-full">
                  
                  {/* Vertical Title (when collapsed) */}
                  <div className={`absolute inset-0 flex items-end justify-center pb-12 transition-opacity duration-500 delay-100 ${
                    isActive ? "opacity-0 pointer-events-none" : "opacity-100"
                  }`}>
                    {/* Desktop: Rotated vertical text */}
                    <h3 className="font-display text-3xl xl:text-4xl text-ivory whitespace-nowrap hidden md:block -rotate-90 origin-center absolute bottom-1/2 translate-y-1/2">
                      {service.title}
                    </h3>
                    {/* Mobile: Standard horizontal text */}
                    <h3 className="font-display text-3xl text-ivory block md:hidden mb-6 px-6 text-center">
                      {service.title}
                    </h3>
                  </div>

                  {/* Expanded Content */}
                  <div className={`absolute inset-0 p-6 md:p-12 flex flex-col justify-end transition-all duration-700 ease-out ${
                    isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
                  }`}>
                    <h3 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6 text-ivory">
                      {service.title}
                    </h3>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-t border-ivory/30 pt-6">
                      <p className="font-body text-base md:text-lg leading-[1.6] max-w-[40ch] text-ivory/90">
                        {service.desc}
                      </p>
                      <p className="font-body text-xs uppercase tracking-[0.2em] text-gold whitespace-nowrap">
                        {service.price}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
