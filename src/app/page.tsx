import Preloader from "@/components/sections/Preloader";
import CollapsingHero from "@/components/sections/CollapsingHero";
import MasterpieceStatement from "@/components/sections/MasterpieceStatement";
import ParallaxDivider from "@/components/sections/ParallaxDivider";
import SignatureWork from "@/components/sections/SignatureWork";
import CurtsyStatement from "@/components/sections/CurtsyStatement";
import Services from "@/components/sections/Services";
import MeetIrene from "@/components/sections/MeetIrene";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <main className="w-full min-h-screen overflow-x-hidden block">
      <Preloader />
      <CollapsingHero />
      <MasterpieceStatement />
      <SignatureWork />
      <CurtsyStatement />
      <MeetIrene />
      {/* Credibility and SweepingCurtsy are parked for possible reuse. */}
      <ParallaxDivider />
      <Services />
      <Testimonials />
      <Contact />
    </main>
  );
}
