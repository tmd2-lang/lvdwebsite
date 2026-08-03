export default function Preloader() {
  return (
    <div
      className="site-preloader pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center bg-ivory text-ink"
      aria-hidden="true"
    >
      <div className="site-preloader__label font-display italic text-2xl mb-4">
        Lady Victoria Designs
      </div>
      <div className="w-48 h-[1px] bg-ink/10 relative overflow-hidden">
        <div className="site-preloader__line absolute top-0 left-0 h-full w-full bg-gold" />
      </div>
    </div>
  );
}
