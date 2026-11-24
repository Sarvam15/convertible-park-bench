import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowDown, Box, ShieldCheck, Compass, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  progress?: number;
  onScrollDown: () => void;
  isReady?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ progress = 0, onScrollDown, isReady = true }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleRef = useRef<HTMLDivElement | null>(null);
  const pillsRef = useRef<HTMLDivElement | null>(null);
  const badgeRef = useRef<HTMLDivElement | null>(null);

  // Cinematic Entrance triggered right as preloader aperture transition completes
  useEffect(() => {
    if (!isReady) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: -25 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.15 }
      )
      .fromTo(
        titleRef.current?.children || [],
        { opacity: 0, y: 80, rotateX: 30, transformOrigin: '0% 50% -50' },
        { opacity: 1, y: 0, rotateX: 0, stagger: 0.14, duration: 1.15 },
        '-=0.4'
      )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.95 },
        '-=0.6'
      )
      .fromTo(
        pillsRef.current?.children || [],
        { opacity: 0, scale: 0.85, y: 25 },
        { opacity: 1, scale: 1, y: 0, stagger: 0.08, duration: 0.7, ease: 'back.out(1.4)' },
        '-=0.5'
      );
    }, containerRef);

    return () => ctx.revert();
  }, [isReady]);

  // Dynamic Differential Parallax based on continuous scroll progress
  const pClamped = Math.min(1, Math.max(0, progress / 0.22));
  const translateY = pClamped * -130;
  const titleY = pClamped * -60;
  const subtitleY = pClamped * -30;
  const opacity = Math.max(0, 1 - pClamped * 1.4);
  const scale = 1 - pClamped * 0.04;

  return (
    <section 
      ref={containerRef}
      id="hero" 
      className="relative min-h-screen flex flex-col justify-between p-6 sm:p-12 z-10 pointer-events-none transition-transform will-change-transform"
      style={{
        transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
        opacity,
      }}
    >
      
      {/* Top Status (Clean, uncluttered - metadata pills removed) */}
      <div 
        ref={badgeRef}
        className="pt-20 flex items-center justify-between max-w-7xl mx-auto w-full"
      >
        <div className="flex items-center gap-2.5 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-studio-accent animate-ping" />
          <span className="font-mono text-xs text-white uppercase tracking-widest font-bold">
            CONVERTIBLE PARK BENCH // CAD PROTOTYPE
          </span>
        </div>
      </div>

      {/* Center Editorial Composition */}
      <div className="max-w-7xl mx-auto w-full my-auto py-12 flex flex-col gap-6">
        
        {/* Spatial Depth Text Layer 1 */}
        <div 
          className="flex flex-col select-none"
          style={{ transform: `translate3d(0, ${titleY}px, 0)` }}
        >
          <span className="font-mono text-xs uppercase tracking-widest text-studio-brass mb-3 font-bold flex items-center gap-2 drop-shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-studio-brass" />
            <span>01 · THE REVEAL</span>
          </span>
          <h1 
            ref={titleRef}
            className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight leading-[0.92] text-white perspective-[1000px] drop-shadow-[0_8px_30px_rgba(0,0,0,0.85)]"
          >
            <span className="block drop-shadow-2xl">CONVERTIBLE</span>
            <span className="block text-gradient">PARK BENCH.</span>
            <span className="block text-studio-brass drop-shadow-2xl italic font-normal text-4xl sm:text-6xl md:text-7xl mt-2">
              SEAT TO TABLE.
            </span>
          </h1>
        </div>

        {/* Narrative Subtitle & Specs Row */}
        <div 
          ref={subtitleRef}
          className="max-w-xl flex flex-col gap-5 mt-4"
          style={{ transform: `translate3d(0, ${subtitleY}px, 0)` }}
        >
          <div className="bg-black/60 backdrop-blur-md p-5 rounded-2xl border border-white/15 shadow-2xl">
            <p className="text-base sm:text-lg text-white font-medium leading-relaxed drop-shadow">
              Designed for modern civic plazas, university campuses, and public landscapes, this convertible bench bridges the divide between solitary rest and communal gathering. In a single, balanced gesture, an ergonomic park bench unfolds into an expansive communal table—crafted in architectural steel and quarter-sawn teak for a fifty-year lifespan.
            </p>
          </div>

          {/* Quick Technical Dimension Pills */}
          <div ref={pillsRef} className="flex flex-wrap gap-2 pointer-events-auto">
            <span className="glass-panel px-4 py-2 rounded-full text-xs font-mono text-white font-semibold border border-white/20 bg-black/60 flex items-center gap-2 shadow-xl hover:border-studio-accent/50 transition-colors">
              <Box className="w-3.5 h-3.5 text-studio-accent" />
              <span>1800 mm Civic Span</span>
            </span>
            <span className="glass-panel px-4 py-2 rounded-full text-xs font-mono text-white font-semibold border border-white/20 bg-black/60 flex items-center gap-2 shadow-xl hover:border-studio-brass/50 transition-colors">
              <ShieldCheck className="w-3.5 h-3.5 text-studio-brass" />
              <span>450 mm Ergonomic Seat</span>
            </span>
            <span className="glass-panel px-4 py-2 rounded-full text-xs font-mono text-white font-semibold border border-white/20 bg-black/60 flex items-center gap-2 shadow-xl hover:border-cyan-400/50 transition-colors">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>750 mm Communal Table</span>
            </span>
          </div>
        </div>

      </div>

      {/* Bottom Scroll Indicator Deck (Uncluttered - right metadata removed) */}
      <div className="max-w-7xl mx-auto w-full pb-8 flex items-center justify-between text-xs font-mono text-studio-muted">
        <button
          onClick={onScrollDown}
          className="pointer-events-auto flex items-center gap-3 glass-button px-6 py-3 rounded-full hover:text-white group border border-white/20 shadow-2xl hover:border-studio-accent/60 bg-black/60 backdrop-blur-md transition-all cursor-pointer"
        >
          <span className="tracking-wider uppercase font-bold text-xs text-white">Explore Mechanical Transformation</span>
          <ArrowDown className="w-4 h-4 text-studio-accent group-hover:translate-y-1 transition-transform" />
        </button>
      </div>

    </section>
  );
};
