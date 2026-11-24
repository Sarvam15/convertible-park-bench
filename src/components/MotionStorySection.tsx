import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { RefreshCcw } from 'lucide-react';

interface MotionStorySectionProps {
  progress?: number;
}

export const MotionStorySection: React.FC<MotionStorySectionProps> = ({ progress = 0 }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leftColRef = useRef<HTMLDivElement | null>(null);
  const rightColRef = useRef<HTMLDivElement | null>(null);

  // Section active range: p = 0.20 -> 0.50
  const u = Math.min(1, Math.max(0, (progress - 0.18) / 0.30));
  const cardTranslateY = (1 - u) * 25;
  const leftShiftX = (1 - u) * -20;
  const rightShiftX = (1 - u) * 20;

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (leftColRef.current && rightColRef.current) {
        gsap.fromTo(
          leftColRef.current.children,
          { opacity: 0, x: -40 },
          { opacity: 1, x: 0, stagger: 0.1, duration: 0.9, ease: 'power2.out' }
        );
        gsap.fromTo(
          rightColRef.current.children,
          { opacity: 0, x: 50, scale: 0.96 },
          { opacity: 1, x: 0, scale: 1, stagger: 0.15, duration: 1.0, ease: 'back.out(1.2)' }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef}
      id="motion" 
      className="relative min-h-screen flex flex-col justify-center px-6 sm:px-12 py-32 z-10 pointer-events-none transition-opacity duration-300 opacity-100"
    >
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Editorial Narrative (6 cols) */}
        <div 
          ref={leftColRef}
          className="lg:col-span-6 flex flex-col gap-6 transition-transform duration-300"
          style={{ transform: `translate3d(${leftShiftX}px, ${cardTranslateY * 0.4}px, 0)` }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-studio-brass/20 border border-studio-brass/40 text-studio-brass font-mono text-xs w-max font-bold shadow-lg">
            <RefreshCcw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
            <span>02 · ADAPTIVE CIVIC ARCHITECTURE</span>
          </div>

          <h2 className="font-display font-black text-4xl sm:text-6xl md:text-7xl tracking-tight leading-[0.98] text-white drop-shadow-[0_8px_30px_rgba(0,0,0,0.85)]">
            <span>ONE STRUCTURE.</span> <br />
            <span className="text-gradient">TWO CIVIC MODES.</span>
          </h2>

          <div className="bg-black/60 backdrop-blur-md p-5 rounded-2xl border border-white/15 shadow-2xl max-w-lg">
            <p className="text-base sm:text-lg text-white font-medium leading-relaxed drop-shadow">
              Public spaces demand versatility without visual clutter. Most convertible furniture relies on complex origami or separate components that get lost or vandalized. This design achieves complete metamorphosis in one clean, counterbalanced gesture—switching smoothly between solitary back-supported seating and an expansive collaborative tabletop.
            </p>
          </div>

          <div className="flex flex-col gap-4 pt-4 border-t border-white/15 max-w-md">
            <div className="flex items-start gap-3 bg-black/40 backdrop-blur-sm p-3.5 rounded-xl border border-white/10">
              <span className="w-6 h-6 rounded-full bg-studio-accent/25 border border-studio-accent/50 flex items-center justify-center text-xs font-mono text-studio-accent font-bold mt-0.5 flex-shrink-0">
                01
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">Ground-Anchored Balance</h4>
                <p className="text-xs text-white/80 font-medium leading-relaxed mt-0.5">
                  The center of mass remains locked within the 850mm floor footprint whether occupied by an individual reading in the sun or six people sharing a communal meal.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-black/40 backdrop-blur-sm p-3.5 rounded-xl border border-white/10">
              <span className="w-6 h-6 rounded-full bg-studio-brass/25 border border-studio-brass/50 flex items-center justify-center text-xs font-mono text-studio-brass font-bold mt-0.5 flex-shrink-0">
                02
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">Open Cantilever Corridor</h4>
                <p className="text-xs text-white/80 font-medium leading-relaxed mt-0.5">
                  A continuous C-shaped structural loop eliminates interior legs and diagonal floor braces, leaving an unobstructed corridor for effortless entry with zero knee-bumping.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Floating Specs Cards (Depth Parallax Layer) */}
        <div 
          ref={rightColRef}
          className="lg:col-span-6 flex flex-col items-end gap-5 pointer-events-auto transition-transform duration-300"
          style={{ transform: `translate3d(${rightShiftX}px, ${cardTranslateY}px, 0)` }}
        >
          <div className="bg-black/80 backdrop-blur-xl p-6 rounded-3xl border border-white/20 max-w-sm w-full flex flex-col gap-3 shadow-2xl hover:border-studio-brass/50 transition-all hover:scale-[1.02]">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-white/60 font-semibold">TRANSFORMATION SPEED</span>
              <span className="text-studio-brass font-black">1-SECOND GESTURE</span>
            </div>
            <div className="text-2xl font-display font-bold text-white">
              Instant Adaptability
            </div>
            <p className="text-xs text-white/85 font-medium leading-relaxed">
              No tools, loose pins, or auxiliary leaves. An intuitive lift of the over-center cam lever frees the backrest to swing forward and lock into a rigid 750mm table with absolute stability.
            </p>
          </div>

          <div className="bg-black/80 backdrop-blur-xl p-6 rounded-3xl border border-white/20 max-w-sm w-full flex flex-col gap-3 shadow-2xl hover:border-emerald-500/50 transition-all hover:scale-[1.02]">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-white/60 font-semibold">STRUCTURAL INTEGRITY</span>
              <span className="text-emerald-400 font-black">450 KG STATIC LOAD</span>
            </div>
            <div className="text-2xl font-display font-bold text-white">
              Monolithic Rigidity
            </div>
            <p className="text-xs text-white/85 font-medium leading-relaxed">
              Engineered to exceed European EN 12727 public furniture endurance standards. Heavy-gauge 50x50mm structural steel tubing withstands asymmetric torsional loads without play or flex.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
