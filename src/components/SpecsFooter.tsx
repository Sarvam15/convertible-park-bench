import React from 'react';
import { Download, FileCode, CheckCircle2, Compass, Layers, ShieldCheck } from 'lucide-react';
import { OrthographicViewer } from './OrthographicViewer';

export const SpecsFooter: React.FC = () => {
  return (
    <footer className="relative bg-[#08090b] border-t border-white/10 pt-20 pb-12 px-6 sm:px-12 text-white overflow-hidden">
      
      {/* Massive Background Watermark */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 select-none pointer-events-none opacity-[0.03] font-display font-black text-[18vw] leading-none whitespace-nowrap text-white">
        CONVERTIBLE BENCH
      </div>

      <div className="max-w-7xl mx-auto flex flex-col gap-14 relative z-10">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-studio-brass mb-2 block font-bold">
              CONVERTIBLE PARK BENCH · 1800 MM
            </span>
            <h3 className="font-display font-black text-3xl sm:text-5xl tracking-tight text-white">
              Architectural & CAD Assets Package
            </h3>
          </div>
          <p className="text-sm font-mono text-studio-muted max-w-md">
            Production-verified 3D digital models and original AutoCAD DWG engineering drawings (group_1_autoCAD.dwg) with sub-millimeter tolerances.
          </p>
        </div>

        {/* 1. Interactive Orthographic CAD Blueprint Viewer */}
        <OrthographicViewer />

        {/* 2. CAD Assets & Spec Cards 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Download 1: Original AutoCAD DWG */}
          <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 flex flex-col justify-between gap-6 shadow-xl hover:border-cyan-400 transition-all">
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono text-sm font-bold">
                DWG
              </div>
              <h4 className="font-display font-bold text-xl text-white">
                group_1_autoCAD.dwg
              </h4>
              <p className="text-xs text-studio-muted leading-relaxed">
                Original AutoCAD 2D & 3D DWG engineering drawing. Contains First-Angle orthographic projections, parametric dimensions, and structural steel layers.
              </p>
            </div>
            <a
              href="/assets/group_1_autoCAD.dwg"
              download="group_1_autoCAD.dwg"
              className="glass-button p-3.5 rounded-xl flex items-center justify-between group hover:border-cyan-400/50"
            >
              <span className="text-xs font-mono font-bold text-cyan-300 group-hover:text-white transition-colors">
                Download DWG (38.6 KB)
              </span>
              <Download className="w-4 h-4 text-cyan-400 group-hover:text-white transition-colors" />
            </a>
          </div>

          {/* Download 2: GLB Binary Model */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between gap-6 shadow-xl hover:border-studio-accent/50 transition-all">
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 rounded-2xl bg-studio-accent/20 border border-studio-accent/40 flex items-center justify-center text-studio-accent font-mono text-sm font-bold">
                GLB
              </div>
              <h4 className="font-display font-bold text-xl text-white">
                convertible_bench.glb
              </h4>
              <p className="text-xs text-studio-muted leading-relaxed">
                Binary container with embedded node hierarchy, rigged clevis pivot, and physically-based rendering (PBR) materials. Compatible with Rhino, Blender, and Unreal Engine.
              </p>
            </div>
            <a
              href="/models/convertible_bench.glb"
              download="convertible_bench.glb"
              className="glass-button p-3.5 rounded-xl flex items-center justify-between group hover:border-studio-accent/50"
            >
              <span className="text-xs font-mono font-bold text-white group-hover:text-studio-accent transition-colors">
                Download GLB (182 KB)
              </span>
              <Download className="w-4 h-4 text-studio-muted group-hover:text-white transition-colors" />
            </a>
          </div>

          {/* Download 3: GLTF JSON Scene Graph */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between gap-6 shadow-xl hover:border-studio-brass/50 transition-all">
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 rounded-2xl bg-studio-brass/20 border border-studio-brass/40 flex items-center justify-center text-studio-brass font-mono text-sm font-bold">
                GLTF
              </div>
              <h4 className="font-display font-bold text-xl text-white">
                convertible_bench.gltf
              </h4>
              <p className="text-xs text-studio-muted leading-relaxed">
                Human-readable JSON scene graph for procedural pipelines, WebGL asset loaders, and BIM integration. Derived with sub-millimeter tolerances.
              </p>
            </div>
            <a
              href="/models/convertible_bench.gltf"
              download="convertible_bench.gltf"
              className="glass-button p-3.5 rounded-xl flex items-center justify-between group hover:border-studio-brass/50"
            >
              <span className="text-xs font-mono font-bold text-white group-hover:text-studio-brass transition-colors">
                Download GLTF (292 KB)
              </span>
              <Download className="w-4 h-4 text-studio-muted group-hover:text-white transition-colors" />
            </a>
          </div>

          {/* Card 4: Engineering Standards & Credentials */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between gap-6 shadow-xl hover:border-emerald-500/50 transition-all">
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-mono text-sm font-bold">
                EN
              </div>
              <h4 className="font-display font-bold text-xl text-white">
                Engineering Compliance
              </h4>
              <div className="flex flex-col gap-2 pt-1 text-xs text-studio-muted">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>EN 12727 Level 4 Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>S275 Structural Steel</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>FSC-Certified Teak Wood</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>450 kg Static Uniform Load</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-mono text-white/70">
              1800 L × 850 D × 750 H (mm) · 140mm Gap
            </div>
          </div>

        </div>

        {/* Bottom Legal & Colophon */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-studio-muted">
          <div>
            © 2026 Convertible Park Bench · All Engineering & CAD Rights Reserved.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Three.js WebGL</span>
            <span>·</span>
            <span>AutoCAD DWG S275 Pipeline</span>
            <span>·</span>
            <span>GSAP ScrollTrigger</span>
            <span>·</span>
            <span>TypeScript + React</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
