import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import EmotionalHook from './components/EmotionalHook';
import Manifesto from './components/Manifesto';
import Services from './components/Services';
import Process from './components/Process';
import PhotoBreak from './components/PhotoBreak';
import InvestmentTiers from './components/InvestmentTiers';
import Differentiators from './components/Differentiators';
import LeadCapture from './components/LeadCapture';
import WhatHappensNext from './components/WhatHappensNext';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import StandaloneQuiz from './components/StandaloneQuiz';
import AddOns from './components/AddOns';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

function App() {
  const [showQuiz, setShowQuiz] = useState(false);
  const closeQuiz = (packageId) => {
    setShowQuiz(false);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      if (packageId) document.getElementById(packageId)?.scrollIntoView({behavior:'instant'});
      else window.scrollTo({top:0,behavior:'instant'});
    }));
  };
  return (
    <div className="relative w-full min-h-screen bg-background text-textLight">
      {showQuiz ? (
        <StandaloneQuiz onBack={closeQuiz} />
      ) : (
        <>
          <Navigation onOpenQuiz={() => setShowQuiz(true)} />

          <main>
        <Hero />
        <EmotionalHook />

        {/* Visual Rhythm Breather Element */}
        <div className="w-full flex justify-center py-[80px] md:py-[100px] bg-background">
          <div className="w-12 h-[1px] bg-accent/60"></div>
        </div>

        <Manifesto />
        <Services />
        <Process />

        <PhotoBreak
          image="/v3/coordination.jpg"
          alt="A couple exchanging vows surrounded by their wedding party"
        />

        <div id="investment" className="w-full h-[40vh] bg-primaryDark flex flex-col items-center justify-center text-center px-6">
          <div className="text-accent font-sans text-xs tracking-[0.2em] uppercase mb-6">The Details</div>
          <div className="w-16 h-[1px] bg-accent mb-8"></div>
          <h2 className="font-serif italic text-4xl md:text-5xl text-textDark">"Let's explore what's possible."</h2>
        </div>

        <InvestmentTiers onOpenQuiz={() => setShowQuiz(true)} />
        <Differentiators />
        <Testimonials />
        <AddOns />

        <PhotoBreak
          image="/v3/partial.jpg"
          alt="A garden wedding reception with lilac details"
        />

        <WhatHappensNext />
          <LeadCapture />
        </main>

        <Footer />
        </>
      )}
    </div>
  );
}

export default App;
