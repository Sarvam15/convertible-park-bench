import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navbar } from './components/Navbar';

gsap.registerPlugin(ScrollTrigger);
import { Preloader } from './components/Preloader';
import { FlowyBackground } from './components/FlowyBackground';
import { ExperienceCanvas } from './components/ExperienceCanvas';
import { HeroSection } from './components/HeroSection';
import { MotionStorySection } from './components/MotionStorySection';
import { EngineeringSection } from './components/EngineeringSection';
import { TransformationSection } from './components/TransformationSection';
import { SimulatorSection } from './components/SimulatorSection';
import { SpecsFooter } from './components/SpecsFooter';

export const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const narrativeTrackRef = useRef<HTMLDivElement | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis Smooth Scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 2.0,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const reqId = requestAnimationFrame(raf);

    // Track scroll position continuously relative to narrative height
    const handleScroll = (scrollPos?: number) => {
      if (!narrativeTrackRef.current) return;
      const trackHeight = narrativeTrackRef.current.offsetHeight;
      const windowH = window.innerHeight;
      const maxScroll = Math.max(1, trackHeight - windowH);
      const currentScroll = typeof scrollPos === 'number' ? scrollPos : window.scrollY;

      const p = Math.max(0, Math.min(1, currentScroll / maxScroll));
      setScrollProgress(p);
    };

    lenis.on('scroll', (e: { scroll: number }) => {
      handleScroll(e.scroll);
      ScrollTrigger.update();
    });

    window.addEventListener('scroll', () => handleScroll(), { passive: true });
    handleScroll();

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('scroll', () => handleScroll());
      lenis.destroy();
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el && lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: 0, duration: 1.5 });
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0d10] text-[#f4f4f6] relative">
      {/* Opening Studio Preloader */}
      {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}

      {/* Navigation Header */}
      <Navbar
        onScrollTo={scrollToSection}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(!isPaused)}
      />

      {/* Flowy Liquid Wave WebGL Background (Apekon aesthetic) */}
      <FlowyBackground scrollProgress={scrollProgress} />

      {/* Persistent WebGL Background Stage for Narrative Chapters */}
      <ExperienceCanvas
        scrollProgress={scrollProgress}
        isPaused={isPaused}
      />

      {/* Narrative Scroll Chapters Container */}
      <div ref={narrativeTrackRef} className="relative z-10 flex flex-col">
        <HeroSection 
          progress={scrollProgress} 
          onScrollDown={() => scrollToSection('motion')} 
          isReady={!isLoading}
        />
        <MotionStorySection progress={scrollProgress} />
        <EngineeringSection progress={scrollProgress} />
        <TransformationSection progress={scrollProgress} />
      </div>

      {/* Interactive 3D Configurator & Simulator (Bottom Viewport) */}
      <div className="relative z-20">
        <SimulatorSection />
        <SpecsFooter />
      </div>
    </div>
  );
};

export default App;
