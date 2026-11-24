import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Layers, Ruler } from 'lucide-react';

interface EngineeringSectionProps {
  progress?: number;
}

export const EngineeringSection: React.FC<EngineeringSectionProps> = ({ progress = 0 }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const cardsGridRef = useRef<HTMLDivElement | null>(null);
  const ledgerRef = useRef<HTMLDivElement | null>(null);

  // Active range: p = 0.40 -> 0.72
  const u = Math.min(1, Math.max(0, (progress - 0.38) / 0.32));
  const cardShift = (1 - u) * 25;

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (cardsGridRef.current) {
        gsap.fromTo(
          cardsGridRef.current.children,
          { opacity: 0, y: 45, rotateX: 12, scale: 0.96 },
          { opacity: 1, y: 0, rotateX: 0, scale: 1, stagger: 0.12, duration: 0.9, ease: 'power2.out' }
        );
      }
      if (ledgerRef.current) {
        gsap.fromTo(
          ledgerRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: 'power2.out' }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef}
      id="engineering" 
      className="relative min-h-screen flex flex-col justify-center px-6 sm:px-12 py-32 z-10 pointer-events-none transition-opacity duration-300 opacity-100"
    >
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-12">
        
        {/* Section Header */}
        <div 
          ref={headerRef}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 transition-transform duration-300"
          style={{ transform: `translate3d(0, ${cardShift * 0.35}px, 0)` }}
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-mono text-xs mb-3 font-bold shadow-lg">
              <Layers className="w-3.5 h-3.5" />
              <span>03 · EXPLODED ANATOMY & TOLERANCES</span>
            </div>
            <h2 className="font-display font-black text-4xl sm:text-6xl md:text-7xl tracking-tight text-white leading-tight drop-shadow-[0_8px_30px_rgba(0,0,0,0.85)]">
              EVERY COMPONENT, <br />
              <span className="text-gradient">ACCOUNTED FOR.</span>
            </h2>
          </div>
          <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/15 max-w-md shadow-xl">
            <p className="text-sm font-mono text-white/90 leading-relaxed font-medium">
              Every millimeter serves a functional imperative. From laser-cut steel gussets to weather-channelled timber joints, the bench is engineered for uncompromising stability in high-traffic civic environments.
            </p>
          </div>
        </div>

        {/* Blueprint Callouts Grid */}
        <div 
          ref={cardsGridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pointer-events-auto transition-transform duration-300"
          style={{ transform: `translate3d(0, ${cardShift}px, 0)` }}
        >
          {[
            {
              id: '01',
              title: 'Clevis Hinge & Cam Lever',
              specs: 'Dual-Ear Steel · 20mm Ø Pin',
              desc: 'High-tensile clevis bracket with integrated quick-release cam lever. Locks rigid at 0° (table) and -15° (bench) stops.',
              color: 'text-studio-accent'
            },
            {
              id: '02',
              title: 'C-Shaped Support Legs',
              specs: '50 x 50 x 3.2mm HSS Tube',
              desc: 'Continuous structural loop with mitered 45° welds and internal corner gussets for maximum torsion resistance.',
              color: 'text-cyan-400'
            },
            {
              id: '03',
              title: 'Quarter-Sawn Teak Slats',
              specs: '1800 x 100 x 32mm Planks',
              desc: '3 seat slats and 4 tabletop slats. Kiln-dried sustainably harvested teak with 18mm expansion drainage gaps.',
              color: 'text-studio-brass'
            },
            {
              id: '04',
              title: 'Ground Anchor Brackets',
              specs: '6mm Formed Plate · 4x M12 Bolts',
              desc: 'Electrostatic crimson powder-coated L-brackets securing runner feet to concrete or paved surfaces.',
              color: 'text-emerald-400'
            }
          ].map((item) => (
            <div 
              key={item.id}
              className="bg-black/80 backdrop-blur-xl p-6 rounded-2xl border border-white/20 flex flex-col justify-between gap-4 hover:border-cyan-400/60 transition-all hover:scale-[1.02] group shadow-2xl hover:bg-black/90"
            >
              <div className="flex justify-between items-center">
                <span className={`font-mono text-xs font-black tracking-wider ${item.color}`}>
                  PART {item.id}
                </span>
                <span className="text-[10px] font-mono text-white/80 font-bold bg-white/10 px-2 py-0.5 rounded-full border border-white/10">CAD CERTIFIED</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-display font-bold text-lg text-white group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>
                <span className="font-mono text-xs text-cyan-300 font-semibold">{item.specs}</span>
              </div>
              <p className="text-xs text-white/90 leading-relaxed font-normal">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CAD Blueprint Specification Table */}
        <div 
          ref={ledgerRef}
          className="bg-black/85 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/20 pointer-events-auto shadow-2xl"
        >
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/15">
            <div className="flex items-center gap-3">
              <Ruler className="w-5 h-5 text-studio-brass" />
              <span className="font-display font-bold text-base tracking-wide text-white uppercase">
                Engineering Specification Ledger (DWG Reference Sheet)
              </span>
            </div>
            <span className="font-mono text-xs text-cyan-400 font-bold bg-cyan-950/40 border border-cyan-500/40 px-3 py-1 rounded-full">
              TOLERANCE ±0.5MM
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <span className="block font-mono text-[10px] text-white/70 uppercase font-bold">Overall Length</span>
              <span className="block font-display text-2xl font-bold text-white mt-1">1800 mm</span>
              <span className="block font-mono text-[10px] text-white/60 font-medium">70.87 inches</span>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <span className="block font-mono text-[10px] text-white/70 uppercase font-bold">Tabletop Height</span>
              <span className="block font-display text-2xl font-bold text-studio-accent mt-1">750 mm</span>
              <span className="block font-mono text-[10px] text-white/60 font-medium">Work / Dining Mode</span>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <span className="block font-mono text-[10px] text-white/70 uppercase font-bold">Seat Height</span>
              <span className="block font-display text-2xl font-bold text-studio-brass mt-1">450 mm</span>
              <span className="block font-mono text-[10px] text-white/60 font-medium">Bench Seating Mode</span>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <span className="block font-mono text-[10px] text-white/70 uppercase font-bold">Runner Depth</span>
              <span className="block font-display text-2xl font-bold text-white mt-1">750 mm</span>
              <span className="block font-mono text-[10px] text-white/60 font-medium">850mm Plan Envelope</span>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <span className="block font-mono text-[10px] text-white/70 uppercase font-bold">Kinematic Arc</span>
              <span className="block font-display text-2xl font-bold text-cyan-400 mt-1">75° Arc</span>
              <span className="block font-mono text-[10px] text-white/60 font-medium">Eccentric Cam Lock</span>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <span className="block font-mono text-[10px] text-white/70 uppercase font-bold">Structural Mass</span>
              <span className="block font-display text-2xl font-bold text-emerald-400 mt-1">94 kg</span>
              <span className="block font-mono text-[10px] text-white/60 font-medium">Steel & Teak total</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
