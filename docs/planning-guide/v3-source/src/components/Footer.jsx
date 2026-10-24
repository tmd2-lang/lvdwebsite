import React from 'react';

export default function Footer() {
    return (
        <footer className="w-full bg-[#3D332A] text-textDark pt-20 pb-10 px-6 rounded-t-[3rem] md:rounded-t-[4rem] -mt-8 relative z-10 flex flex-col items-center text-center">
            <div className="max-w-4xl w-full flex flex-col items-center gap-8">

                <h2 className="font-serif text-4xl md:text-5xl tracking-wide">Lady Victoria Designs</h2>
                <p className="font-sans text-sm tracking-[0.2em] uppercase text-white/50">Venue discovery | Coordination | Wedding planning</p>

                <div className="w-24 h-[1px] bg-accent mt-4 mb-4"></div>

                <div className="flex flex-col md:flex-row gap-6 md:gap-12 font-sans text-sm">
                    <a href="mailto:ladyvictoriadesigns@gmail.com" className="hover:text-accent transition-colors">
                        ladyvictoriadesigns@gmail.com
                    </a>
                    <a href="https://www.ladyvictoriadesigns.com/planning" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                        www.ladyvictoriadesigns.com
                    </a>
                    <a href="https://www.instagram.com/ladyvictoriadesigns/" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                        @ladyvictoriadesigns
                    </a>
                </div>

                <div className="mt-12 flex flex-col gap-4 font-sans text-xs text-white/40 italic">
                    <p>Planning Investment Guide · V3</p><p><a href="/" className="hover:text-accent">Preserved V1</a> · <a href="/v2/" className="hover:text-accent">V2</a></p>
                    <p>© {new Date().getFullYear()} Lady Victoria Designs. All rights reserved.</p>
                </div>

            </div>
        </footer>
    );
}
