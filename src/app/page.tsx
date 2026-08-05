import Preloader from "@/components/sections/Preloader";
import CollapsingHero from "@/components/sections/CollapsingHero";
import MasterpieceStatement from "@/components/sections/MasterpieceStatement";
import Credibility from "@/components/sections/Credibility";
import Narrative from "@/components/sections/Narrative";
import ParallaxDivider from "@/components/sections/ParallaxDivider";
import SignatureWork from "@/components/sections/SignatureWork";
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
      <Credibility />
      <Narrative />
      <ParallaxDivider />
      <SignatureWork />
      <Services />
      <MeetIrene />
      <Testimonials />
      <Contact />
    </main>
  );
}
