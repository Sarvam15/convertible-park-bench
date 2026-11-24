import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { RotateCw, Check, Lock, Unlock, Play } from 'lucide-react';

interface TransformationSectionProps {
  progress?: number;
}

export const TransformationSection: React.FC<TransformationSectionProps> = ({ progress = 0 }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leftColRef = useRef<HTMLDivElement | null>(null);
  const phasesListRef = useRef<HTMLDivElement | null>(null);

  // Active range: p = 0.65 -> 0.98
  const u = Math.min(1, Math.max(0, (progress - 0.64) / 0.32));
  const cardShift = (1 - u) * 25;

  // Determine which phase is currently active in the 3D mechanism animation:
  // u in [0.0..0.25]: Phase 1 (Cam Lever Release)
  // u in [0.25..0.50]: Phase 2 (Eccentric Pivot Sweep)
  // u in [0.50..0.75]: Phase 3 (Positive Stop)
  // u in [0.75..1.00]: Phase 4 (Cam Clamp Lock Down)
  const activePhase = Math.min(3, Math.floor(u * 4));

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (leftColRef.current && phasesListRef.current) {
        gsap.fromTo(
          leftColRef.current.children,
          { opacity: 0, x: -35 },
          { opacity: 1, x: 0, stagger: 0.1, duration: 0.8, ease: 'power2.out' }
        );
        gsap.fromTo(
          phasesListRef.current.children,
          { opacity: 0, x: 45, scale: 0.96 },
          { opacity: 1, x: 0, scale: 1, stagger: 0.12, duration: 0.9, ease: 'back.out(1.2)' }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef}
      id="transformation" 
      className="relative min-h-screen flex flex-col justify-center px-6 sm:px-12 py-32 z-10 pointer-events-none transition-opacity duration-300 opacity-100"
    >
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column (5 cols) */}
        <div 
          ref={leftColRef}
          className="lg:col-span-5 flex flex-col gap-6 transition-transform duration-300"
          style={{ transform: `translate3d(0, ${cardShift * 0.4}px, 0)` }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-studio-accent/20 border border-studio-accent/40 text-studio-accent font-mono text-xs w-max font-bold shadow-lg">
            <RotateCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
            <span>04 · THE TRANSFORMATION MECHANISM</span>
          </div>

          <h2 className="font-display font-black text-4xl sm:text-6xl md:text-7xl tracking-tight leading-[0.98] text-white drop-shadow-[0_8px_30px_rgba(0,0,0,0.85)]">
            UNFOLDS IN A <br />
            <span className="text-gradient">SINGLE MOTION.</span>
          </h2>

          <div className="bg-black/60 backdrop-blur-md p-5 rounded-2xl border border-white/15 shadow-2xl">
            <p className="text-base sm:text-lg text-white font-medium leading-relaxed drop-shadow">
              The transformation relies on a patented eccentric clevis hinge paired with an over-center cam clamp. By releasing the crimson lever, the backrest sweeps along a balanced 75-degree arc, settling immovably into a level work surface. Machined internal stops arrest the descent at exactly 750mm, while an engineered clearance gap ensures zero finger pinch zones.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pointer-events-auto">
            <div className="bg-black/70 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center gap-3 hover:border-studio-accent/50 transition-colors shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-studio-accent/25 border border-studio-accent/50 flex items-center justify-center text-studio-accent font-display text-lg font-bold flex-shrink-0 shadow-md">
                75°
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Work Table Arc</h4>
                <p className="text-[11px] text-white/80 font-medium">Backrest to 750mm table</p>
              </div>
            </div>

            <div className="bg-black/70 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center gap-3 hover:border-studio-brass/50 transition-colors shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-studio-brass/25 border border-studio-brass/50 flex items-center justify-center text-studio-brass font-display text-lg font-bold flex-shrink-0 shadow-md">
                163°
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Extra Seating Arc</h4>
                <p className="text-[11px] text-white/80 font-medium">Unfolds flat at 750mm</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Mechanical Phases (7 cols) */}
        <div 
          ref={phasesListRef}
          className="lg:col-span-7 flex flex-col gap-4 pointer-events-auto transition-transform duration-300"
          style={{ transform: `translate3d(0, ${cardShift}px, 0)` }}
        >
          {[
            {
              step: 'PHASE 01',
              title: 'Cam Lever Release',
              icon: Unlock,
              desc: 'Lifting the ergonomic over-center lever disengages the internal friction disc with a tactile, positive mechanical release.',
              tag: '1.2 kN Clamping Release'
            },
            {
              step: 'PHASE 02',
              title: 'Guided Kinematic Arc',
              icon: Play,
              desc: 'The counterbalanced backrest assembly glides effortlessly along its geometric path, clearing the seat with zero pinch points.',
              tag: 'Counterbalanced Sweep'
            },
            {
              step: 'PHASE 03',
              title: 'Positive Horizontal Stop',
              icon: Check,
              desc: 'Internal CNC-machined steel stops arrest the descent at exactly 750mm, instantly establishing a true horizontal tabletop.',
              tag: '750mm Table Height'
            },
            {
              step: 'PHASE 04',
              title: 'Over-Center Clamp Lock',
              icon: Lock,
              desc: 'The cam lever snaps flush into its locked detent, mechanically securing the table against uplift, wobble, or heavy asymmetric outdoor loads.',
              tag: 'Full Rigidity Achieved'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            const isHighlighted = idx === activePhase;
            return (
              <div
                key={item.step}
                className={`p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 group shadow-2xl backdrop-blur-xl ${
                  isHighlighted 
                    ? 'border-studio-accent bg-studio-accent/20 shadow-studio-accent/30 scale-[1.02]' 
                    : 'bg-black/75 border-white/20 hover:border-white/40 hover:bg-black/85'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all flex-shrink-0 shadow-lg ${
                    isHighlighted 
                      ? 'bg-studio-accent text-white border-studio-accent shadow-studio-accent/50' 
                      : 'bg-white/10 border-white/20 text-white'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-white/70 uppercase tracking-wider font-bold">
                        {item.step}
                      </span>
                      <span className={`font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isHighlighted
                          ? 'bg-studio-accent/30 text-white border-studio-accent/50'
                          : 'bg-white/10 text-white/90 border-white/20'
                      }`}>
                        {item.tag}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-lg text-white mt-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-white/90 font-medium mt-1 max-w-lg leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
