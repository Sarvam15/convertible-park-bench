import React, { useState } from 'react';
import { 
  FileCode, Download, ZoomIn, ZoomOut, RotateCcw, 
  Maximize2, Eye, Compass, Layers, CheckCircle2, X
} from 'lucide-react';

export type DiagramTab = 'sheet' | 'wireframe' | 'schematic';

export const OrthographicViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DiagramTab>('sheet');
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(2.5, z + 0.25));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.75, z - 0.25));
  const handleResetZoom = () => setZoomLevel(1.0);

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Header and Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-cyan-400 font-bold block">
              AUTOCAD DWG ENGINEERING DRAWING
            </span>
            <h3 className="font-display font-bold text-lg sm:text-xl text-white">
              Orthographic Projections & 3D Wireframe Viewer
            </h3>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10">
            <button
              onClick={() => setActiveTab('sheet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'sheet'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                  : 'text-studio-muted hover:text-white'
              }`}
            >
              Orthographic Drawing Sheet
            </button>
            <button
              onClick={() => setActiveTab('wireframe')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'wireframe'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                  : 'text-studio-muted hover:text-white'
              }`}
            >
              3D Wireframe CAD
            </button>
            <button
              onClick={() => setActiveTab('schematic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'schematic'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                  : 'text-studio-muted hover:text-white'
              }`}
            >
              First-Angle Projections
            </button>
          </div>

          <a
            href="/assets/group_1_autoCAD.dwg"
            download="group_1_autoCAD.dwg"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-studio-brass/20 border border-studio-brass/40 text-studio-brass hover:bg-studio-brass/30 text-xs font-mono font-bold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download DWG (38 KB)</span>
          </a>
        </div>
      </div>

      {/* Main Blueprint Viewport Stage */}
      <div className="relative w-full h-[480px] sm:h-[580px] rounded-3xl overflow-hidden bg-[#070b12] border-2 border-cyan-500/30 shadow-2xl flex items-center justify-center group select-none">
        
        {/* Subtle CAD Coordinate Grid Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(6, 182, 212, 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(6, 182, 212, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Viewport Top HUD Overlays */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-1 bg-black/75 backdrop-blur-md px-3.5 py-2 rounded-xl border border-cyan-500/30">
          <span className="font-mono text-[9px] text-cyan-400 uppercase tracking-widest font-bold">
            DRAWING SHEET NO. DWG-2026-REV2
          </span>
          <span className="font-mono text-xs text-white font-bold">
            {activeTab === 'sheet' && 'Full Orthographic Production Sheet (Elevation · Plan · Profile)'}
            {activeTab === 'wireframe' && 'Isometric 3D AutoCAD Solid Wireframe Model'}
            {activeTab === 'schematic' && 'Standard First-Angle Orthographic Projection Diagram'}
          </span>
          <span className="font-mono text-[10px] text-studio-muted">
            SCALE: 1:10 · METRIC (MM) · FIRST-ANGLE SYSTEM
          </span>
        </div>

        {/* Viewport Controls HUD (Zoom & Fullscreen) */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-black/75 backdrop-blur-md p-1.5 rounded-xl border border-white/15">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-5 bg-white/20 mx-1" />
          <button
            onClick={() => setIsFullscreen(true)}
            className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 flex items-center justify-center transition-colors"
            title="Inspect Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Indicator Pill */}
        <div className="absolute bottom-4 left-4 z-20 font-mono text-[10px] text-cyan-300 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-500/30">
          ZOOM: {Math.round(zoomLevel * 100)}%
        </div>

        {/* Bottom CAD Title Block (Corner Stamp) */}
        <div className="absolute bottom-4 right-4 z-20 hidden sm:flex flex-col bg-black/85 backdrop-blur-md p-3 rounded-xl border border-cyan-500/40 text-right font-mono text-[9px] text-cyan-400/90 leading-tight">
          <span className="font-bold text-white text-[11px]">PROJECT: CONVERTIBLE PARK BENCH</span>
          <span>DWG FILE: group_1_autoCAD.dwg (38.6 KB)</span>
          <span>MATERIAL: S275 STEEL & QUARTER-SAWN TEAK</span>
          <span className="text-emerald-400 font-bold">140 MM ERGONOMIC CLEARANCE GAP · VERIFIED</span>
        </div>

        {/* Image Display Surface with Smooth Zoom */}
        <div 
          className="relative max-w-full max-h-full transition-transform duration-200 ease-out flex items-center justify-center p-4 overflow-hidden"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {activeTab === 'sheet' && (
            <img
              src="/assets/cad_orthographic_sheet.png"
              alt="AutoCAD Orthographic Engineering Drawing Sheet"
              className="max-w-[90%] max-h-[460px] sm:max-h-[520px] object-contain rounded-lg border border-cyan-500/30 shadow-2xl filter drop-shadow-[0_10px_20px_rgba(6,182,212,0.15)]"
            />
          )}

          {activeTab === 'wireframe' && (
            <img
              src="/assets/cad_3d_wireframe.png"
              alt="3D AutoCAD Wireframe Engineering Model"
              className="max-w-[90%] max-h-[460px] sm:max-h-[520px] object-contain rounded-lg border border-cyan-500/30 shadow-2xl filter drop-shadow-[0_10px_20px_rgba(6,182,212,0.15)]"
            />
          )}

          {activeTab === 'schematic' && (
            <div className="w-full max-w-4xl p-6 rounded-2xl bg-black/80 border border-cyan-500/40 flex flex-col gap-6 font-mono">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Elevation View Schematic Box */}
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs text-cyan-400 font-bold">
                    <span>FRONT ELEVATION</span>
                    <span>1800 MM</span>
                  </div>
                  <div className="h-32 border-2 border-dashed border-cyan-500/40 rounded-lg flex flex-col items-center justify-center relative p-2">
                    <span className="text-[10px] text-white/90 font-bold">3x Slats (1800 x 95 x 32 mm)</span>
                    <div className="w-full h-1 bg-cyan-400 my-1" />
                    <span className="text-[10px] text-studio-brass font-bold">C-Frame Legs (1300 mm Span)</span>
                  </div>
                  <span className="text-[10px] text-studio-muted">Height: 450 mm Seat · 750 mm Tabletop</span>
                </div>

                {/* Plan View Schematic Box */}
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs text-cyan-400 font-bold">
                    <span>TOP PLAN VIEW</span>
                    <span>850 MM TOTAL</span>
                  </div>
                  <div className="h-32 border-2 border-dashed border-cyan-500/40 rounded-lg flex flex-col items-center justify-around relative p-2">
                    <span className="text-[10px] text-emerald-400 font-bold">Front Seat (Z = +100 to +340 mm)</span>
                    <div className="w-full py-0.5 px-2 bg-emerald-500/20 border border-emerald-500/40 rounded text-center text-[9px] text-emerald-300 font-bold">
                      140 MM NON-OVERLAPPING CLEARANCE GAP
                    </div>
                    <span className="text-[10px] text-cyan-300 font-bold">Rear Surface (Z = -380 to -100 mm)</span>
                  </div>
                  <span className="text-[10px] text-studio-muted">Zero plan overlap in table & extra seating</span>
                </div>

                {/* End Section Profile Schematic Box */}
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs text-cyan-400 font-bold">
                    <span>END PROFILE</span>
                    <span>75° TRANSFORM</span>
                  </div>
                  <div className="h-32 border-2 border-dashed border-cyan-500/40 rounded-lg flex flex-col items-center justify-center relative p-2 text-center">
                    <span className="text-[10px] text-rose-400 font-bold">Clevis Pin Hinge (20mm Ø)</span>
                    <span className="text-[10px] text-white/90">Over-Center Cam Locking Lever</span>
                    <span className="text-[10px] text-cyan-400 mt-1">Slats Fold Inward (+75°)</span>
                  </div>
                  <span className="text-[10px] text-studio-muted">Base Runner: 850mm Floor Anchored</span>
                </div>

              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-studio-muted pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-white">AutoCAD 2026 Compatible Format</span>
                </div>
                <div className="flex items-center gap-4 text-[11px]">
                  <span>LAYER: 0_STRUCTURE</span>
                  <span>·</span>
                  <span>LAYER: WOOD_SLATS</span>
                  <span>·</span>
                  <span>LAYER: HARDWARE</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col p-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Compass className="w-5 h-5 text-cyan-400" />
              <span className="font-mono text-sm text-white font-bold">
                AutoCAD DWG Inspection Lightbox · group_1_autoCAD.dwg
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/assets/group_1_autoCAD.dwg"
                download="group_1_autoCAD.dwg"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-studio-brass/20 text-studio-brass border border-studio-brass/40 text-xs font-mono font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download DWG</span>
              </a>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            <img
              src={activeTab === 'wireframe' ? '/assets/cad_3d_wireframe.png' : '/assets/cad_orthographic_sheet.png'}
              alt="CAD Blueprint Fullscreen"
              className="max-w-full max-h-full object-contain rounded-xl border border-cyan-500/30"
            />
          </div>
        </div>
      )}

    </div>
  );
};
