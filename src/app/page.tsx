import Preloader from "@/components/sections/Preloader";
import CollapsingHero from "@/components/sections/CollapsingHero";
import Hero from "@/components/sections/Hero";
import Credibility from "@/components/sections/Credibility";
import Narrative from "@/components/sections/Narrative";
import SignatureWork from "@/components/sections/SignatureWork";
import Services from "@/components/sections/Services";
import MeetIrene from "@/components/sections/MeetIrene";
import Process from "@/components/sections/Process";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <main className="w-full min-h-screen overflow-x-hidden block">
      <Preloader />
      <CollapsingHero />
      <Hero />
      <Credibility />
      <Narrative />
      <SignatureWork />
      <Services />
      <MeetIrene />
      <Process />
      <Testimonials />
      <Contact />
    </main>
  );
}
