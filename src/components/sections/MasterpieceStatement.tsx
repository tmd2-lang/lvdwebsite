export default function MasterpieceStatement() {
  return (
    <section
      aria-labelledby="masterpiece-statement-title"
      className="relative z-10 flex min-h-[88svh] w-full flex-col justify-between overflow-hidden border-y border-gold/30 bg-ink px-6 py-12 text-ivory md:min-h-screen md:px-12 md:py-16"
    >
      <p className="text-center font-body text-[10px] uppercase tracking-[0.24em] text-gold md:text-xs">
        The Art of the Occasion
      </p>

      <div className="mx-auto flex w-full max-w-[1280px] flex-1 items-center justify-center py-16 md:py-24">
        <h2
          id="masterpiece-statement-title"
          className="flex w-full flex-col text-center font-display text-[clamp(2.4rem,5.4vw,6.5rem)] uppercase leading-[0.98] tracking-[-0.035em]"
        >
          <span>Your wedding isn’t an event.</span>
          <span className="mt-3 font-normal italic tracking-[-0.02em] text-gold md:mt-5">
            It’s a masterpiece.
          </span>
        </h2>
      </div>

      <p className="mx-auto max-w-4xl text-center font-display text-base uppercase leading-relaxed tracking-[-0.01em] text-ivory/80 md:text-2xl md:leading-relaxed">
        Immersive floral design and thoughtful production, created with a deep
        respect for every detail.
      </p>
    </section>
  );
}
